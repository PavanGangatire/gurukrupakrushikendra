const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    
    const user = await User.findOne({ mobile: '9845312341' });
    if (user) {
        console.log("FARMER_JSON_DUMP:");
        console.log(JSON.stringify(user, null, 4));
    } else {
        console.log("FARMER_NOT_FOUND");
    }
    
    process.exit(0);
}
check().catch(console.error);
