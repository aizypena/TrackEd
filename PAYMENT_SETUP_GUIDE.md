# PayMongo Payment Integration - Development Guide

## 🧪 Mock Mode (Development)

The system is now configured to run in **mock mode** for development. This means:
- ✅ No real PayMongo API calls are made
- ✅ No actual money is charged
- ✅ You can test the complete payment flow locally
- ✅ Instant payment simulation (approve or fail)

## 🚀 Quick Start

### 1. Set Environment Variables

Add these to your `.env` file:

```env
# Use 'mock' for development (no real API calls)
PAYMONGO_MODE=mock

# Enrollment fee
ENROLLMENT_FEE=5000.00
```

### 2. Test the Payment Flow

1. **Try to approve a student when vouchers are full**
   - Go to Staff > Applicants
   - Select an applicant
   - Choose a batch with no available vouchers (e.g., 2/2 used)
   - Click "Approve Applicant"

2. **You'll see a yellow "Payment Required" notice**
   - Shows enrollment fee: ₱5,000
   - Button changes to "Pay & Approve Enrollment"

3. **Click "Pay & Approve Enrollment"**
   - Payment section appears
   - Select a payment method (GCash, PayMaya, etc.)
   - Click "Proceed to Payment"

4. **Mock Payment Page Opens**
   - A new window opens with a mock payment interface
   - Two buttons: "✅ Complete Payment" or "❌ Fail Payment"
   - Click "Complete Payment" to simulate successful payment
   - Click "Fail Payment" to simulate failed payment

5. **After Successful Payment**
   - Payment window closes automatically
   - Student is enrolled in the batch
   - Success toast notification appears
   - Student status changes to "not_eligible" (self-funded, not scholarship)

## 🔄 Payment Flow Diagram

```
Student Apply → Staff Review → Check Vouchers
                                    ↓
                          Vouchers Available?
                          /                  \
                       YES                   NO
                        ↓                     ↓
                 Approve Directly      Payment Required
                 (Scholarship)              ↓
                                    Select Payment Method
                                            ↓
                                    Mock Payment Page
                                            ↓
                                    Complete or Fail
                                            ↓
                                  If Paid → Enroll Student
                                           (Self-Funded)
```

## 📋 API Endpoints

### Payment Endpoints (Already Configured)

- `POST /api/payments/check-required` - Check if payment needed
- `POST /api/payments/intent` - Create payment (mock mode)
- `GET /api/payments/{id}/verify` - Check payment status
- `POST /api/payments/{id}/mock-complete` - Complete mock payment
- `POST /api/payments/{id}/mock-fail` - Fail mock payment
- `GET /api/payments/{id}/mock-payment` - Show mock payment page

## 🔧 Database

The `payments` table now tracks:
- `user_id` - Student who paid
- `batch_id` - Batch they're enrolling in
- `amount` - Payment amount (₱5,000)
- `payment_method` - gcash, paymaya, card, grab_pay
- `payment_status` - pending, paid, failed
- `paymongo_payment_id` - PayMongo reference (or mock ID)
- `paid_at` - Timestamp when paid

## 🎯 Testing Scenarios

### Scenario 1: Vouchers Available (Scholarship)
```
1. Create batch with 30 capacity, 2 voucher slots
2. Approve first student → Uses voucher slot 1/2 ✅
3. Approve second student → Uses voucher slot 2/2 ✅
4. Both students marked as "eligible" (scholarship)
```

### Scenario 2: Vouchers Exhausted (Self-Funded)
```
1. Vouchers already full (2/2 used)
2. Try to approve third student → Payment Required notice
3. Click "Pay & Approve Enrollment"
4. Select payment method → Mock payment page opens
5. Click "Complete Payment" → Payment successful
6. Student enrolled and marked as "not_eligible" (self-funded)
```

### Scenario 3: Payment Failed
```
1. Same as Scenario 2 up to step 4
2. Click "Fail Payment" instead
3. Payment marked as failed
4. Student NOT enrolled
5. Can retry payment later
```

## 🔐 Security Notes

### Mock Mode (Development Only)
- Mock payment endpoints are **only active** when `PAYMONGO_MODE=mock`
- If you set `PAYMONGO_MODE=live`, mock endpoints will return 403 Forbidden
- This prevents mock payments in production

## 🚀 Moving to Production

When ready to use real PayMongo:

1. **Update .env**:
   ```env
   PAYMONGO_MODE=test  # or 'live' for production
   ```

2. **Test with Real API**:
   - Real PayMongo API calls will be made
   - Use test keys first (pk_test_..., sk_test_...)
   - Real payment redirects to PayMongo checkout

3. **Go Live**:
   ```env
   PAYMONGO_MODE=live
   ```
   - Switch to live keys (pk_live_..., sk_live_...)
   - Real money will be charged
   - Configure webhooks in PayMongo dashboard

## 🐛 Troubleshooting

### "Payment Required" doesn't show
- Check voucher quantity vs used_count in database
- Ensure batch has vouchers configured
- Check `/api/payments/check-required` response

### Mock payment window doesn't open
- Check browser popup blocker
- Open browser console for errors
- Verify `PAYMONGO_MODE=mock` in .env

### Payment polling doesn't work
- Check browser console for network errors
- Verify payment ID exists in database
- Check Laravel logs: `tail -f storage/logs/laravel.log`

## 📊 Viewing Payments

Check payments in database:
```sql
SELECT * FROM payments ORDER BY created_at DESC;
```

Or use the API:
```bash
GET /api/users/{userId}/payments
GET /api/payments/{paymentId}
```

## ✅ Summary

You now have a **fully functional mock payment system** for development:
- ✅ No real money involved
- ✅ Test complete enrollment flow
- ✅ Simulate successful and failed payments
- ✅ Easy transition to real PayMongo when ready
- ✅ Separate voucher (scholarship) vs payment (self-funded) students

Happy testing! 🎉
