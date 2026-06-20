const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true 
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    priceAtSale: { type: Number, required: true }
});

const orderSchema = mongoose.Schema({
    // We will attach the cashier's user ID later when we implement JWT auth
    orderItems: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            priceAtSale: { type: Number, required: true },
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            }
        }
    ],
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Cash', 'Card'] // Strict validation for our reporting engine
    },
    total: {
        type: Number,
        required: true,
        default: 0.0
    }
}, {
    timestamps: true // Automatically creates createdAt and updatedAt (crucial for our Daily Report)
});

module.exports = mongoose.model('Order', orderSchema);