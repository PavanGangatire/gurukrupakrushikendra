const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    
    const orders = await Order.find({ user: '69be572d6dbdac9010b2388f' });
    console.log(`TOTAL_ORDERS: ${orders.length}`);
    
    orders.forEach(o => {
        console.log(`ORDER|ID:${o._id}|Method:${o.paymentMethod}|IsPaid:${o.isPaid}|Total:${o.totalPrice}`);
    });
    
    process.exit(0);
}
check().catch(console.error);
