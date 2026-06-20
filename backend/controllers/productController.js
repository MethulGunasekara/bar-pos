const Product = require('../models/ProductModel');

// @desc    Get all active products for the POS
// @route   GET /api/products
// @access  Public (for the POS terminal)
const getProducts = async (req, res) => {
    try {
        // Only fetch products that are currently active
        const products = await Product.find({ isActive: true });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching menu items' });
    }
};

module.exports = {
    getProducts
};