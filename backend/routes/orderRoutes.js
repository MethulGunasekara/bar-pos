const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/orderController');

// @route   POST /api/orders
// @access  Public (Will be protected by JWT later)
router.route('/').post(createOrder);

module.exports = router;