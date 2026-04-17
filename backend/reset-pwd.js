const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function resetAdminPassword() {
    console.log("Connecting to cloud database...");
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const mobile = '9657895153';
        const newPassword = 'password';

        console.log(`Resetting password for ${mobile} to 'password'...`);
        const user = await User.findOne({ mobile });
        
        if (user) {
            user.password = newPassword;
            await user.save();
            console.log("SUCCESS! Password reset to 'password'.");
        } else {
            console.log("Error: User not found.");
        }

        process.exit(0);
    } catch (err) {
        console.error("Failed:", err.message);
        process.exit(1);
    }
}

resetAdminPassword();
