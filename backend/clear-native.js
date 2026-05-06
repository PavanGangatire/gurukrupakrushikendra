const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function clearAllNative() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is not defined in .env');
        process.exit(1);
    }
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB Native Driver');
        
        const db = client.db('krushi-kendra');
        const orders = db.collection('orders');
        const users = db.collection('users');
        
        // 1. Mark ALL orders as paid and completed
        const orderRes = await orders.updateMany(
            { isPaid: false },
            { $set: { isPaid: true, status: 'Completed', paidAt: new Date() } }
        );
        console.log(`Updated ${orderRes.modifiedCount} orders in krushi-kendra`);
        
        // 2. Reset all balances
        const userRes = await users.updateMany(
            { remainingBorrowAmount: { $gt: 0 } },
            { $set: { remainingBorrowAmount: 0 } }
        );
        console.log(`Reset balance for ${userRes.modifiedCount} users in krushi-kendra`);
        
        // 3. Just to be absolutely sure, check if there are any left
        const left = await orders.countDocuments({ isPaid: false });
        console.log(`Orders still unpaid: ${left}`);
        
    } finally {
        await client.close();
    }
}

clearAllNative().catch(console.error);
