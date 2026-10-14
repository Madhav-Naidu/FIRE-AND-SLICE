import Inventory from '../models/Inventory.model.js';
import Admin from '../models/Admin.model.js';
import { sendLowStockAlert } from './email.service.js';

// Check inventory levels and send alerts
export const checkInventoryLevels = async () => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$stock', '$threshold'] }
    });

    if (lowStockItems.length > 0) {
      console.log(`⚠️ Found ${lowStockItems.length} low stock items`);

      // Get admin email(s)
      const admins = await Admin.find();

      for (const admin of admins) {
        await sendLowStockAlert(admin.email, lowStockItems);
      }
    }

    return lowStockItems;
  } catch (error) {
    console.error('Error checking inventory levels:', error);
    throw error;
  }
};

// Deduct inventory after order
export const deductInventory = async (pizza) => {
  try {
    // Deduct base
    await Inventory.findOneAndUpdate(
      { name: pizza.base, category: 'base' },
      { $inc: { stock: -1 } }
    );

    // Deduct sauce
    await Inventory.findOneAndUpdate(
      { name: pizza.sauce, category: 'sauce' },
      { $inc: { stock: -1 } }
    );

    // Deduct cheese
    await Inventory.findOneAndUpdate(
      { name: pizza.cheese, category: 'cheese' },
      { $inc: { stock: -1 } }
    );

    // Deduct vegetables
    for (const vegetable of pizza.vegetables) {
      await Inventory.findOneAndUpdate(
        { name: vegetable, category: 'vegetable' },
        { $inc: { stock: -1 } }
      );
    }

    console.log('✅ Inventory deducted for order');
  } catch (error) {
    console.error('Error deducting inventory:', error);
    throw error;
  }
};
