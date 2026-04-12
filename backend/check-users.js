const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    
    console.log("Listing all users to check taluka values...");
    const users = await User.find({}).select('name mobile role taluka town village shopName');
    
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
        console.log(`- Mob: ${u.mobile}, Role: ${u.role}, Taluka: '${u.taluka}', Town: '${u.town}', Vill: '${u.village}', Shop: ${u.shopName || 'N/A'}`);
    });
    
    process.exit(0);
}
check().catch(console.error);
