const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra').then(async () => {
    console.log("DB Connected");
    
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
        console.log("Admin already exists! You can log in with:");
        console.log("Mobile:", adminExists.mobile);
        process.exit();
    }

    const admin = await User.create({
        name: 'System Admin',
        mobile: '9999999999',
        password: 'adminpassword123',
        role: 'admin',
        village: 'Headquarters'
    });

    console.log("Admin created successfully!");
    console.log("Mobile: 9999999999");
    console.log("Password: adminpassword123");
    process.exit();
}).catch(err => {
    console.error("Error creating admin:", err);
    process.exit(1);
});
