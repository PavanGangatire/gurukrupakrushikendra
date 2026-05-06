const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    const users = await User.find({}).select('name mobile role remainingBorrowAmount');
    console.log(`TOTAL_USERS:${users.length}`);
    users.forEach(u => {
        console.log(`USER|ID:${u._id}|Mob:${u.mobile}|Bal:${u.remainingBorrowAmount || 0}|Role:${u.role}`);
    });
    process.exit(0);
}
check().catch(console.error);
