import Inventory from '../models/Inventory.model.js';
import mongoose from 'mongoose';
import { realtimeDb } from '../db/realtimeDb.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Public / Admin
export const getAllInventory = async (req, res) => {
  try {
    const items = realtimeDb.getAllInventory();
    res.json(items);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error fetching inventory' });
  }
};

// @route   GET /api/inventory/:id
// @desc    Get single inventory item
// @access  Public / Admin
export const getInventoryItem = async (req, res) => {
  try {
    const items = realtimeDb.getAllInventory();
    const item = items.find(i => i._id === req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({ message: 'Server error fetching inventory item' });
  }
};

// @route   PUT /api/inventory/:id
// @desc    Update inventory stock in real time
// @access  Public / Admin
export const updateInventoryStock = async (req, res) => {
  try {
    const { stock } = req.body;
    if (stock === undefined) {
      return res.status(400).json({ message: 'Stock value required' });
    }

    const item = realtimeDb.updateInventoryStock(req.params.id, stock);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (isDbConnected()) {
      try {
        await Inventory.findByIdAndUpdate(req.params.id, {
          stock,
          lastRestocked: Date.now()
        });
      } catch (e) {
        console.warn('MongoDB inventory sync warning:', e.message);
      }
    }

    res.json({
      message: 'Inventory updated successfully in real time',
      item
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ message: 'Server error updating inventory' });
  }
};

// @route   POST /api/inventory
// @desc    Create new inventory item
// @access  Private (Admin)
export const createInventoryItem = async (req, res) => {
  try {
    const { category, name, stock, unit, threshold, price } = req.body;

    const newItem = {
      _id: `inv_${Date.now()}`,
      category,
      name,
      stock: Number(stock || 0),
      unit: unit || 'units',
      threshold: Number(threshold || 10),
      price: Number(price || 0)
    };

    realtimeDb.data.inventory.push(newItem);
    realtimeDb.saveToDisk();

    if (isDbConnected()) {
      try {
        await Inventory.create(newItem);
      } catch (e) {}
    }

    res.status(201).json({
      message: 'Inventory item created successfully',
      item: newItem
    });
  } catch (error) {
    console.error('Create inventory error:', error);
    res.status(500).json({ message: 'Server error creating inventory item' });
  }
};

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private (Admin)
export const deleteInventoryItem = async (req, res) => {
  try {
    realtimeDb.data.inventory = realtimeDb.data.inventory.filter(i => i._id !== req.params.id);
    realtimeDb.saveToDisk();

    if (isDbConnected()) {
      try {
        await Inventory.findByIdAndDelete(req.params.id);
      } catch (e) {}
    }

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({ message: 'Server error deleting inventory item' });
  }
};

// @route   GET /api/inventory/category/:category
// @desc    Get inventory by category
// @access  Public
export const getInventoryByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const items = realtimeDb.getInventoryByCategory(category);
    res.json(items);
  } catch (error) {
    console.error('Get inventory by category error:', error);
    res.status(500).json({ message: 'Server error fetching inventory' });
  }
};
