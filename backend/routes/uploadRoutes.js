const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/cloudinary');

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        // Return the secure URL from Cloudinary
        res.json({ 
            success: true, 
            url: req.file.path, // multer-storage-cloudinary puts the URL in req.file.path
            public_id: req.file.filename 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

