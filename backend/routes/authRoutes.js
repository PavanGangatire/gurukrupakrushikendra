const express = require('express');
const { register, login, getMe, getShops, updateDetails } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/shops', getShops);
router.put('/updatedetails', protect, updateDetails);

module.exports = router;
