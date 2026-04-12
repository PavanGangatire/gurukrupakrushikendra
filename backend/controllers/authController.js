const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d'
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, mobile, password, village, state, district, taluka, town, shopName, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ mobile });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists with this mobile number' });
        }

        // Create user
        const user = await User.create({
            name,
            mobile,
            password,
            village,
            state,
            district,
            taluka,
            town,
            shopName,
            role: role || 'farmer'
        });

        // Create token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                role: user.role,
                village: user.village,
                state: user.state,
                district: user.district,
                taluka: user.taluka,
                town: user.town,
                shopName: user.shopName
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        // Validate mobile & password
        if (!mobile || !password) {
            return res.status(400).json({ success: false, message: 'Please provide mobile and password' });
        }

        // Check for user
        const user = await User.findOne({ mobile }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Create token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get shops by location
// @route   GET /api/auth/shops
// @access  Public
exports.getShops = async (req, res) => {
    try {
        const { town, district, state, taluka } = req.query;
        let query = { role: 'admin' };
        
        if (town) query.town = { $regex: `^${town}$`, $options: 'i' };
        if (district) query.district = { $regex: `^${district}$`, $options: 'i' };
        if (state) query.state = { $regex: `^${state}$`, $options: 'i' };
        if (taluka) query.taluka = { $regex: `^${taluka}$`, $options: 'i' };

        const shops = await User.find(query).select('name shopName town district taluka mobile');
        res.status(200).json({ success: true, data: shops });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            shopName: req.body.shopName,
            village: req.body.village,
            state: req.body.state,
            district: req.body.district,
            taluka: req.body.taluka,
            town: req.body.town
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
