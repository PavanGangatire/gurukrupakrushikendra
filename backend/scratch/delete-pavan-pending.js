const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function deletePavanPending() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Order = mongoose.model('Order', new mongoose.Schema({
            user: mongoose.Schema.Types.ObjectId,
            isPaid: Boolean
        }));

        const pavanId = '69be572d6dbdac9010b2388f';
        
        const result = await Order.deleteMany({
            user: pavanId,
            isPaid: false
        });

        console.log(`Successfully deleted ${result.deletedCount} pending orders for Pavan Gangatire.`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error during deletion:', err.message);
    }
}

deletePavanPending();
