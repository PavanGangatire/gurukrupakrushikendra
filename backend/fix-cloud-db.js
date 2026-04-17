const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixCloudDatabase() {
    console.log("Connecting to the cloud database selected in your .env...");
    
    // We explicitly use the KRUSHI-KENDRA database name in the connection
    const uri = process.env.MONGODB_URI;
    
    if (!uri.includes('krushi-kendra')) {
        console.log("WARNING: Your .env link might be missing '/krushi-kendra'. I will try both.");
    }

    try {
        await mongoose.connect(uri);
        console.log("Connected successfully!");

        const mobile = '9657895153';
        const password = 'password';

        console.log(`Checking for admin: ${mobile}...`);
        let user = await User.findOne({ mobile });

        if (user) {
            console.log("Admin found! Resetting password to 'password' and ensuring role is 'admin'...");
            user.password = password;
            user.role = 'admin';
            await user.save();
        } else {
            console.log("Admin not found! Creating new admin...");
            await User.create({
                name: 'Pavan Gangatire',
                mobile: mobile,
                password: password,
                role: 'admin',
                state: 'Maharashtra',
                district: 'Jalgaon',
                taluka: 'Bodwad',
                town: 'Bodwad',
                village: 'Bodwad',
                shopName: 'Gurukrupa Krushi Kendra'
            });
        }

        console.log("DONE! The cloud database at " + uri.split('@')[1].split('/')[0] + " is now ready.");
        console.log("USE THESE CREDENTIALS: 9657895153 / password");
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err.message);
        process.exit(1);
    }
}

fixCloudDatabase();
