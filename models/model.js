const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    orderId: {
        required: true,
        type: String
    },
    transactionStatus: {
        required: false,
        type: String
    },
    statusCode: {
        required: false,
        type: String
    },
    grossAmount: {
        required: false,
        type: String
    },
    signatureKey: {
        required: false,
        type: String
    },
    email: {
        required: false,
        type: String
    },
    itemId: {
        required: false,
        type: String
    },
    itemName: {
        required: false,
        type: String
    },
    createdAt: {
        required: false,
        type: Date
    },
    updatedAt: {
        required: false,
        type: Date
    }
})

module.exports = mongoose.model('Transaction', dataSchema)