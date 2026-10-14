import express from 'express';

const router = express.Router();

// Pizza menu data
const pizzaData = {
  bases: [
    { name: 'Thin Crust', price: 50 },
    { name: 'Regular Crust', price: 60 },
    { name: 'Thick Crust', price: 70 },
    { name: 'Cheese Burst', price: 100 },
    { name: 'Wheat Crust', price: 80 }
  ],
  sauces: [
    { name: 'Marinara', price: 20 },
    { name: 'Pesto', price: 30 },
    { name: 'BBQ', price: 25 },
    { name: 'Alfredo', price: 35 },
    { name: 'Spicy Red', price: 25 }
  ],
  cheeses: [
    { name: 'Mozzarella', price: 40 },
    { name: 'Cheddar', price: 45 },
    { name: 'Parmesan', price: 50 },
    { name: 'Vegan Cheese', price: 60 }
  ],
  vegetables: [
    { name: 'Onions', price: 10 },
    { name: 'Tomatoes', price: 10 },
    { name: 'Bell Peppers', price: 15 },
    { name: 'Mushrooms', price: 20 },
    { name: 'Olives', price: 15 },
    { name: 'Jalapeños', price: 15 },
    { name: 'Corn', price: 10 },
    { name: 'Spinach', price: 15 }
  ]
};

// @route   GET /api/pizzas/menu
// @desc    Get pizza menu options
// @access  Public
router.get('/menu', (req, res) => {
  res.json(pizzaData);
});

export default router;
