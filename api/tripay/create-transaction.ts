import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {
  TRIPAY_CONFIG,
  getPackageDetails,
  generateMerchantRef,
  generateTransactionSignature,
  tripayRequest,
} from '../../src/lib/tripay.js';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

interface CreateTransactionRequest {
  packageId: string;
  userId: string;
}

interface TripayCreateTransactionResponse {
  success: boolean;
  message: string;
  data: {
    reference: string;
    merchant_ref: string;
    payment_selection_type: string;
    payment_method: string;
    payment_name: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    callback_url: string | null;
    return_url: string | null;
    amount: number;
    fee_merchant: number;
    fee_customer: number;
    total_fee: number;
    amount_received: number;
    pay_code: string | null;
    pay_url: string | null;
    checkout_url: string;
    status: string;
    expired_time: number;
    order_items: Array<{
      sku: string;
      name: string;
      price: number;
      quantity: number;
      subtotal: number;
    }>;
    instructions: any[];
    qr_string: string | null;
    qr_url: string | null;
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { packageId, userId } = req.body as CreateTransactionRequest;

    // Validate input
    if (!packageId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get package details
    const packageDetails = getPackageDetails(packageId);
    if (!packageDetails) {
      return res.status(400).json({ error: 'Invalid package ID' });
    }

    // Get user details from Supabase
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate merchant reference
    const merchantRef = generateMerchantRef();

    // Generate signature
    const signature = generateTransactionSignature(
      TRIPAY_CONFIG.merchantCode,
      merchantRef,
      packageDetails.price
    );

    // Prepare request data for TriPay
    const tripayData = {
      method: 'QRIS',
      merchant_ref: merchantRef,
      amount: packageDetails.price,
      customer_name: profile.full_name || 'Customer',
      customer_email: profile.email,
      order_items: [
        {
          sku: packageDetails.id.toUpperCase(),
          name: packageDetails.name,
          price: packageDetails.price,
          quantity: 1,
        },
      ],
      expired_time: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      signature,
    };

    // Create transaction in TriPay
    const tripayResponse = await tripayRequest<TripayCreateTransactionResponse>(
      '/transaction/create',
      'POST',
      tripayData
    );

    if (!tripayResponse.success) {
      return res.status(400).json({ 
        error: 'Failed to create transaction',
        message: tripayResponse.message 
      });
    }

    const { data: tripayTrx } = tripayResponse;

    // Save transaction to database
    const { data: transaction, error: dbError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        tripay_reference: tripayTrx.reference,
        merchant_ref: tripayTrx.merchant_ref,
        payment_method: tripayTrx.payment_method,
        payment_name: tripayTrx.payment_name,
        amount: tripayTrx.amount,
        fee_merchant: tripayTrx.fee_merchant,
        fee_customer: tripayTrx.fee_customer,
        total_fee: tripayTrx.total_fee,
        amount_received: tripayTrx.amount_received,
        tokens_purchased: packageDetails.tokens,
        status: tripayTrx.status,
        qr_url: tripayTrx.qr_url,
        qr_string: tripayTrx.qr_string,
        checkout_url: tripayTrx.checkout_url,
        expired_at: new Date(tripayTrx.expired_time * 1000).toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Failed to save transaction' });
    }

    // Return transaction details
    return res.status(200).json({
      success: true,
      data: {
        reference: tripayTrx.reference,
        merchant_ref: tripayTrx.merchant_ref,
        qr_url: tripayTrx.qr_url,
        qr_string: tripayTrx.qr_string,
        checkout_url: tripayTrx.checkout_url,
        amount: tripayTrx.amount,
        tokens: packageDetails.tokens,
        expired_at: tripayTrx.expired_time,
        status: tripayTrx.status,
      },
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
