-- Create transactions table for TriPay payment gateway
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tripay_reference text NOT NULL UNIQUE,
  merchant_ref text NOT NULL UNIQUE,
  payment_method text NOT NULL,
  payment_name text NOT NULL,
  amount integer NOT NULL,
  fee_merchant integer NOT NULL DEFAULT 0,
  fee_customer integer NOT NULL DEFAULT 0,
  total_fee integer NOT NULL DEFAULT 0,
  amount_received integer NOT NULL,
  tokens_purchased integer NOT NULL,
  status text NOT NULL DEFAULT 'UNPAID',
  qr_url text,
  qr_string text,
  checkout_url text,
  expired_at timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_tripay_reference ON public.transactions(tripay_reference);
CREATE INDEX idx_transactions_merchant_ref ON public.transactions(merchant_ref);

-- RLS Policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update transactions" ON public.transactions
  FOR UPDATE USING (true);

-- Function to add tokens to user balance
CREATE OR REPLACE FUNCTION public.add_tokens_to_user(
  user_uuid uuid,
  tokens_to_add integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update user tokens
  UPDATE public.user_tokens
  SET tokens_remaining = tokens_remaining + tokens_to_add
  WHERE user_id = user_uuid;
  
  -- Check if update was successful
  IF FOUND THEN
    RETURN TRUE;
  ELSE
    -- If no record exists, create one
    INSERT INTO public.user_tokens (user_id, tokens_remaining)
    VALUES (user_uuid, tokens_to_add);
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function to update transaction status and add tokens
CREATE OR REPLACE FUNCTION public.complete_transaction(
  transaction_reference text,
  new_status text,
  payment_time timestamp with time zone DEFAULT now()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trans_record RECORD;
  tokens_added boolean;
BEGIN
  -- Get transaction details
  SELECT * INTO trans_record
  FROM public.transactions
  WHERE tripay_reference = transaction_reference
  FOR UPDATE;
  
  -- Check if transaction exists
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update transaction status
  UPDATE public.transactions
  SET 
    status = new_status,
    paid_at = CASE WHEN new_status = 'PAID' THEN payment_time ELSE paid_at END,
    updated_at = now()
  WHERE tripay_reference = transaction_reference;
  
  -- If status is PAID, add tokens to user
  IF new_status = 'PAID' THEN
    SELECT public.add_tokens_to_user(trans_record.user_id, trans_record.tokens_purchased) INTO tokens_added;
    RETURN tokens_added;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Function to get user transaction history
CREATE OR REPLACE FUNCTION public.get_user_transactions(
  user_uuid uuid,
  limit_count integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  tripay_reference text,
  merchant_ref text,
  payment_method text,
  payment_name text,
  amount integer,
  tokens_purchased integer,
  status text,
  created_at timestamp with time zone,
  paid_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    tripay_reference,
    merchant_ref,
    payment_method,
    payment_name,
    amount,
    tokens_purchased,
    status,
    created_at,
    paid_at
  FROM public.transactions
  WHERE user_id = user_uuid
  ORDER BY created_at DESC
  LIMIT limit_count;
$$;
