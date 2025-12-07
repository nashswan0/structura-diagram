import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { merchantRef, userId } = req.query;

    // Validate input
    if (!merchantRef && !userId) {
      return res.status(400).json({ error: 'Missing required parameter' });
    }

    let query = supabase.from('transactions').select('*');

    // Filter by merchant_ref or user_id
    if (merchantRef) {
      query = query.eq('merchant_ref', merchantRef);
    } else if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: transaction, error } = await query.single();

    if (error || !transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Return transaction status
    return res.status(200).json({
      success: true,
      data: {
        reference: transaction.tripay_reference,
        merchant_ref: transaction.merchant_ref,
        status: transaction.status,
        amount: transaction.amount,
        tokens: transaction.tokens_purchased,
        qr_url: transaction.qr_url,
        qr_string: transaction.qr_string,
        checkout_url: transaction.checkout_url,
        expired_at: transaction.expired_at,
        paid_at: transaction.paid_at,
        created_at: transaction.created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching transaction status:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
