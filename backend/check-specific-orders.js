const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

async function checkSpecifics() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    
    const ids = ['69e88f1bcd91ff8871c2196e', '69e897bacd91ff8871c21aba'];
    for (const id of ids) {
        const o = await Order.findById(id);
        if (o) {
            console.log(`ORDER|ID:${o._id}|isPaid:${o.isPaid}|Status:${o.status}`);
        } else {
            console.log(`ORDER|ID:${id}|NOT_FOUND`);
        }
    }
    process.exit(0);
}
checkSpecifics().catch(console.error);
