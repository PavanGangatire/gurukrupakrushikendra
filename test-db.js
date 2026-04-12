const mongoose = require('mongoose');
const Product = require('./backend/models/Product');

async function check() {
    await mongoose.connect('mongodb://127.0.0.1:27017/gurukrupa', { useNewUrlParser: true, useUnifiedTopology: true });
    const product = await Product.findOne();
    console.log("Found product:", product.name, "Stock:", product.stock);
    
    // Simulate purchase
    product.stock += 10;
    await product.save();

    const check = await Product.findOne({_id: product._id});
    console.log("Updated stock:", check.stock);
    
    process.exit(0);
}
check().catch(console.error);
