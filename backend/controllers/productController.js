const Product = require('../models/Product');

// @desc    Get all products (with optional filters)
// @route   GET /api/products
// @access  Public
// @desc    Get all products (with optional filters)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const { shopOwner, category, search, sort, page, limit } = req.query;
        let queryObj = {};

        // 1. Shop Owner Filter (Robust Casting)
        if (shopOwner) {
            const mongoose = require('mongoose');
            if (mongoose.Types.ObjectId.isValid(shopOwner)) {
                queryObj.shopOwner = new mongoose.Types.ObjectId(shopOwner);
            } else {
                queryObj.shopOwner = shopOwner;
            }
        }

        // 2. Category Filter
        if (category) {
            queryObj.category = category;
        }

        // 3. Search Filter
        if (search) {
            queryObj.name = { $regex: search, $options: 'i' };
        }

        // Initialize query
        let query = Product.find(queryObj);

        // 4. Sorting
        if (sort) {
            const sortBy = sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // 5. Pagination
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 20;
        const skip = (pageNum - 1) * limitNum;
        
        query = query.skip(skip).limit(limitNum);
        
        const products = await query;
        const total = await Product.countDocuments(queryObj);

        res.status(200).json({
            success: true,
            count: products.length,
            pagination: { page: pageNum, limit: limitNum, total },
            data: products
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        // Automatically assign shopOwner from logged in admin
        req.body.shopOwner = req.user.id;
        
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Make sure user is product owner
        if (product.shopOwner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this product' });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        
        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Make sure user is product owner
        if (product.shopOwner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this product' });
        }

        await product.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
