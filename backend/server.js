const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple Request Logging (instead of morgan)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (Object.keys(req.query).length > 0) console.log('Query:', req.query);
    next();
});

const path = require('path');

// Mount Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const issueRoutes = require('./routes/issueRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/expenses', expenseRoutes);
app.get('/api/config/razorpay', (req, res) => res.send(process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'));

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Basic Route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Gurukrupa Krushi Kendra API is running.' });
});

// Start Server & Connect to DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra')
    .then(() => {
        console.log('Connected to MongoDB successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });
