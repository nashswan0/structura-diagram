import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { validateCallbackSignature } from '../../src/lib/tripay.js';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface TripayCallbackPayload {
  reference: string;
  merchant_ref: string;
  payment_method: string;
  payment_method_code: string;
  total_amount: number;
  fee_merchant: number;
  fee_customer: number;
  total_fee: number;
  amount_received: number;
  is_closed_payment: number;
  status: 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUND';
  paid_at: number | null;
  note: string | null;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Get callback signature from header
    const callbackSignature = req.headers['x-callback-signature'] as string;
    const callbackEvent = req.headers['x-callback-event'] as string;

    if (!callbackSignature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing callback signature' 
      });
    }

    // Validate callback event
    if (callbackEvent !== 'payment_status') {
      return res.status(400).json({ 
        success: false, 
        message: 'Unrecognized callback event: ' + callbackEvent 
      });
    }

    // Get raw body as string for signature validation
    const rawBody = JSON.stringify(req.body);

    // Validate signature
    const isValidSignature = validateCallbackSignature(callbackSignature, rawBody);
    if (!isValidSignature) {
      console.error('Invalid callback signature');
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid signature' 
      });
    }

    // Parse callback data
    const callbackData: TripayCallbackPayload = req.body;

    // Only process closed payment
    if (callbackData.is_closed_payment !== 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only closed payment is supported' 
      });
    }

    // Get transaction from database
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('tripay_reference', callbackData.reference)
      .eq('merchant_ref', callbackData.merchant_ref)
      .single();

    if (fetchError || !transaction) {
      console.error('Transaction not found:', callbackData.reference);
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found or already processed' 
      });
    }

    // Check if already processed
    if (transaction.status === 'PAID') {
      return res.status(200).json({ 
        success: true,
        message: 'Transaction already processed'
      });
    }

    // Update transaction status based on callback status
    const status = callbackData.status;
    const paidAt = callbackData.paid_at 
      ? new Date(callbackData.paid_at * 1000).toISOString() 
      : null;

    // Use the complete_transaction function for PAID status
    if (status === 'PAID') {
      const { data, error: completeError } = await supabase.rpc(
        'complete_transaction',
        {
          transaction_reference: callbackData.reference,
          new_status: status,
          payment_time: paidAt,
        }
      );

      if (completeError) {
        console.error('Error completing transaction:', completeError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to complete transaction' 
        });
      }

      console.log('Transaction completed successfully:', callbackData.reference);
      console.log('Tokens added to user:', transaction.user_id);
    } else {
      // For other statuses (EXPIRED, FAILED), just update the status
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status,
          paid_at: paidAt,
          updated_at: new Date().toISOString(),
        })
        .eq('tripay_reference', callbackData.reference);

      if (updateError) {
        console.error('Error updating transaction:', updateError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to update transaction' 
        });
      }

      console.log('Transaction status updated:', callbackData.reference, status);
    }

    // Return success response as expected by TriPay
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Callback error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
