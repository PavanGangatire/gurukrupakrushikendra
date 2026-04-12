const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    
    const taluka = 'bodwad';
    let query = { role: 'admin' };
    query.taluka = { $regex: `^${taluka}$`, $options: 'i' };
    
    console.log(`Querying:`, query);
    const shops = await User.find(query).select('name shopName town district taluka mobile');
    
    console.log(`Found ${shops.length} shops:`);
    shops.forEach(s => {
        console.log(`- ${s.shopName} (${s.mobile}) at ${s.taluka}`);
    });
    
    process.exit(0);
}
check().catch(console.error);
