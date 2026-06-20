const Order = require('../models/OrderModel');

// @desc    Submit a completed transaction
// @route   POST /api/orders
// @access  Public (Will be protected by JWT later)
const createOrder = async (req, res) => {
    try {
        // 1. Grab exactly what the Model expects
        const { orderItems, paymentMethod, total } = req.body;

        // 2. Validate
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No items provided in the order' });
        }

        // 3. Build the order strictly matching the Schema
        const order = new Order({
            orderItems,
            paymentMethod,
            total
        });

        // 4. Save to DB
        const savedOrder = await order.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error("Database Save Error:", error);
        res.status(500).json({ message: 'Server Error saving order' });
    }
};

module.exports = {
    createOrder
};