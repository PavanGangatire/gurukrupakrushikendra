const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

async function inspect() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    const orders = await Order.find({ paymentMethod: 'Borrow' }).limit(10);
    console.log(`TOTAL_BORROW_ORDERS: ${orders.length}`);
    orders.forEach(o => {
        console.log(`ORDER|ID:${o._id}|isPaid:${o.isPaid}|Status:${o.status}`);
    });
    process.exit(0);
}
inspect().catch(console.error);
