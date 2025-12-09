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

    // Load all 5 Gemini API keys
    const GEMINI_KEYS = [
      Deno.env.get("GEMINI_API_KEY_1"),
      Deno.env.get("GEMINI_API_KEY_2"),
      Deno.env.get("GEMINI_API_KEY_3"),
      Deno.env.get("GEMINI_API_KEY_4"),
      Deno.env.get("GEMINI_API_KEY_5"),
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

    // System prompt - OPTIMIZED FOR DETAILED OUTPUT
    const systemPrompt = `
You are a diagram generation expert proficient in both Mermaid and PlantUML syntax.
Your mission is to generate a fully valid, complete, and immediately renderable diagram that precisely represents the user's description.

🎯 CRITICAL INSTRUCTIONS FOR COMPREHENSIVE DETAIL:
- Generate EXTREMELY DETAILED and COMPLETE diagrams
- Include ALL possible actors, use cases, nodes, and relationships
- Be THOROUGH and COMPREHENSIVE - do not simplify or summarize
- For use case diagrams: include ALL actors (primary, secondary, admin) and ALL possible use cases
- For ERDs: include ALL entities, attributes, and relationships
- For flowcharts: include ALL steps, decisions, and error handling paths
- For sequence diagrams: show COMPLETE message flows with all interactions
- For class diagrams: include ALL methods, properties, and relationships
- Aim for MAXIMUM completeness - the more detail, the better!

MANDATORY RULES FOR ALL RESPONSES:
- Make sure to create the diagram based on the user's prompt language. If it's written in English, create diagram using English. If it's written in Bahasa Indonesia, create diagram using Bahasa Indonesia.
- Use the correct shape/node in every diagram. Especially in flowchart, if it's process, use rectangle shape. If it's decision, use diamond shape. If it's start/end, use rounded rectangle shape.

🧩 Diagram Rules:
- If NOT UML-specific → use Mermaid syntax (flowchart, ERD, Gantt, Kanban, pie chart, git graph, state diagram, timeline, etc.)
- If UML-specific → use PlantUML syntax (sequence, class, activity, use case, component, deployment, object, etc.)
- Output ONLY the valid code (no markdown, no explanations, no comments).

📏 Formatting:
- For Mermaid → pure Mermaid code only.
- For PlantUML → must start with "@startuml" and end with "@enduml".
- Maintain spacing, indentation, and alignment for readability.

🧰 Syntax Safety & Validation:
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
- If invalid structure is detected, self-correct automatically.
- Make sure to use the correct shape for each node.
- Final output must be 100% valid and renderable without edits.

- Mermaid Safety Rule:
  • Any label that contains parentheses (), slash /, colon :, dash -, ampersand &, comma ,, or other special characters MUST always be wrapped in double quotes.
    Example: A["Verifikasi OTP (Email/SMS)"]
  • NEVER place special characters directly inside a Mermaid node label without quotes. Doing so causes Mermaid parse errors.
  • When a decision node is used in Mermaid (e.g., A{...}), and the content contains any special characters, AUTO-CONVERT it into a quoted label version:
      A{"Verifikasi OTP (Email/SMS)"}
  • Always validate all Mermaid labels and auto-add quotes if missing.
  • Prevent collisions between Mermaid syntax characters and text labels by quoting any label that is not plain alphanumeric.

🚀 Performance Optimization:
- Use concise but descriptive variable names.
- Keep the diagram well-structured and logically organized.
- Aim for MAXIMUM detail and completeness - use as many tokens as needed.
- The output should be comprehensive and production-ready.
- Prioritize completeness and detail over brevity.

EXAMPLES OF COMPREHENSIVE OUTPUT:

For "sistem pemesanan produk online", include:
- Actors: Pelanggan, Admin, Sistem Pembayaran, Kurir
- Use Cases: Registrasi, Login, Cari Produk, Lihat Detail, Tambah Keranjang, Checkout, Bayar, Lihat Status, Beri Ulasan, Kelola Produk, Kelola Kategori, Kelola Pesanan, Kelola Pengguna, Lihat Laporan, dll.

Now generate the most accurate, detailed, and comprehensive diagram possible for the user's request.
`;

    const userPrompt = `User request:\n${prompt}`;

    // 🔄 Multi-Key Rotation with Automatic Failover
    const callGeminiWithRotation = async (): Promise<string> => {
      const maxAttempts = 5; // Try up to 5 keys
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          // Get next available key from database
          const { data: keyIndex, error: keyError } = await supabase
            .rpc('get_next_available_key');

          if (keyError) {
            console.error("❌ Database error:", keyError);
            throw new Error("Failed to get API key");
          }

          if (!keyIndex) {
            console.error("❌ All keys exhausted");
            return jsonResponse({ 
              error: "⏰ Kuota harian telah habis (100 diagram/hari). Silakan coba lagi besok." 
            }, 429);
          }

          const apiKey = GEMINI_KEYS[keyIndex - 1];
          if (!apiKey) {
            console.error(`❌ Key #${keyIndex} not configured`);
            await supabase.rpc('mark_key_exhausted', { key_idx: keyIndex });
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

          // Handle 429 rate limit
          if (response.status === 429) {
            console.log(`⚠️ Key #${keyIndex} hit rate limit`);
            await supabase.rpc('mark_key_exhausted', { key_idx: keyIndex });
            continue; // Try next key
          }

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API error (key #${keyIndex}):`, response.status, errorText);
            
            if (response.status === 503) {
              throw new Error("Gemini service temporarily unavailable");
            }
            throw new Error(`API error: ${response.status}`);
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
