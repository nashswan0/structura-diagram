-- Drop existing function if it exists (to handle return type change)
DROP FUNCTION IF EXISTS complete_transaction(TEXT, TEXT, TIMESTAMPTZ);

-- Create function to complete transaction and add tokens to user balance
CREATE OR REPLACE FUNCTION complete_transaction(
  transaction_reference TEXT,
  new_status TEXT,
  payment_time TIMESTAMPTZ
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_tokens_purchased INTEGER;
  v_current_status TEXT;
BEGIN
  -- Get transaction details
  SELECT user_id, tokens_purchased, status
  INTO v_user_id, v_tokens_purchased, v_current_status
  FROM transactions
  WHERE tripay_reference = transaction_reference;

  -- Check if transaction exists
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  -- Check if already processed
  IF v_current_status = 'PAID' THEN
    RETURN; -- Already processed, skip
  END IF;

  -- Update transaction status
  UPDATE transactions
  SET 
    status = new_status,
    paid_at = payment_time,
    updated_at = NOW()
  WHERE tripay_reference = transaction_reference;

  -- Add tokens to user balance
  INSERT INTO user_tokens (user_id, tokens_remaining)
  VALUES (v_user_id, v_tokens_purchased)
  ON CONFLICT (user_id)
  DO UPDATE SET
    tokens_remaining = user_tokens.tokens_remaining + v_tokens_purchased;
END;
$$;
