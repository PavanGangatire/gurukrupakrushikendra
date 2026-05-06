const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
require('dotenv').config();

async function settleAll() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
        console.log('Connected.');

        // 1. Mark all Borrow orders as paid
        const borrowUpdate = await Order.updateMany(
            { paymentMethod: 'Borrow', isPaid: false },
            { $set: { isPaid: true, paidAt: new Date(), status: 'Completed' } }
        );
        console.log(`Updated ${borrowUpdate.modifiedCount} Borrow orders to Paid.`);

        // 2. Handle pending Online orders (the user said ALL pending payment orders)
        const onlineUpdate = await Order.updateMany(
            { paymentMethod: 'Online', isPaid: false },
            { $set: { isPaid: true, paidAt: new Date(), status: 'Completed' } }
        );
        console.log(`Updated ${onlineUpdate.modifiedCount} Online orders to Paid.`);

        // 3. Reset all users' remainingBorrowAmount to 0
        const userUpdate = await User.updateMany(
            { remainingBorrowAmount: { $gt: 0 } },
            { $set: { remainingBorrowAmount: 0 } }
        );
        console.log(`Reset balance for ${userUpdate.modifiedCount} users.`);

        console.log('Success: All pending payments settled and orders marked as completed.');
        process.exit(0);
    } catch (err) {
        console.error('Error settling payments:', err);
        process.exit(1);
    }
}

settleAll();
