const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
require('dotenv').config();

async function checkTestDB() {
    // Hardcoded URI from fix-test-db.js
    const uri = "mongodb://pavangangatire:pavan123@ac-cyajxy4-shard-00-00.t4qbyqz.mongodb.net:27017,ac-cyajxy4-shard-00-01.t4qbyqz.mongodb.net:27017,ac-cyajxy4-shard-00-02.t4qbyqz.mongodb.net:27017/test?ssl=true&replicaSet=atlas-kcq463-shard-0&authSource=admin&appName=Cluster0";
    
    console.log("Connecting to the 'test' database...");
    await mongoose.connect(uri);
    console.log("Connected.");

    const count = await Order.countDocuments({ isPaid: false });
    console.log(`TOTAL_UNPAID_ORDERS_IN_TEST: ${count}`);
    
    const orders = await Order.find({ isPaid: false }).populate('user');
    orders.forEach(o => {
        console.log(`ORDER|ID:${o._id}|User:${o.user ? o.user.name : 'NULL'}|Mob:${o.user ? o.user.mobile : 'NULL'}|Amount:${o.totalPrice}|Method:${o.paymentMethod}`);
    });
    
    process.exit(0);
}
checkTestDB().catch(console.error);
