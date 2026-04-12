const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    mobile: {
        type: String,
        required: [true, 'Please add a mobile number'],
        unique: true,
        match: [/^\d{10}$/, 'Please add a valid 10-digit mobile number']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Do not return password by default
    },
    role: {
        type: String,
        enum: ['farmer', 'admin', 'staff'],
        default: 'farmer'
    },
    // Specific to Farmer/Shop Location
    state: {
        type: String,
        required: [true, 'Please add a state']
    },
    district: {
        type: String,
        required: [true, 'Please add a district']
    },
    taluka: {
        type: String,
        required: [true, 'Please add a taluka']
    },
    town: {
        type: String,
        required: [true, 'Please add a town/city']
    },
    village: {
        type: String
    },
    // Specific to Shop Owner
    shopName: {
        type: String,
        trim: true
    },
    landSize: {
        type: Number // in acres
    },
    crop: {
        type: String
    },
    // Borrow/Credit Tracking for farmers
    remainingBorrowAmount: {
        type: Number,
        default: 0
    },
    creditRisk: {
        type: String,
        enum: ['low', 'medium', 'high', 'unassigned'],
        default: 'unassigned'
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
