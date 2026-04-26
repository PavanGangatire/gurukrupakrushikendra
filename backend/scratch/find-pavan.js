const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function findPavan() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = mongoose.model('User', new mongoose.Schema({
            name: String,
            role: String
        }));

        const pavan = await User.findOne({ name: /pavan gangatire/i });
        
        if (!pavan) {
            console.log('User "Pavan Gangatire" not found.');
        } else {
            console.log('User Object:', JSON.stringify(pavan, null, 2));
            console.log(`Found User: ${pavan.name} (ID: ${pavan._id})`);
            
            const Order = mongoose.model('Order', new mongoose.Schema({
                user: mongoose.Schema.Types.ObjectId,
                paymentMethod: String,
                isPaid: Boolean
            }));

            const orders = await Order.find({ user: pavan._id });
            console.log(`Found ${orders.length} orders for this user.`);
            orders.forEach(o => {
                console.log(`- Order: ${o._id}, Method: ${o.paymentMethod}, IsPaid: ${o.isPaid}`);
            });
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

findPavan();
