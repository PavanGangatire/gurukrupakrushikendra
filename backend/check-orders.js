const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./models/Order');

async function checkOrders() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
        console.log('Connected.');
        
        const orders = await Order.find().sort({ createdAt: -1 }).limit(10);
        console.log(`Found ${orders.length} recent orders.`);
        
        for (const o of orders) {
            console.log(`\nID: ${o._id}`);
            console.log(`Total: ${o.totalPrice}`);
            console.log(`Items: ${JSON.stringify(o.orderItems)}`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkOrders();
