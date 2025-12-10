-- Add 5 more keys to gemini_key_usage table
INSERT INTO gemini_key_usage (key_index, usage_count, is_exhausted) VALUES
  (6, 0, FALSE),
  (7, 0, FALSE),
  (8, 0, FALSE),
  (9, 0, FALSE),
  (10, 0, FALSE)
ON CONFLICT (key_index) DO NOTHING;
