const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const StockPurchase = require('../models/StockPurchase');
const Expense = require('../models/Expense');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Perform dashboard calculations in parallel or combined aggregation
        const [stats, recentOrders, farmersWithBorrow] = await Promise.all([
            // 1. Core Stats Facet
            Order.aggregate([
                {
                    $facet: {
                        totalFarmers: [
                            { $group: { _id: "$user" } },
                            { $count: "count" }
                        ],
                        totalPendingBorrow: [
                            { $match: { paymentMethod: 'Borrow', isPaid: false } },
                            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
                        ],
                        todaySales: [
                            { $match: { createdAt: { $gte: today } } },
                            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
                        ]
                    }
                }
            ]),
            // 2. Recent Orders
            Order.find()
                .populate('user', 'name mobile')
                .sort('-createdAt')
                .limit(10),
            // 3. Farmers with Borrow (top ones or specific logic)
            Order.aggregate([
                { $match: { paymentMethod: 'Borrow', isPaid: false } },
                { $group: { _id: "$user", remainingBorrowAmount: { $sum: "$totalPrice" } } },
                { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDetails' } },
                { $unwind: '$userDetails' },
                {
                    $project: {
                        id: '$_id',
                        name: '$userDetails.name',
                        mobile: '$userDetails.mobile',
                        village: '$userDetails.village',
                        remainingBorrowAmount: 1
                    }
                }
            ])
        ]);

        const totalProducts = await Product.countDocuments();
        
        const dashboardData = {
            totalFarmers: stats[0].totalFarmers[0]?.count || 0,
            totalProducts,
            totalPendingBorrow: stats[0].totalPendingBorrow[0]?.total || 0,
            todaySales: stats[0].todaySales[0]?.total || 0,
            farmersWithBorrow,
            recentOrders: recentOrders.map(o => ({
                id: o._id,
                user: o.user ? o.user.name : 'Unknown',
                mobile: o.user ? o.user.mobile : 'N/A',
                totalPrice: o.totalPrice,
                paymentMethod: o.paymentMethod,
                status: o.status,
                date: o.createdAt
            }))
        };

        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get comprehensive financial analytics
// @route   GET /api/admin/financials
// @access  Private/Admin
exports.getFinancials = async (req, res) => {
    try {
        const stats = await Order.aggregate([
            {
                $facet: {
                    totalSales: [
                        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
                    ],
                    totalPendingCredit: [
                        { $match: { paymentMethod: 'Borrow', isPaid: false } },
                        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
                    ]
                }
            }
        ]);

        const purchases = await StockPurchase.find();
        const totalPurchases = purchases.reduce((acc, p) => acc + p.totalCost, 0);

        const expenses = await Expense.find();
        const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

        const totals = {
            totalSales: stats[0].totalSales[0]?.total || 0,
            totalPendingCredit: stats[0].totalPendingCredit[0]?.total || 0,
            totalPurchases,
            totalExpenses
        };

        const netProfit = totals.totalSales - totals.totalPurchases - totals.totalExpenses;

        res.status(200).json({
            success: true,
            data: {
                ...totals,
                netProfit
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get all registered farmers
// @route   GET /api/admin/farmers
// @access  Private/Admin
exports.getAllFarmers = async (req, res) => {
    try {
        // Use aggregation to fetch farmers and their borrow amount in one go
        const farmers = await User.aggregate([
            { $match: { role: 'farmer' } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'orders',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$user', '$$userId'] },
                                        { $eq: ['$paymentMethod', 'Borrow'] },
                                        { $eq: ['$isPaid', false] }
                                    ]
                                }
                            }
                        },
                        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
                    ],
                    as: 'borrowData'
                }
            },
            {
                $addFields: {
                    id: '$_id',
                    remainingBorrowAmount: { $ifNull: [{ $arrayElemAt: ['$borrowData.total', 0] }, 0] }
                }
            },
            { $project: { password: 0, borrowData: 0 } }
        ]);
        
        res.status(200).json({ success: true, count: farmers.length, data: farmers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Settle (Pay back) a farmer's credit
// @route   POST /api/admin/farmers/:id/settle
// @access  Private/Admin
exports.settleFarmerCredit = async (req, res) => {
    try {
        const { amount } = req.body;
        const farmerId = req.params.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Please provide a valid settlement amount' });
        }

        const farmer = await User.findById(farmerId);
        if (!farmer) {
            return res.status(404).json({ success: false, message: 'Farmer not found' });
        }

        // 1. Reduce the global remainingBorrowAmount for this farmer
        farmer.remainingBorrowAmount -= amount;
        if (farmer.remainingBorrowAmount < 0) farmer.remainingBorrowAmount = 0;
        await farmer.save();

        // 2. Find and mark old "Borrow" orders for THIS SHOP as paid
        // We'll process them from oldest to newest until the settled amount is exhausted
        let remainingToSettle = amount;
        const unpaidOrders = await Order.find({ 
            user: farmerId, 
            paymentMethod: 'Borrow', 
            isPaid: false 
        }).sort('createdAt');

        for (let order of unpaidOrders) {
            if (remainingToSettle >= order.totalPrice) {
                remainingToSettle -= order.totalPrice;
                order.isPaid = true;
                order.paidAt = Date.now();
                order.status = 'Completed';
                await order.save();
            } else {
                // If it's a partial payment on an order, we log it but don't mark as paid yet
                // For now, we'll just break and leave the order unpaid, 
                // but the overall debt (remainingBorrowAmount) is already reduced.
                break;
            }
        }

        res.status(200).json({ 
            success: true, 
            message: `Successfully settled ₹${amount} for ${farmer.name}`,
            newBalance: farmer.remainingBorrowAmount
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get specific farmer details and their order history
// @route   GET /api/admin/farmers/:id
// @access  Private/Admin
exports.getFarmerDetails = async (req, res) => {
    try {
        const farmer = await User.findById(req.params.id).select('-password');
        
        if (!farmer || farmer.role !== 'farmer') {
            return res.status(404).json({ success: false, message: 'Farmer not found' });
        }

        // Fetch all orders by this farmer FOR THIS SHOP
        const orders = await Order.find({ user: req.params.id })
            .populate('orderItems.product', 'name price image')
            .sort('-createdAt');

        const shopSpecificBorrow = orders
            .filter(o => o.paymentMethod === 'Borrow' && !o.isPaid)
            .reduce((sum, o) => sum + o.totalPrice, 0);

        res.status(200).json({ 
            success: true, 
            data: {
                farmer,
                orders,
                shopSpecificBorrow
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
