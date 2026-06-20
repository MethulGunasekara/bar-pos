const express = require('express');
const router = express.Router();
const Product = require('../models/ProductModel');

// READ (Get all products)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// CREATE (Add a new product)
router.post('/', async (req, res) => {
    try {
        const { name, category, price } = req.body;
        const product = await Product.create({ name, category, price });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: 'Invalid product data' });
    }
});

// UPDATE (Edit an existing product)
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: 'Error updating product' });
    }
});

// DELETE (Remove a product)
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
});

module.exports = router;