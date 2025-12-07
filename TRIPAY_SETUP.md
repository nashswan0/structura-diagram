# TriPay Payment Integration - Setup Guide

## 📋 Quick Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and update with your credentials:

```bash
# TriPay Sandbox (already configured)
VITE_TRIPAY_API_KEY=DEV-17cZqVBW5Y3AncSjhHrUbnX5fhRpM9TrKl3LJkmX
VITE_TRIPAY_PRIVATE_KEY=GRE51-cNKDN-8AjiQ-HV4EB-SubXo
VITE_TRIPAY_MERCHANT_CODE=T46678
VITE_TRIPAY_MODE=sandbox
VITE_TRIPAY_API_URL=https://tripay.co.id/api-sandbox
```

### 2. Database Migration

Run the migration to create the `transactions` table:

```bash
cd supabase
supabase db reset
# or apply specific migration
supabase migration up
```

### 3. Test Locally

```bash
npm run dev
```

Navigate to `/purchase` and test the payment flow.

## 🧪 Testing with TriPay Simulator

### Test Callback Webhook

1. Deploy to Vercel or use ngrok for local testing
2. Register callback URL in TriPay dashboard: `https://your-domain.vercel.app/api/tripay/callback`
3. Use TriPay Callback Tester: https://tripay.co.id/simulator/console/callback
4. Select your transaction and send PAID callback

## 📁 Files Created

### Database
- `supabase/migrations/20251206000000_add_transactions_table.sql`

### Backend API
- `api/tripay/create-transaction.ts` - Create QRIS transaction
- `api/tripay/callback.ts` - Webhook handler
- `api/tripay/transaction-status.ts` - Status polling

### Frontend
- `src/lib/tripay.ts` - Utility functions
- `src/hooks/useTransaction.ts` - Transaction hook
- `src/components/QRISModal.tsx` - QRIS modal
- `src/contexts/AuthContext.tsx` - Auth context
- Updated: `src/pages/TokenPurchase.tsx`

### Configuration
- `vercel.json` - API routes
- `.env.example` - Environment template

## 🔄 Payment Flow

1. User selects token package
2. System creates transaction via API
3. TriPay generates QRIS code
4. User scans and pays
5. TriPay sends callback to webhook
6. System verifies signature and updates transaction
7. Tokens automatically added to user balance

## 🚀 Production Deployment

1. Update environment variables in Vercel dashboard
2. Switch to production TriPay credentials
3. Register production callback URL in TriPay merchant dashboard
4. Test with small transaction first

## 📝 Notes

- Sandbox mode is active by default
- QRIS transactions expire after 1 hour
- Callback signature validation is required for security
- Transaction status polling happens every 3 seconds
