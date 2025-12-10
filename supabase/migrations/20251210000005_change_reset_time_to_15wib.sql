-- Change reset time from 00:00 WIB to 15:00 WIB (08:00 UTC)
-- This updates the reset_daily_usage function to use timestamp-based reset

-- First, add a new column to track last reset timestamp
ALTER TABLE gemini_key_usage 
ADD COLUMN IF NOT EXISTS last_reset_timestamp TIMESTAMPTZ DEFAULT NOW();

-- Update existing rows to have proper timestamp
UPDATE gemini_key_usage 
SET last_reset_timestamp = (last_reset_date::timestamp + interval '8 hours') AT TIME ZONE 'UTC'
WHERE last_reset_timestamp IS NULL;

-- Update reset_daily_usage function to reset at 15:00 WIB (08:00 UTC)
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_time_utc TIMESTAMPTZ;
  last_reset_time_utc TIMESTAMPTZ;
  reset_hour_utc INTEGER := 8; -- 08:00 UTC = 15:00 WIB
BEGIN
  current_time_utc := NOW();
  
  -- Get the most recent reset timestamp
  SELECT MAX(last_reset_timestamp) INTO last_reset_time_utc
  FROM gemini_key_usage;
  
  -- Calculate today's reset time (08:00 UTC)
  DECLARE
    today_reset_time TIMESTAMPTZ;
  BEGIN
    today_reset_time := date_trunc('day', current_time_utc) + (reset_hour_utc || ' hours')::interval;
    
    -- If current time is past today's reset time AND last reset was before today's reset time
    IF current_time_utc >= today_reset_time AND 
       (last_reset_time_utc IS NULL OR last_reset_time_utc < today_reset_time) THEN
      
      -- Reset all keys
      UPDATE gemini_key_usage
      SET 
        usage_count = 0,
        is_exhausted = FALSE,
        last_reset_date = CURRENT_DATE,
        last_reset_timestamp = current_time_utc,
        updated_at = NOW();
        
      RAISE NOTICE 'Keys reset at % (15:00 WIB)', current_time_utc;
    END IF;
  END;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION reset_daily_usage() IS 'Resets all API key usage counters daily at 15:00 WIB (08:00 UTC)';
