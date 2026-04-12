const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    
    const users = await User.find({ taluka: /bodwad/i });
    console.log(`DATA_START`);
    users.forEach(u => {
        console.log(`USER_DATA:${JSON.stringify({
            mobile: u.mobile,
            role: u.role,
            taluka: u.taluka,
            shopName: u.shopName
        })}`);
    });
    console.log(`DATA_END`);
    
    process.exit(0);
}
check().catch(console.error);
