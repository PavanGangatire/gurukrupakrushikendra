const express = require('express');
const { addOrderItems, getMyOrders, getOrders, updateOrderToPaid, payOrder, verifyOrder, getOrderById } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, authorize('admin', 'staff'), getOrders);

router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);

router.route('/:id/pay').put(protect, payOrder);
router.route('/verify').post(protect, verifyOrder);
router.route('/:id/update-status').put(protect, authorize('admin', 'staff'), updateOrderToPaid);

module.exports = router;
