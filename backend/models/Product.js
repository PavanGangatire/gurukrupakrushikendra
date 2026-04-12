const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please select a category']
    },
    company: {
        type: String,
        default: 'Generic'
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    purchasePrice: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        default: 'Unit'
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5fc0?auto=format&fit=crop&w=600&q=80'
    },
    shopOwner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
