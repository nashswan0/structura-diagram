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
    const { prompt } = await req.json();
    if (!prompt) return jsonResponse({ error: "Prompt is required" }, 400);

    // Load all 10 Gemini API keys (200 RPD capacity)
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

    console.log(`✅ Loaded ${validKeys.length} Gemini API keys`);

    // System prompt - BALANCED FOR SMART DETAIL LEVEL
    const systemPrompt = `
You are a world's best diagram generation expert proficient in both Mermaid and PlantUML syntax.
Your mission is to generate a fully valid, complete, and immediately renderable diagram that precisely represents the user's description.

🎯 SMART DETAIL LEVEL:
- Analyze the user's prompt to determine desired detail level
- If user asks for "detail", "lengkap", "comprehensive", "complete" → Generate VERY DETAILED diagrams
- If user asks for "simple", "basic", "sederhana" → Generate CONCISE diagrams
- Otherwise → Generate BALANCED diagrams with essential elements

BALANCED APPROACH (default):
- Include main actors and primary use cases
- Cover core functionality and key relationships
- Include important decision points and error handling
- Avoid excessive detail unless specifically requested
- Focus on clarity and readability

MANDATORY RULES:
- Match user's language (English/Indonesian)
- Use correct shapes for every activity, process, decision, start, end, etc.
- Output ONLY valid code (no markdown, no explanations)

🧩 Diagram Syntax Rules:
- If NOT UML-specific → use Mermaid syntax (ERD, flowchart, Gantt, Kanban, pie chart, git graph, state diagram, timeline, etc.)
- If UML-specific → use PlantUML syntax (sequence, class, activity, use case, component, deployment, object, etc.)
- Output ONLY the valid code (no markdown, no explanations, no comments).

🧰 Mermaid Syntax Safety Rules:
- Every node/subgraph ID must be unique.
  Example: If both share "B", rename subgraph as "B_SG".
- Never connect a node to itself (no "A --> A").
- Wrap labels with (), /, &, -, or : in double quotes.
  Example: F1["User Login (OAuth)"]
- Do NOT use raw double quotes inside labels — use single quotes or &quot;.
  Example: N1["Display 'Error message'"]
- Do not escape quotes using backslashes.
- Each arrow or connection must be on its own line (or separated by a semicolon).
- Ensure no cyclic dependencies, duplicated IDs, or malformed edges.
- Any label that contains parentheses (), slash /, colon :, dash -, ampersand &, comma ,, or other special characters MUST always be wrapped in double quotes.
- NEVER place special characters directly inside a Mermaid node label without quotes. Doing so causes Mermaid parse errors.
- When a decision node is used in Mermaid (e.g., A{...}), and the content contains any special characters, AUTO-CONVERT it into a quoted label version:
    A{"Verifikasi OTP (Email/SMS)"}
- Prevent collisions between Mermaid syntax characters and text labels by quoting any label that is not plain alphanumeric.

🧰 PlantUML Syntax Safety Rules:
1. For activity diagram with swimlanes (HIGHLY RECOMMENDED for multi-actor processes):
   - Use pipe | to define swimlanes (columns) for each actor/role
   - Syntax: |Actor Name|
   - Place activities under the appropriate actor's swimlane
   - Arrows can cross swimlanes to show interaction between actors
    - ALWAYS use swimlanes when diagram involves multiple actors/departments
   - Each swimlane represents one actor's responsibilities
   - Activities flow vertically within swimlanes
   - Use arrows to show handoffs between actors
   - **IMPORTANT: Use only ONE 'stop' statement at the very end of the diagram**
   - All branches and paths should converge to a single endpoint
   - Avoid multiple 'stop' statements in different branches
   
   Example structure:
   @startuml
   |Bagian Gudang|
   start
   :Member informasi data\nBarang yang akan dipesan;
   
   |Bagian Pembelian|
   :Menerima informasi;
   :Buat SPP;
   
   |Supplier|
   :Terima SPP;
   :Kirim Barang;
   
   |Bagian Gudang|
   :Terima Barang dan Faktur;
   :Buat SPB1;
   
   |Bagian Pembelian|
   :Tandatangani SPB1;
   stop
   @enduml
  
   
2. For parallel processing (optional):
   - Use fork, fork again, and end fork for concurrent activities
   - Use end merge to synchronize parallel flows

🚀 Performance:
- Well-structured and organized
- Complete within one response
- Balance detail with clarity

Now generate an accurate, well-balanced diagram for the user's request.
`;

    const userPrompt = `User request:\n${prompt}`;

    // 🔄 Multi-Key Rotation with Automatic Failover
    const callGeminiWithRotation = async (): Promise<string> => {
      const maxAttempts = 10; // Try up to 10 keys
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

          console.log(`🔑 Using API key #${keyIndex} (attempt ${attempt}/${maxAttempts})`);

          // Call Gemini API
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
                generationConfig: {
                  temperature: 0.7,
                  topP: 0.95,
                  topK: 50,
                  maxOutputTokens: 8192,
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
            continue; // Try next key
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
          
          // 📊 Log detailed response info
          console.log(`📊 Gemini API Response (Key #${keyIndex}):`);
          console.log(`   Model: gemini-2.5-flash`);
          console.log(`   Finish Reason: ${data?.candidates?.[0]?.finishReason || 'N/A'}`);
          
          // Log token usage if available
          if (data?.usageMetadata) {
            console.log(`   📈 Token Usage:`);
            console.log(`      - Prompt Tokens: ${data.usageMetadata.promptTokenCount || 0}`);
            console.log(`      - Completion Tokens: ${data.usageMetadata.candidatesTokenCount || 0}`);
            console.log(`      - Total Tokens: ${data.usageMetadata.totalTokenCount || 0}`);
          }
          
          const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (!generatedText) {
            console.error("⚠️ No text in response");
            console.error("Full response:", JSON.stringify(data, null, 2));
            throw new Error("No diagram generated");
          }

          console.log(`   ✅ Generated ${generatedText.length} characters`);

          // Increment usage counter
          await supabase.rpc('increment_key_usage', { key_idx: keyIndex });
          console.log(`✅ Success with key #${keyIndex} - Usage incremented`);

          return generatedText;

        } catch (error) {
          console.error(`❌ Attempt ${attempt} failed:`, error);
          
          if (attempt >= maxAttempts) {
            throw error;
          }
          // Continue to next key
        }
      }

      throw new Error("All API keys failed");
    };

    // Generate diagram
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
    console.error("🔥 Error:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500
    );
  }
});
