-- Fix: Update increment_key_usage to automatically mark exhausted at 20 RPD
CREATE OR REPLACE FUNCTION increment_key_usage(key_idx INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE gemini_key_usage
  SET 
    usage_count = usage_count + 1,
    -- Automatically mark as exhausted when reaching 20 RPD
    is_exhausted = CASE 
      WHEN usage_count + 1 >= 20 THEN TRUE 
      ELSE FALSE 
    END,
    last_used_at = NOW(),
    updated_at = NOW()
  WHERE key_index = key_idx;
END;
$$;

-- Fix: Update mark_key_exhausted to trust application logic
-- When application calls this, it means Gemini API returned 429
-- We must sync database state with actual API state
CREATE OR REPLACE FUNCTION mark_key_exhausted(key_idx INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark as exhausted when called (trust application logic)
  -- This syncs database state with actual Gemini API state
  UPDATE gemini_key_usage
  SET 
    is_exhausted = TRUE,
    updated_at = NOW()
  WHERE key_index = key_idx;
    
  -- Log for monitoring
  RAISE NOTICE 'Marked key % as exhausted (synced with Gemini API)', key_idx;
END;
$$;
