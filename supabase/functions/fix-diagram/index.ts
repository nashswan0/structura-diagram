import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { code, error } = await req.json();

    if (!code || !error) {
      return jsonResponse(
        { error: "Both 'code' and 'error' fields are required." },
        400
      );
    }

    // Load all 10 Gemini API keys (same as generate-diagram)
    const GEMINI_KEYS = [
      Deno.env.get("GEMINI_API_KEY_1"),
      Deno.env.get("GEMINI_API_KEY_2"),
      Deno.env.get("GEMINI_API_KEY_3"),
      Deno.env.get("GEMINI_API_KEY_4"),
      Deno.env.get("GEMINI_API_KEY_5"),
      Deno.env.get("GEMINI_API_KEY_6"),
      Deno.env.get("GEMINI_API_KEY_7"),
      Deno.env.get("GEMINI_API_KEY_8"),
      Deno.env.get("GEMINI_API_KEY_9"),
      Deno.env.get("GEMINI_API_KEY_10"),
    ];

    // Verify at least one key exists
    const validKeys = GEMINI_KEYS.filter(key => !!key);
    if (validKeys.length === 0) {
      console.error("❌ No Gemini API keys configured");
      return jsonResponse(
        { error: "Server misconfiguration: missing API keys" },
        500
      );
    }

    console.log(`✅ Loaded ${validKeys.length} Gemini API keys for fix-diagram`);

    // System prompt for fixing diagrams
    const systemPrompt = `You are a diagram syntax expert. Fix the broken diagram code based on the error.

CRITICAL RULES:
- Output ONLY the corrected diagram code
- NO explanations, NO reasoning, NO markdown
- Start directly with @startuml (PlantUML) or diagram type (Mermaid)
- Be concise and direct
- Fix syntax errors while preserving diagram intent`;

    const userPrompt = `Error: ${error}

Code:
${code}

Fix the error and return ONLY the corrected code.`;

    // 🔄 Multi-Key Rotation with Automatic Failover (same as generate-diagram)
    const callGeminiWithRotation = async (): Promise<string> => {
      const maxAttempts = 10;
      const exhaustedKeysThisRequest = new Set<number>(); // Track exhausted keys in memory
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          // Convert Set to array for RPC call
          const excludedKeys = Array.from(exhaustedKeysThisRequest);
          
          // Get next available key from database, excluding already-tried keys
          const { data: keyIndex, error: keyError } = await supabase
            .rpc('get_next_available_key_excluding', { excluded_keys: excludedKeys });

          if (keyError) {
            console.error("❌ Database error:", keyError);
            throw new Error("Failed to get API key");
          }

          if (!keyIndex) {
            console.error("❌ All keys exhausted for today");
            throw new Error("⏰ Kuota harian telah habis (100 diagram/hari). Silakan coba lagi besok.");
          }

          const apiKey = GEMINI_KEYS[keyIndex - 1];
          if (!apiKey) {
            console.error(`❌ Key #${keyIndex} not configured, skipping`);
            exhaustedKeysThisRequest.add(keyIndex); // Mark as tried
            continue;
          }

          console.log(`🔑 Fix-diagram using API key #${keyIndex} (attempt ${attempt}/${maxAttempts})`);

          // Call Gemini API
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
                generationConfig: {
                  temperature: 0.5,  // Low for focused fixes
                  topP: 0.7,
                  topK: 40,
                  maxOutputTokens: 8192,  // Smaller for fixes
                },
              }),
            }
          );

          // Handle 429 rate limit - sync database with actual API state
          if (response.status === 429) {
            const errorBody = await response.text();
            console.log(`⚠️ Key #${keyIndex} hit rate limit (20 RPD reached)`);
            console.log(`   Raw 429 response:`, errorBody);
            // Mark as exhausted to sync database with Gemini API state
            await supabase.rpc('mark_key_exhausted', { key_idx: keyIndex });
            // Also track in memory to prevent re-querying this key
            exhaustedKeysThisRequest.add(keyIndex);
            continue;
          }

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API error (key #${keyIndex}):`);
            console.error(`   Status: ${response.status} ${response.statusText}`);
            console.error(`   Raw response:`, errorText);
            
            // Try to parse as JSON for better readability
            try {
              const errorJson = JSON.parse(errorText);
              console.error(`   Parsed error:`, JSON.stringify(errorJson, null, 2));
            } catch (e) {
              console.error(`   (Not JSON format)`);
            }
            
            if (response.status === 503) {
              throw new Error("Gemini service temporarily unavailable");
            }
            if (response.status === 401) {
              throw new Error(`API key #${keyIndex} is invalid or unauthorized`);
            }
            if (response.status === 400) {
              throw new Error(`Bad request to Gemini API (key #${keyIndex})`);
            }
            throw new Error(`API error: ${response.status} - ${response.statusText}`);
          }

          // Success! Parse response
          const data = await response.json();
          
          // Log response info
          console.log(`📊 Gemini Fix Response (Key #${keyIndex}):`);
          console.log(`   Model: gemini-2.5-flash`);
          console.log(`   Finish Reason: ${data?.candidates?.[0]?.finishReason || 'N/A'}`);
          
          if (data?.usageMetadata) {
            console.log(`   📈 Token Usage:`);
            console.log(`      - Total Tokens: ${data.usageMetadata.totalTokenCount || 0}`);
          }

          const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (!generatedText) {
            console.error("⚠️ No text in response");
            throw new Error("No fixed diagram generated");
          }

          console.log(`   ✅ Fixed ${generatedText.length} characters`);

          // Increment usage counter
          await supabase.rpc('increment_key_usage', { key_idx: keyIndex });
          console.log(`✅ Fix success with key #${keyIndex} - Usage incremented`);

          return generatedText;

        } catch (error) {
          console.error(`❌ Attempt ${attempt} failed:`, error);
          
          if (attempt >= maxAttempts) {
            throw error;
          }
        }
      }

      throw new Error("All API keys failed");
    };

    // Fix diagram
    const generatedText = await callGeminiWithRotation();

    // Clean markdown if present
    let cleaned = generatedText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned
        .replace(/```(mermaid|plantuml)?\n?/gi, "")
        .replace(/```/g, "")
        .trim();
    }

    return jsonResponse({ diagram: cleaned });

  } catch (err) {
    console.error("🔥 Error in fix-diagram:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500
    );
  }
});
