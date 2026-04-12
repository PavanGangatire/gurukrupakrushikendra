const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    
    const user = await User.findOne({ mobile: '9359634271' });
    if (user) {
        const t = user.taluka;
        console.log(`Taluka: [${t}]`);
        console.log(`Length: ${t.length}`);
        for (let i = 0; i < t.length; i++) {
            console.log(`Char ${i}: ${t.charCodeAt(i)} ('${t[i]}')`);
        }
    } else {
        console.log("USER_NOT_FOUND");
    }
    
    process.exit(0);
}
check().catch(console.error);
