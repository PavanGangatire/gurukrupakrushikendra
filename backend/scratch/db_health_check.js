const mongoose = require('mongoose');
require('dotenv').config();

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections Found:');
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} documents`);
        }
        
    } catch (err) {
        console.error('DB Check Failed:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkDB();
