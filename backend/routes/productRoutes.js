const express = require('express');
const router = express.Router();
const Product = require('../models/ProductModel');
const { upload, deleteImageFile } = require('../middleware/uploadMiddleware');

// READ (Get all products)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// CREATE (Add a new product, with an optional image)
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, category, price } = req.body;
        const image = req.file ? `/uploads/products/${req.file.filename}` : '';
        const product = await Product.create({ name, category, price, image });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: 'Invalid product data' });
    }
});

// UPDATE (Edit an existing product; replace or remove its image)
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, category, price, removeImage } = req.body;
        const updateData = { name, category, price };
        const existing = await Product.findById(req.params.id);

        if (req.file) {
            updateData.image = `/uploads/products/${req.file.filename}`;
            if (existing?.image) deleteImageFile(existing.image);
        } else if (removeImage === 'true') {
            updateData.image = '';
            if (existing?.image) deleteImageFile(existing.image);
        }

        const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: 'Error updating product' });
    }
});

// DELETE (Remove a product and its image file, if any)
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.image) deleteImageFile(product.image);
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
});

module.exports = router;