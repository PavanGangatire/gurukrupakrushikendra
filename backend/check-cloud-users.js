const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function showCloudUsers() {
    console.log("Connecting to cloud database...");
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected! Fetching users...");

        const users = await User.find({}, 'name mobile role');
        
        console.log("\n--- ACCOUNTS FOUND IN CLOUD ---");
        users.forEach(u => {
            console.log(`[${u.role.toUpperCase()}] Name: ${u.name}, Mobile: ${u.mobile}`);
        });
        console.log("--------------------------------\n");

        process.exit(0);
    } catch (err) {
        console.error("Failed:", err.message);
        process.exit(1);
    }
}

showCloudUsers();
