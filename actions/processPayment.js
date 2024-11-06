const Model = require('../models/model');
const crypto = require('crypto');
const topUpCredit = require('./alysa/topUpCredit');

exports.processPayment = async (data) => {
  try {
    console.log('📥 Midtrans webhook received', data);

    // Verify signature
    if (!verifySignature(data)) {
        console.error('🚫 Invalid signature');
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Invalid signature' })
        }
    }
    console.log('✅ Signature verified');

    // Process the webhook notification based on transaction status
    console.log('⏳ Processing webhook notification');
    await handleTransactionStatus(data)

    // Return success response
    console.log('✅ Midtrans webhook processed successfully');
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Midtrans webhook processed successfully' })
    }
  } catch (error) {
    console.error('❌ Error processing midtrans webhook:', error);
    return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error processing midtrans webhook: ' + error })
    }
  }
}

// Verify Midtrans signature
const verifySignature = (data) => {
    console.log('🔄 Verifying signature...');
    const { orderId, statusCode, grossAmount, signatureKey } = data
    
    // Create the string to hash: order_id + status_code + gross_amount + ServerKey
    const stringToHash = `${orderId}${statusCode}${grossAmount}${process.env.MIDTRANS_SECRET}`
    
    // Generate SHA-512 hash
    const calculatedSignature = crypto
      .createHash('sha512')
      .update(stringToHash)
      .digest('hex')
    
    // Compare the calculated signature with the received signature
    return calculatedSignature === signatureKey
}

// Handle different transaction statuses
const handleTransactionStatus = async (data) => {
  switch (data.transactionStatus) {
    case 'settlement':
    case 'capture':
      await processSuccessfulPayment(data)
      break
    case 'pending':
      await processPendingPayment(data)
      break
    case 'deny':
    case 'cancel':
    case 'expire':
    case 'failure':
      await processFailedPayment(data)
      break
  }
}

// Process successful payment
const processSuccessfulPayment = async (data) => {
    console.log('⏳ Processing successful payment:', data.orderId)
    try {
        if (data.orderId) {
            console.log('📝 Updating transaction status to settlement...');
            const transaction = await Model.findOneAndUpdate(
                { orderId: data.orderId },
                { $set: { transactionStatus: 'settlement' } },
                { returnDocument: 'after' }
            );
            if (!transaction) {
                console.error('❌ Transaction not found');
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'Transaction not found' })
                };
            }
            console.log('✅ Transaction status updated successfully', transaction);

            // Update user credit
            console.log('⏳ Updating user credit:', transaction.email);
            const topUpCreditResponse = await topUpCredit(transaction.email);
            return {
                statusCode: topUpCreditResponse.statusCode,
                body: JSON.stringify(topUpCreditResponse.body)
            };
        }
    } catch (error) {
        console.error('❌ Failed to update transaction status:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to update transaction status' })
        };
    }
}

// Process pending payment
const processPendingPayment = async (data) => {
    console.log('⏳ Processing pending payment:', data.orderId);
}

// Process failed payment
const processFailedPayment = async (data) => {
    console.log('❌ Processing failed payment:', data.orderId);
    try {
        await Model.findOneAndUpdate(
            { orderId: data.orderId },
            { $set: { transactionStatus: 'failed' } },
            { returnDocument: 'after' }
        );
        console.log('✅ Transaction status updated successfully');
    } catch (error) {
        console.error('❌ Failed to update transaction status:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to update transaction status' })
        };
    }
}