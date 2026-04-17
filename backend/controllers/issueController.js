const CropIssue = require('../models/CropIssue');

// @desc    Get all issues
// @route   GET /api/issues
// @access  Private/Admin
exports.getIssues = async (req, res) => {
    try {
        const query = {};
        const issues = await CropIssue.find(query).populate('farmer', 'name mobile village').populate('suggestedProducts', 'name sellingPrice').sort('-createdAt');
        res.status(200).json({ success: true, count: issues.length, data: issues });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get my issues
// @route   GET /api/issues/myissues
// @access  Private/Farmer
exports.getMyIssues = async (req, res) => {
    try {
        const issues = await CropIssue.find({ farmer: req.user._id }).populate('suggestedProducts', 'name sellingPrice').sort('-createdAt');
        res.status(200).json({ success: true, count: issues.length, data: issues });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Submit new issue
// @route   POST /api/issues
// @access  Private/Farmer
exports.createIssue = async (req, res) => {
    try {
        req.body.farmer = req.user._id;

        const issue = await CropIssue.create(req.body);
        res.status(201).json({ success: true, data: issue });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Respond to an issue
// @route   PUT /api/issues/:id/respond
// @access  Private/Admin
exports.respondToIssue = async (req, res) => {
    try {
        const { adminResponse, status, suggestedProducts } = req.body;
        const issue = await CropIssue.findByIdAndUpdate(req.params.id, {
            adminResponse,
            status: status || 'Responded',
            suggestedProducts
        }, { new: true });
        
        if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });
        
        res.status(200).json({ success: true, data: issue });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
