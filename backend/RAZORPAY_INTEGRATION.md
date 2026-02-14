# Razorpay Payment Integration Guide

## Overview
This document explains the Razorpay payment integration for the Vehicle Service Application, covering both customer payments and technician payouts.

## Features Implemented

### 1. Customer Wallet Top-up
- Customers can add money to their wallet using Razorpay
- Supports UPI, Cards, Net Banking, and other payment methods
- Real-time balance updates after successful payment

### 2. Bill Payment
- Customers can pay service bills using Razorpay
- Payment is held in escrow until job completion
- Automatic technician wallet crediting upon successful payment

### 3. Transaction Tracking
- Complete audit trail of all payments
- Razorpay order ID and payment ID stored for reference
- Transaction history available for both customers and technicians

## Backend Implementation

### Files Created/Modified

1. **`/backend/utils/razorpayService.js`**
   - Razorpay SDK wrapper
   - Functions: createOrder, verifyPaymentSignature, fetchPayment, createPayout, createRefund

2. **`/backend/controllers/razorpayController.js`**
   - Payment controller with 4 main endpoints:
     - `createWalletTopupOrder` - Creates Razorpay order for wallet top-up
     - `verifyWalletTopup` - Verifies and processes wallet top-up payment
     - `createBillPaymentOrder` - Creates Razorpay order for bill payment
     - `verifyBillPayment` - Verifies and processes bill payment

3. **`/backend/routes/customerRoutes.js`**
   - Added 4 new routes:
     - `POST /api/customer/wallet/create-order`
     - `POST /api/customer/wallet/verify-payment`
     - `POST /api/customer/jobs/:id/bill/create-order`
     - `POST /api/customer/jobs/:id/bill/verify-payment`

4. **`/backend/models/Transaction.js`**
   - Added fields: `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`

5. **`/backend/models/ServiceRequest.js`**
   - Added Razorpay fields to bill object: `razorpayOrderId`, `razorpayPaymentId`

## Payment Flow

### Wallet Top-up Flow

```
1. Customer clicks "Add Money" → Opens amount input modal
2. Customer enters amount → Frontend calls /api/customer/wallet/create-order
3. Backend creates Razorpay order → Returns order details
4. Frontend opens Razorpay checkout → Customer completes payment
5. Razorpay returns payment details → Frontend calls /api/customer/wallet/verify-payment
6. Backend verifies signature → Updates wallet balance → Creates transaction record
7. Customer sees updated balance
```

### Bill Payment Flow

```
1. Customer approves bill → Selects Razorpay payment method
2. Frontend calls /api/customer/jobs/:id/bill/create-order
3. Backend creates Razorpay order → Returns order details
4. Frontend opens Razorpay checkout → Customer completes payment
5. Razorpay returns payment details → Frontend calls /api/customer/jobs/:id/bill/verify-payment
6. Backend verifies signature → Updates job status → Creates transactions
7. Technician wallet credited → Job marked as completed
```

## API Endpoints

### Create Wallet Top-up Order
```http
POST /api/customer/wallet/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000
}

Response:
{
  "orderId": "order_xyz123",
  "amount": 100000,
  "currency": "INR",
  "keyId": "rzp_test_..."
}
```

### Verify Wallet Top-up Payment
```http
POST /api/customer/wallet/verify-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_xyz123",
  "paymentId": "pay_abc456",
  "signature": "signature_string"
}

Response:
{
  "success": true,
  "walletBalance": 1500.00,
  "amount": 1000
}
```

### Create Bill Payment Order
```http
POST /api/customer/jobs/:jobId/bill/create-order
Authorization: Bearer <token>

Response:
{
  "orderId": "order_xyz123",
  "amount": 250000,
  "currency": "INR",
  "keyId": "rzp_test_..."
}
```

### Verify Bill Payment
```http
POST /api/customer/jobs/:jobId/bill/verify-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_xyz123",
  "paymentId": "pay_abc456",
  "signature": "signature_string"
}

Response:
{
  "success": true,
  "job": { /* updated job object */ }
}
```

## Environment Variables

Add these to your `.env` file:

```env
# Razorpay Test Keys
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key

# Razorpay Production Keys (when going live)
# RAZORPAY_KEY_ID=rzp_live_your_key_id
# RAZORPAY_KEY_SECRET=your_secret_key

# Webhook Secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Account Number (for payouts)
RAZORPAY_ACCOUNT_NUMBER=your_account_number
```

## Setup Instructions

### 1. Get Razorpay Credentials

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to Settings → API Keys
3. Generate Test Keys for development
4. Copy Key ID and Key Secret

### 2. Configure Backend

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Add Razorpay credentials to `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_secret_key
   ```

3. Restart the server:
   ```bash
   npm run dev
   ```

### 3. Test Payment Flow

1. Use test cards from [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
2. Test successful payment: `4111 1111 1111 1111`
3. Test failed payment: `4000 0000 0000 0002`

## Security Considerations

### 1. Signature Verification
- All payments are verified using Razorpay signature
- Prevents tampering and ensures payment authenticity

### 2. Server-Side Validation
- Amount verification happens on server
- Cannot be manipulated from client

### 3. Transaction Logging
- All payments logged with Razorpay IDs
- Complete audit trail maintained

### 4. Error Handling
- Failed payments don't update balances
- Proper error messages returned to client

## Technician Payout (Future Enhancement)

The `createPayout` function in `razorpayService.js` is ready for technician withdrawals:

```javascript
// When technician requests withdrawal
const payout = await createPayout(
  technicianAccountId,
  amount,
  'technician_withdrawal'
);
```

**Requirements:**
- Enable Razorpay X (for payouts)
- Add technician bank account details
- Implement withdrawal request flow

## Webhook Integration (Optional)

For production, set up webhooks to handle:
- Payment success/failure notifications
- Automatic status updates
- Refund notifications

**Webhook URL:** `https://your-domain.com/api/webhooks/razorpay`

## Testing Checklist

- [ ] Wallet top-up with test card
- [ ] Wallet top-up failure scenario
- [ ] Bill payment with test card
- [ ] Bill payment failure scenario
- [ ] Transaction history updates
- [ ] Technician wallet crediting
- [ ] Signature verification
- [ ] Error handling

## Production Deployment

Before going live:

1. **Switch to Live Keys**
   - Replace test keys with live keys
   - Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

2. **Enable Webhooks**
   - Set up webhook endpoint
   - Configure webhook secret
   - Test webhook delivery

3. **Compliance**
   - Ensure PCI DSS compliance
   - Add privacy policy
   - Add terms of service

4. **Testing**
   - Test with real small amounts
   - Verify all payment flows
   - Check transaction logging

## Support

For Razorpay integration issues:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)
- [API Reference](https://razorpay.com/docs/api/)

## Troubleshooting

### Payment Signature Verification Failed
- Check if `RAZORPAY_KEY_SECRET` is correct
- Ensure order ID and payment ID match
- Verify signature generation logic

### Order Creation Failed
- Verify API keys are set correctly
- Check amount is in valid range (>= 100 paise)
- Ensure network connectivity

### Wallet Not Updating
- Check transaction logs
- Verify payment verification endpoint is called
- Check database connection

## License

This integration follows Razorpay's terms of service and API usage guidelines.
