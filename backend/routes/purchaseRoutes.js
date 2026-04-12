const express = require('express');
const { addPurchase, getPurchases, bulkAddPurchases } = require('../controllers/purchaseController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'staff'));

router.route('/')
    .get(getPurchases)
    .post(addPurchase);

router.post('/bulk', bulkAddPurchases);

module.exports = router;
