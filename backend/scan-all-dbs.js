const mongoose = require('mongoose');
require('dotenv').config();

const uri_template = "mongodb://pavangangatire:pavan123@ac-cyajxy4-shard-00-00.t4qbyqz.mongodb.net:27017,ac-cyajxy4-shard-00-01.t4qbyqz.mongodb.net:27017,ac-cyajxy4-shard-00-02.t4qbyqz.mongodb.net:27017/DBNAME?ssl=true&replicaSet=atlas-kcq463-shard-0&authSource=admin&appName=Cluster0";

async function checkAll() {
    const conn = await mongoose.connect(uri_template.replace('DBNAME', 'admin'));
    const admin = conn.connection.db.admin();
    const dbs = await admin.listDatabases();
    const dbNames = dbs.databases.map(d => d.name);
    console.log('DATABASES:', dbNames);
    
    for (const dbName of dbNames) {
        if (['admin', 'config', 'local'].includes(dbName)) continue;
        
        console.log(`\nChecking DB: ${dbName}`);
        const dbConn = await mongoose.createConnection(uri_template.replace('DBNAME', dbName)).asPromise();
        const User = dbConn.model('User', require('./models/User').schema);
        const Order = dbConn.model('Order', require('./models/Order').schema);
        
        const pendingBorrow = await Order.countDocuments({ paymentMethod: 'Borrow', isPaid: false });
        const pendingOnline = await Order.countDocuments({ paymentMethod: 'Online', isPaid: false });
        const usersWithBal = await User.countDocuments({ remainingBorrowAmount: { $gt: 0 } });
        
        console.log(`- Pending Borrow Orders: ${pendingBorrow}`);
        console.log(`- Pending Online Orders: ${pendingOnline}`);
        console.log(`- Users with Balance > 0: ${usersWithBal}`);
        
        if (pendingBorrow > 0 || pendingOnline > 0) {
            const orders = await Order.find({ isPaid: false }).populate('user');
            orders.forEach(o => {
                console.log(`  ORDER|ID:${o._id}|User:${o.user ? o.user.name : 'NULL'}|Mob:${o.user ? o.user.mobile : 'NULL'}|Amount:${o.totalPrice}|Method:${o.paymentMethod}`);
            });
        }
        
        await dbConn.close();
    }
    
    process.exit(0);
}
checkAll().catch(console.error);
