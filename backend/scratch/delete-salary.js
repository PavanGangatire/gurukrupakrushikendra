const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function deleteSalary() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Expense = mongoose.model('Expense', new mongoose.Schema({
            category: String
        }));

        const result = await Expense.deleteMany({
            category: /Staff Salary/i
        });

        console.log(`Successfully deleted ${result.deletedCount} "Staff Salary" records.`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error during deletion:', err.message);
    }
}

deleteSalary();
