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
        const shopId = req.user.id;
        
        const totalProducts = await Product.countDocuments({ shopOwner: shopId });
        
        // Count farmers who have interacted with this shop
        const customerIds = await Order.distinct('user', { shopOwner: shopId });
        const totalFarmers = customerIds.length;
        
        // Calculate Total Pending Borrow FOR THIS SHOP
        // Note: For now, we are looking at orders with paymentMethod: 'Borrow' that are not yet marked as Completed/Paid
        const pendingBorrowOrders = await Order.find({ 
            shopOwner: shopId, 
            paymentMethod: 'Borrow',
            isPaid: false
        });
        const totalPendingBorrow = pendingBorrowOrders.reduce((acc, order) => acc + order.totalPrice, 0);

        // Recent Orders
        const recentOrders = await Order.find({ shopOwner: shopId })
            .populate('user', 'name mobile')
            .sort('-createdAt')
            .limit(10);

        // Find farmers with pending borrow FOR THIS SHOP
        const borrowUserIds = await Order.distinct('user', { 
            shopOwner: shopId, 
            paymentMethod: 'Borrow', 
            isPaid: false 
        });
        const farmersWithBorrow = await User.find({ _id: { $in: borrowUserIds } }).select('name mobile village');

        // Today's Sales
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysOrders = await Order.find({ 
            shopOwner: shopId,
            createdAt: { $gte: today } 
        });
        const todaySales = todaysOrders.reduce((acc, order) => acc + order.totalPrice, 0);

        res.status(200).json({
            success: true,
            data: {
                totalFarmers,
                totalProducts,
                totalPendingBorrow,
                todaySales,
                farmersWithBorrow: farmersWithBorrow.map(f => ({
                    id: f._id,
                    name: f.name,
                    mobile: f.mobile,
                    village: f.village,
                    remainingBorrowAmount: pendingBorrowOrders
                        .filter(o => o.user.toString() === f._id.toString())
                        .reduce((sum, o) => sum + o.totalPrice, 0)
                })),
                recentOrders: recentOrders.map(o => ({
                    id: o._id,
                    user: o.user ? o.user.name : 'Unknown',
                    mobile: o.user ? o.user.mobile : 'N/A',
                    totalPrice: o.totalPrice,
                    paymentMethod: o.paymentMethod,
                    status: o.status,
                    date: o.createdAt
                }))
            }
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
        const shopId = req.user.id;

        const orders = await Order.find({ shopOwner: shopId });
        const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);

        const purchases = await StockPurchase.find({ shopOwner: shopId });
        const totalPurchases = purchases.reduce((acc, p) => acc + p.totalCost, 0);

        const expenses = await Expense.find({ shopOwner: shopId });
        const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

        const totalPendingCredit = orders
            .filter(o => o.paymentMethod === 'Borrow' && !o.isPaid)
            .reduce((acc, o) => acc + o.totalPrice, 0);

        const netProfit = totalSales - totalPurchases - totalExpenses;

        res.status(200).json({
            success: true,
            data: {
                totalSales,
                totalPurchases,
                totalExpenses,
                totalPendingCredit,
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
        const shopId = req.user.id;
        // Find ALL users with role 'farmer'
        const users = await User.find({ role: 'farmer' }).select('-password').sort('-createdAt');
        
        // Calculate shop-specific borrow for each farmer
        const farmersWithBorrow = await Promise.all(users.map(async (u) => {
            const orders = await Order.find({ user: u._id, shopOwner: shopId, paymentMethod: 'Borrow', isPaid: false });
            const shopSpecificBorrow = orders.reduce((sum, o) => sum + o.totalPrice, 0);
            return {
                ...u._doc,
                id: u._id,
                remainingBorrowAmount: shopSpecificBorrow // Map it to the expected frontend field
            };
        }));
        
        res.status(200).json({ success: true, count: farmersWithBorrow.length, data: farmersWithBorrow });
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
        const shopId = req.user.id;

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
            shopOwner: shopId, 
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
        const shopId = req.user.id;
        const farmer = await User.findById(req.params.id).select('-password');
        
        if (!farmer || farmer.role !== 'farmer') {
            return res.status(404).json({ success: false, message: 'Farmer not found' });
        }

        // Fetch all orders by this farmer FOR THIS SHOP
        const orders = await Order.find({ user: req.params.id, shopOwner: shopId })
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
