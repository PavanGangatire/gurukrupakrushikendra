const mongoose = require('mongoose');

const cropIssueSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Responded', 'Resolved'],
        default: 'Pending'
    },
    adminResponse: {
        type: String
    },
    suggestedProducts: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Product'
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('CropIssue', cropIssueSchema);
