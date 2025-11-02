-- Drop the reset_daily_tokens function
DROP FUNCTION IF EXISTS public.reset_daily_tokens();

-- Remove the last_reset column from user_tokens table as it's no longer needed
ALTER TABLE public.user_tokens
DROP COLUMN IF EXISTS last_reset;
