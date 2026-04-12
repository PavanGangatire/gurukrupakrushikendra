const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    
    const admins = await User.find({ role: 'admin' });
    console.log(`FOUND_ADMINS:${admins.length}`);
    
    admins.forEach(u => {
        console.log(`ADMIN|Mob:${u.mobile}|Taluka:[${u.taluka}]|Shop:${u.shopName}`);
    });
    
    process.exit(0);
}
check().catch(console.error);
