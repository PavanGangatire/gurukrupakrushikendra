const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    shopOwner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingAddress: {
        type: String,
        required: true,
        default: 'Not Provided'
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Cash', 'Borrow', 'Online']
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    razorpayOrderId: {
        type: String
    },
    paymentInfo: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
