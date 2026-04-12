const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    
    const users = await User.find({ taluka: /bodwad/i });
    console.log(`FOUND matches: ${users.length}`);
    
    users.forEach(u => {
        console.log(`--- MOBILE: ${u.mobile} ---`);
        console.log(JSON.stringify(u, null, 4));
    });
    
    process.exit(0);
}
check().catch(console.error);
