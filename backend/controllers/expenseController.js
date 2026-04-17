const Expense = require('../models/Expense');

// @desc    Add an expense
// @route   POST /api/expenses
// @access  Private/Admin
exports.addExpense = async (req, res) => {
    try {
        req.body.recordedBy = req.user._id;
        if (!req.body.date) req.body.date = Date.now();
        
        const expense = await Expense.create(req.body);
        res.status(201).json({ success: true, data: expense });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private/Admin
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().populate('recordedBy', 'name').sort('-date');
        res.status(200).json({ success: true, count: expenses.length, data: expenses });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
