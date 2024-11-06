const topUpCredit = async (email) => {
    try {
        const paymentClientResponse = await fetch(process.env.NEXT_PUBLIC_ALYSA + '/api/topup-credit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ email, credit: 10 })
        });

        if (!paymentClientResponse.ok) {
            console.error('❌ Payment Client Response:', paymentClientResponse);
            return {
                statusCode: paymentClientResponse.status,
                body: JSON.stringify({ error: paymentClientResponse.error })
            };
        }

        return {
            statusCode: paymentClientResponse.status,
            body: JSON.stringify({ message: 'User credit updated successfully' })
        };
    } catch (error) {
        console.error('❌ Failed to update user credit:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to update user credit' })
        };
    }
}

module.exports = topUpCredit;