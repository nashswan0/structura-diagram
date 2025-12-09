-- Create table to track Gemini API key usage
CREATE TABLE IF NOT EXISTS gemini_key_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_index INTEGER NOT NULL,
  usage_count INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  is_exhausted BOOLEAN DEFAULT FALSE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint per key (1-5)
CREATE UNIQUE INDEX IF NOT EXISTS idx_key_index ON gemini_key_usage(key_index);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_last_reset ON gemini_key_usage(last_reset_date);
CREATE INDEX IF NOT EXISTS idx_exhausted ON gemini_key_usage(is_exhausted);

-- Initialize 5 keys
INSERT INTO gemini_key_usage (key_index, usage_count, is_exhausted) VALUES
  (1, 0, FALSE),
  (2, 0, FALSE),
  (3, 0, FALSE),
  (4, 0, FALSE),
  (5, 0, FALSE)
ON CONFLICT (key_index) DO NOTHING;

-- Function to increment key usage
CREATE OR REPLACE FUNCTION increment_key_usage(key_idx INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE gemini_key_usage
  SET 
    usage_count = usage_count + 1,
    last_used_at = NOW(),
    updated_at = NOW()
  WHERE key_index = key_idx;
END;
$$;

-- Function to reset all keys daily
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE gemini_key_usage
  SET 
    usage_count = 0,
    is_exhausted = FALSE,
    last_reset_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE last_reset_date < CURRENT_DATE;
END;
$$;

-- Function to mark key as exhausted
CREATE OR REPLACE FUNCTION mark_key_exhausted(key_idx INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE gemini_key_usage
  SET 
    is_exhausted = TRUE,
    updated_at = NOW()
  WHERE key_index = key_idx;
END;
$$;

-- Function to get next available key
CREATE OR REPLACE FUNCTION get_next_available_key()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_key INTEGER;
BEGIN
  -- First, reset if new day
  PERFORM reset_daily_usage();
  
  -- Get non-exhausted key with lowest usage
  SELECT key_index INTO next_key
  FROM gemini_key_usage
  WHERE is_exhausted = FALSE
  ORDER BY usage_count ASC, last_used_at ASC NULLS FIRST
  LIMIT 1;
  
  -- If no available key, return NULL
  IF next_key IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN next_key;
END;
$$;
