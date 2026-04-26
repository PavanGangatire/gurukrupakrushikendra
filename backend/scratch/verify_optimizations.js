const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const StockPurchase = require('../models/StockPurchase');
const Expense = require('../models/Expense');
require('dotenv').config({ path: '../.env' });

async function testOptimizations() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('\n--- Testing getAllFarmers (Aggregation) ---');
        const startFarmers = Date.now();
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
        console.log(`getAllFarmers took ${Date.now() - startFarmers}ms. Found ${farmers.length} farmers.`);
        if (farmers.length > 0) {
            console.log('Sample Farmer:', { name: farmers[0].name, remainingBorrowAmount: farmers[0].remainingBorrowAmount });
        }

        console.log('\n--- Testing Financials (Aggregation) ---');
        const startFinancials = Date.now();
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
        console.log(`Financial aggregation took ${Date.now() - startFinancials}ms.`);
        console.log('Stats:', {
            totalSales: stats[0].totalSales[0]?.total || 0,
            totalPendingCredit: stats[0].totalPendingCredit[0]?.total || 0
        });

        console.log('\n--- Testing Dashboard Stats Aggregation ---');
        const startDashboard = Date.now();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [dashboardStats] = await Order.aggregate([
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
        ]);
        console.log(`Dashboard stats aggregation took ${Date.now() - startDashboard}ms.`);
        console.log('Dashboard Data:', {
            totalFarmers: dashboardStats.totalFarmers[0]?.count || 0,
            totalPendingBorrow: dashboardStats.totalPendingBorrow[0]?.total || 0,
            todaySales: dashboardStats.todaySales[0]?.total || 0
        });

        await mongoose.disconnect();
        console.log('\nTesting Complete. Disconnected.');
    } catch (err) {
        console.error('Test Failed:', err);
    }
}

testOptimizations();
