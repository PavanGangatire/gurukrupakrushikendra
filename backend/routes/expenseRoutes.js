const express = require('express');
const { addExpense, getExpenses } = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'staff'));

router.route('/')
    .get(getExpenses)
    .post(addExpense);

module.exports = router;
