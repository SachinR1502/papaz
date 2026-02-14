const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_key'
});

/**
 * Create a Razorpay order for payment
 * @param {number} amount - Amount in INR (will be converted to paise)
 * @param {string} currency - Currency code (default: INR)
 * @param {object} notes - Additional notes for the order
 * @returns {Promise<object>} Razorpay order object
 */
const createOrder = async (amount, currency = 'INR', notes = {}) => {
    try {
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt: `rcpt_${Date.now()}`,
            notes
        };

        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error('Razorpay createOrder error:', error);
        throw new Error('Failed to create payment order');
    }
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} True if signature is valid
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
    try {
        const text = `${orderId}|${paymentId}`;
        const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_key';

        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(text)
            .digest('hex');

        return generatedSignature === signature;
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
};

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<object>} Payment details
 */
const fetchPayment = async (paymentId) => {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        console.error('Razorpay fetchPayment error:', error);
        throw new Error('Failed to fetch payment details');
    }
};

/**
 * Create a payout/transfer to technician
 * @param {string} accountId - Razorpay account/contact ID
 * @param {number} amount - Amount in INR
 * @param {string} purpose - Purpose of transfer
 * @returns {Promise<object>} Transfer object
 */
const createPayout = async (accountId, amount, purpose = 'payout') => {
    try {
        // Note: This requires Razorpay Route/X features to be enabled
        const options = {
            account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            mode: 'IMPS',
            purpose,
            fund_account_id: accountId,
            queue_if_low_balance: true,
            reference_id: `payout_${Date.now()}`,
            narration: purpose
        };

        const payout = await razorpay.payouts.create(options);
        return payout;
    } catch (error) {
        console.error('Razorpay createPayout error:', error);
        throw new Error('Failed to create payout');
    }
};

/**
 * Refund a payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund (optional, full refund if not specified)
 * @returns {Promise<object>} Refund object
 */
const createRefund = async (paymentId, amount = null) => {
    try {
        const options = {};
        if (amount) {
            options.amount = Math.round(amount * 100); // Convert to paise
        }

        const refund = await razorpay.payments.refund(paymentId, options);
        return refund;
    } catch (error) {
        console.error('Razorpay createRefund error:', error);
        throw new Error('Failed to create refund');
    }
};

/**
 * Verify webhook signature
 * @param {string} body - Request body as string
 * @param {string} signature - X-Razorpay-Signature header
 * @param {string} secret - Webhook secret
 * @returns {boolean} True if signature is valid
 */
const verifyWebhookSignature = (body, signature, secret) => {
    try {
        const expectedSignature = crypto
            .createHmac('sha256', secret || process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest('hex');

        return expectedSignature === signature;
    } catch (error) {
        console.error('Webhook signature verification error:', error);
        return false;
    }
};

module.exports = {
    razorpay,
    createOrder,
    verifyPaymentSignature,
    fetchPayment,
    createPayout,
    createRefund,
    verifyWebhookSignature
};
