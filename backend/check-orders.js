const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./models/Order');

async function checkOrders() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
        console.log('Connected.');
        
        const orders = await Order.find({ paymentMethod: 'Borrow' }).sort({ createdAt: -1 }).limit(10);
        console.log(`Found ${orders.length} recent borrow orders.`);
        
        for (const o of orders) {
            console.log(`\nID: ${o._id}`);
            console.log(`User ID: ${o.user}`);
            console.log(`Total: ${o.totalPrice}`);
            console.log(`Payment Method: ${o.paymentMethod}`);
            console.log(`Is Paid: ${o.isPaid}`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkOrders();
