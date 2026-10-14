import express from 'express';
import {
  getAllInventory,
  getInventoryItem,
  updateInventoryStock,
  createInventoryItem,
  deleteInventoryItem,
  getInventoryByCategory
} from '../controllers/inventory.controller.js';

const router = express.Router();

// Public read routes
router.get('/', getAllInventory);
router.get('/category/:category', getInventoryByCategory);
router.get('/:id', getInventoryItem);

// Stock updates & operations
router.put('/:id', updateInventoryStock);
router.post('/', createInventoryItem);
router.delete('/:id', deleteInventoryItem);

export default router;
