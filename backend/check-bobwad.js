const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    
    console.log("Searching for users with taluka matching 'bobwad' (case-insensitive)...");
    const users = await User.find({ taluka: /bobwad/i });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
        console.log(`- Name: ${u.name}, Mobile: ${u.mobile}, Role: ${u.role}, Taluka: '${u.taluka}', ShopName: ${u.shopName || 'N/A'}`);
    });
    
    process.exit(0);
}
check().catch(console.error);
