const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function listExpenses() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Expense = mongoose.model('Expense', new mongoose.Schema({
            description: String,
            amount: Number,
            category: String,
            date: Date
        }));

        const expenses = await Expense.find();
        console.log(`Found ${expenses.length} expense records.`);
        
        let total = 0;
        expenses.forEach(e => {
            console.log(`- Description: ${e.description}, Amount: ₹${e.amount}, Category: ${e.category}`);
            total += e.amount;
        });
        
        console.log(`Current Total Calculation: ₹${total}`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

listExpenses();
