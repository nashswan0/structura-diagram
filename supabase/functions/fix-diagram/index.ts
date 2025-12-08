import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ✅ Helper untuk membuat JSON response yang seragam
function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { code, error } = await req.json();

    if (!code || !error) {
      return jsonResponse(
        { error: "Both 'code' and 'error' fields are required." },
        400,
      );
    }

    // ✅ Ambil API key dari environment (Supabase Edge Secret)
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("❌ Missing GEMINI_API_KEY");
      return jsonResponse(
        { error: "Server misconfiguration: missing Gemini API key" },
        500,
      );
    }

    const systemPrompt = `
You are a world-class expert in diagram syntax (Mermaid and PlantUML).
Your goal is to FIX and IMPROVE broken diagram code based on the provided error message.
Return the complete and valid diagram syntax code that renders without errors.

Rules:
- Detect the diagram type from the code (Mermaid or PlantUML) and fix accordingly.
- Output ONLY valid diagram syntax (no markdown, no explanations, no comments).
- Be fast and concise but ensure all relationships and structures are complete.
- Always include nodes and connections if missing.
- For Mermaid: Use proper syntax like graph TD, flowchart LR, sequenceDiagram, etc.
- For PlantUML: Use proper @startuml/@enduml tags and syntax.
- Fix common errors:
  * Invalid node IDs (use alphanumeric, no special chars except underscore/hyphen)
  * Missing quotes for labels with spaces or special characters
  * Incorrect arrow syntax (use --> or --- for Mermaid)
  * Malformed connections or cyclic dependencies
  * Invalid shape syntax (use correct brackets: [], (), {}, etc.)
  * Missing semicolons or line breaks between statements
- Validate the output is 100% renderable before returning.
`;

    const userPrompt = `
🔴 ERROR DETECTED:
${error}

📋 CURRENT DIAGRAM CODE:
${code}

🎯 TASK:
1. Analyze the error message carefully
2. Identify the exact line/syntax causing the error
3. Fix the error while preserving the diagram's intent and structure
4. Ensure all nodes, connections, and labels are valid
5. Return ONLY the corrected diagram code (no explanations)

IMPORTANT: The output must be immediately renderable without any modifications.
`;

    // ✅ Fungsi untuk request ke Gemini API (fast optimized)
    async function requestGemini(userPrompt: string) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              temperature: 0.3,        // Lebih rendah = fokus dan cepat
              topP: 0.8,               // Membatasi variasi untuk kecepatan
              topK: 40,                // Sampling terbatas agar efisien
              maxOutputTokens: 3000,   // Masih cukup besar untuk output panjang
              candidateCount: 1,       // Satu hasil saja = lebih cepat
            },
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("❌ Gemini API error:", response.status, text);

        // Parse error details if available
        let errorMessage = "Gagal memperbaiki diagram";
        try {
          const errorData = JSON.parse(text);
          const apiError = errorData?.error?.message || "";
          
          if (response.status === 429) {
            // Check if it's a quota issue
            if (apiError.includes("quota") || apiError.includes("RESOURCE_EXHAUSTED")) {
              errorMessage = "Kuota API Gemini telah habis. Silakan coba lagi nanti atau upgrade ke paket berbayar.";
            } else {
              errorMessage = "Terlalu banyak permintaan. Silakan tunggu beberapa saat dan coba lagi.";
            }
            return jsonResponse({ error: errorMessage }, 429);
          }
          
          if (response.status === 401) {
            errorMessage = "Konfigurasi API key tidak valid. Silakan hubungi administrator.";
            return jsonResponse({ error: errorMessage }, 401);
          }
          
          if (response.status === 503) {
            errorMessage = "Layanan Gemini sedang sibuk. Silakan coba lagi dalam beberapa saat.";
            return jsonResponse({ error: errorMessage }, 503);
          }
          
          if (response.status === 400) {
            errorMessage = "Permintaan tidak valid. Silakan coba lagi dengan diagram yang berbeda.";
            return jsonResponse({ error: errorMessage }, 400);
          }
        } catch (parseError) {
          // If JSON parsing fails, use generic message
          console.error("Failed to parse error response:", parseError);
        }

        return jsonResponse({ 
          error: `${errorMessage} (Error ${response.status})` 
        }, response.status);
      }

      return await response.json();
    }

    // ✅ Kirim permintaan utama
    const data = await requestGemini(userPrompt);

    // ✅ Ekstrak teks dari hasil Gemini (robust parsing)
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      data?.candidates?.[0]?.output?.trim() ??
      null;

    if (!text) {
      console.error("⚠️ Invalid Gemini response structure:", data);
      return jsonResponse(
        { error: "Gemini did not return a valid diagram fix." },
        500,
      );
    }

    // ✅ Bersihkan markdown jika ada
    let cleaned = text;
    if (cleaned.startsWith("```")) {
      cleaned = cleaned
        .replace(/```mermaid\s*/gi, "")
        .replace(/```plantuml\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
    }

    return jsonResponse({ diagram: cleaned });
  } catch (err) {
    console.error("🔥 Error in fix-diagram function:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Unknown internal error" },
      500,
    );
  }
});
