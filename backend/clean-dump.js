const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    
    const users = await User.find({ taluka: /bodwad/i });
    console.log(`FOUND_COUNT:${users.length}`);
    
    for (const u of users) {
        console.log(`START_USER`);
        console.log(`ID:${u._id}`);
        console.log(`MOB:${u.mobile}`);
        console.log(`ROLE:${u.role}`);
        console.log(`TALUKA:${u.taluka}`);
        console.log(`SHOP:${u.shopName}`);
        console.log(`END_USER`);
    }
    
    process.exit(0);
}
check().catch(console.error);
