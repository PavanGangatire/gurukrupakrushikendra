const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const User = require('./models/User');

const sync = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
        console.log('--- Connected to MongoDB ---');

        const admins = await User.find({ role: 'admin' });
        if (admins.length === 0) {
            console.log('No admins found.');
            process.exit(1);
        }

        console.log(`Found ${admins.length} admins.`);
        const adminIds = admins.map(a => a._id);

        // Get all unique product names to replication
        const products = await Product.find();
        const baseProducts = [];
        const seenNames = new Set();

        for (const p of products) {
            if (!seenNames.has(p.name)) {
                baseProducts.push(p.toObject());
                seenNames.add(p.name);
            }
        }

        console.log(`Base product count: ${baseProducts.length}`);
        
        // Clear all products first to avoid duplicates
        await Product.deleteMany({});
        console.log('Cleared existing products.');

        // Re-insert each base product for EACH admin
        const newProducts = [];
        for (const admin of admins) {
            for (const baseP of baseProducts) {
                const newP = { ...baseP };
                delete newP._id;
                newP.shopOwner = admin._id;
                newProducts.push(newP);
            }
        }

        await Product.insertMany(newProducts);
        console.log(`Successfully synced ${newProducts.length} products across all admins.`);
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error syncing:', err);
        process.exit(1);
    }
};

sync();
