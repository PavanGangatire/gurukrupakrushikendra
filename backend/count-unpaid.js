const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

async function countUnpaid() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    const count = await Order.countDocuments({ isPaid: false });
    console.log(`TOTAL_UNPAID_ORDERS_REMAINING: ${count}`);
    
    if (count > 0) {
        const samples = await Order.find({ isPaid: false }).limit(5);
        samples.forEach(s => {
            console.log(`SAMPLE|ID:${s._id}|Method:${s.paymentMethod}|Status:${s.status}`);
        });
    }
    process.exit(0);
}
countUnpaid().catch(console.error);
