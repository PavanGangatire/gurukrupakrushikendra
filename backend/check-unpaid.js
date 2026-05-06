const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    
    const unpaidBorrowOrders = await Order.find({ paymentMethod: 'Borrow', isPaid: false }).populate('user');
    console.log(`TOTAL_UNPAID_BORROW_ORDERS: ${unpaidBorrowOrders.length}`);
    
    unpaidBorrowOrders.forEach(o => {
        if (o.user) {
            console.log(`ORDER|ID:${o._id}|UserMob:${o.user.mobile}|UserRole:${o.user.role}|Amount:${o.totalPrice}`);
        } else {
            console.log(`ORDER|ID:${o._id}|User:NULL|Amount:${o.totalPrice}`);
        }
    });
    
    process.exit(0);
}
check().catch(console.error);
