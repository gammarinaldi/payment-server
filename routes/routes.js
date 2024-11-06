const express = require('express');
const Model = require('../models/model');
const router = express.Router();
const { processPayment } = require('../actions/processPayment');

// Receive transaction data from Midtrans
router.post('/transaction-server', async (req, res) => {
    const data = new Model({
        orderId: req.body.order_id,
        transactionStatus: req.body.transaction_status,
        grossAmount: req.body.gross_amount,
        signatureKey: req.body.signature_key,
        statusCode: req.body.status_code
    })

    try {
        const response = await processPayment(data);
        res.status(response.statusCode).send(response.body);
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Create transaction
router.post('/create-transaction', async (req, res) => {
    const data = new Model({
        orderId: req.body.orderId,
        transactionStatus: 'pending',
        grossAmount: req.body.amount,
        email: req.body.email,
        itemId: req.body.itemId,
        itemName: req.body.itemName,
        createdAt: new Date(),
        updatedAt: new Date()
    })

    try {
        const response = await Model.create(data);
        res.json(response);
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Get all transactions
router.get('/get-all-transactions', async (req, res) => {
    try {
        const data = await Model.find();
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Get transaction by ID
router.get('/get-transaction/:orderId', async (req, res) => {
    try {
        const data = await Model.findById(req.params.orderId);
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Update transaction by ID
router.patch('/update-transaction/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const updatedData = req.body;
        const options = { new: true };

        const result = await Model.findByIdAndUpdate(
            orderId, updatedData, options
        )

        res.send(result)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Delete transaction by ID
router.delete('/delete-transaction/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const data = await Model.findByIdAndDelete(orderId)
        res.send(`Document with ${data.orderId} has been deleted..`)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

module.exports = router;