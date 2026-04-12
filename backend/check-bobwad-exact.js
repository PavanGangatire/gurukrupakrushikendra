const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    
    // Find all users and check their taluka string manually
    const users = await User.find({});
    console.log(`Checking ${users.length} users...`);
    
    users.forEach(u => {
        const t = u.taluka || '';
        if (t.toLowerCase().includes('bobwad') || t.toLowerCase().includes('bodwad')) {
            console.log(`MATCH FOUND:`);
            console.log(`- Mobile: ${u.mobile}`);
            console.log(`- Role: ${u.role}`);
            console.log(`- Taluka: [${t}] (Length: ${t.length})`);
            console.log(`- Town: [${u.town}]`);
            console.log(`- ShopName: ${u.shopName}`);
        }
    });
    
    process.exit(0);
}
check().catch(console.error);
