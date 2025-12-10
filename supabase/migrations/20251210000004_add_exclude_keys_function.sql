-- Create function to get next available key excluding specific keys
CREATE OR REPLACE FUNCTION get_next_available_key_excluding(excluded_keys INTEGER[])
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_key INTEGER;
BEGIN
  -- First, reset if new day
  PERFORM reset_daily_usage();
  
  -- Get non-exhausted key with lowest usage, excluding specified keys
  SELECT key_index INTO next_key
  FROM gemini_key_usage
  WHERE is_exhausted = FALSE
    AND NOT (key_index = ANY(excluded_keys))  -- Exclude keys in array
  ORDER BY usage_count ASC, last_used_at ASC NULLS FIRST
  LIMIT 1;
  
  -- If no available key, return NULL
  IF next_key IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN next_key;
END;
$$;
