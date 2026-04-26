const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');

async function checkImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const products = await Product.find({});
        console.log(`Found ${products.length} products:`);
        products.forEach(p => {
            console.log(`- ${p.name}: ${p.image}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkImages();
