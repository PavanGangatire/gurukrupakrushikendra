const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.addOrderItems = async (req, res) => {
    try {
        const { orderItems, paymentMethod, totalPrice, shippingAddress } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No order items' });
        }

        // Verify stock for all items
        for (const item of orderItems) {
            const tempProduct = await Product.findById(item.product);
            if (!tempProduct) return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
            if (tempProduct.stock < item.qty) {
                return res.status(400).json({ success: false, message: `Not enough stock for ${item.name}` });
            }
        }

        // Determine the user for the order
        let orderUserId = req.user._id;
        if (req.user.role === 'admin' && req.body.userId) {
            orderUserId = req.body.userId;
        }

        // Create Order
        const order = new Order({
            user: orderUserId,

            orderItems,
            paymentMethod,
            totalPrice,
            shippingAddress: shippingAddress || 'Not Provided',
            isPaid: paymentMethod === 'Cash' ? true : false,
            paidAt: paymentMethod === 'Cash' ? Date.now() : undefined,
            status: paymentMethod === 'Cash' ? 'Completed' : 'Pending'
        });

        const createdOrder = await order.save();

        let razorpayOrderData = null;
        if (paymentMethod === 'Online') {
            const options = {
                amount: totalPrice * 100, // amount in paise
                currency: "INR",
                receipt: `receipt_${createdOrder._id}`
            };
            const rzpOrder = await razorpay.orders.create(options);
            createdOrder.razorpayOrderId = rzpOrder.id;
            await createdOrder.save();
            razorpayOrderData = rzpOrder;
        }

        // Update product stock
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            product.stock -= item.qty;
            await product.save();
        }

        // If Borrow, update user's remaining borrow amount
        if (paymentMethod === 'Borrow') {
            const userAccount = await User.findById(orderUserId);
            if (userAccount) {
                userAccount.remainingBorrowAmount += totalPrice;
                await userAccount.save();
            }
        }

        res.status(201).json({ 
            success: true, 
            data: createdOrder,
            razorpayOrder: razorpayOrderData 
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
        res.status(200).json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
    try {
        const query = {};
        const orders = await Order.find(query).populate('user', 'id name mobile remainingBorrowAmount creditRisk').sort('-createdAt');
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Update order to paid (for Online payment)
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.payOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'Completed';
        order.paymentInfo = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address
        };

        const updatedOrder = await order.save();

        res.status(200).json({ success: true, data: updatedOrder });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name mobile');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        
        // Ensure user can only see their own order (unless admin)
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Update order for admin (mark as Completed for Borrow)
// @route   PUT /api/orders/:id/update-status
// @access  Private/Admin
exports.updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        


        if (order.isPaid) return res.status(400).json({ success: false, message: 'Order already paid' });

        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'Completed';
        const updatedOrder = await order.save();

        if (order.paymentMethod === 'Borrow') {
            const user = await User.findById(order.user);
            user.remainingBorrowAmount -= order.totalPrice;
            if (user.remainingBorrowAmount < 0) user.remainingBorrowAmount = 0;
            await user.save();
        }

        res.status(200).json({ success: true, data: updatedOrder });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/orders/verify
// @access  Private
exports.verifyOrder = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
            if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

            order.isPaid = true;
            order.paidAt = Date.now();
            order.status = 'Completed';
            order.paymentInfo = {
                id: razorpay_payment_id,
                status: 'captured'
            };
            await order.save();
            return res.status(200).json({ success: true, message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ success: false, message: "Invalid signature sent!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
