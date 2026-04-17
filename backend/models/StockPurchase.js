const mongoose = require('mongoose');

const stockPurchaseSchema = new mongoose.Schema({
    supplierName: { type: String, required: true },
    supplierContact: { type: String },
    invoiceNumber: { type: String, required: true },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: { type: Number, required: true },
    costPerUnit: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
    expiryDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('StockPurchase', stockPurchaseSchema);
