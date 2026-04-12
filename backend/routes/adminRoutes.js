const express = require('express');
const { getDashboardStats, getFinancials, getAllFarmers, getFarmerDetails, settleFarmerCredit } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'staff'));

router.get('/dashboard', getDashboardStats);
router.get('/financials', getFinancials);
router.get('/farmers', getAllFarmers);
router.get('/farmers/:id', getFarmerDetails);
router.post('/farmers/:id/settle', settleFarmerCredit);

module.exports = router;
