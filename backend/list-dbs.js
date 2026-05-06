const mongoose = require('mongoose');
require('dotenv').config();

async function listDBs() {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
    const admin = conn.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('DATABASES:', JSON.stringify(dbs.databases.map(d => d.name)));
    
    // Check current DB
    console.log('CURRENT_DB:', conn.connection.name);
    
    process.exit(0);
}
listDBs().catch(console.error);
