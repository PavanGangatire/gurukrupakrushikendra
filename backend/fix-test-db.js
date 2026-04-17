const mongoose = require('mongoose');
const User = require('./models/User');

async function fixTestDatabase() {
    // Using the confirmed working connection format
    const uri = "mongodb://pavangangatire:pavan123@ac-cyajxy4-shard-00-00.t4qbyqz.mongodb.net:27017,ac-cyajxy4-shard-00-01.t4qbyqz.mongodb.net:27017,ac-cyajxy4-shard-00-02.t4qbyqz.mongodb.net:27017/test?ssl=true&replicaSet=atlas-kcq463-shard-0&authSource=admin&appName=Cluster0";
    
    console.log("Connecting to the default 'test' database in your cluster...");
    
    try {
        await mongoose.connect(uri);
        console.log("Connected successfully!");

        const mobile = '9657895153';
        const password = 'password';

        console.log(`Checking for admin: ${mobile} in 'test' database...`);
        let user = await User.findOne({ mobile });

        if (user) {
            console.log("Admin found in 'test'! Resetting password to 'password'...");
            user.password = password;
            user.role = 'admin';
            await user.save();
        } else {
            console.log("Admin not found in 'test'! Creating new admin user now...");
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

        console.log("DONE! The default 'test' database is now ready.");
        console.log("CREDENTIALS ARE NOW ACTIVE: 9657895153 / password");
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err.message);
        process.exit(1);
    }
}

fixTestDatabase();
