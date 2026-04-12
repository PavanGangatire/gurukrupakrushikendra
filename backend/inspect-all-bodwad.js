const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    
    const users = await User.find({ taluka: /bodwad/i });
    console.log(`Found ${users.length} match(es)`);
    
    users.forEach(u => {
        console.log(`--- User: ${u.mobile} ---`);
        console.log(`Role: [${u.role}] (len:${u.role.length})`);
        console.log(`Taluka: [${u.taluka}] (len:${u.taluka.length})`);
        console.log(`ShopName: [${u.shopName}]`);
    });
    
    process.exit(0);
}
check().catch(console.error);
