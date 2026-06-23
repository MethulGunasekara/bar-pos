const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, default: 0.0 },
    image: { type: String, default: '' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);