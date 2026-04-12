const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    
    const res = await User.updateOne({ mobile: '9657895153' }, { $set: { taluka: 'Bodwad' } });
    console.log('Update result:', res);
    
    process.exit(0);
}
check().catch(console.error);
