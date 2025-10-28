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

    // 🧠 Prompt sistem yang dioptimalkan untuk kecepatan + kualitas
    const systemPrompt = `
You are a world-class expert in diagram syntax (Mermaid and PlantUML).
Your goal is to FIX and IMPROVE broken diagram code based on the provided error message.
Return the complete and valid diagram syntax code that renders without errors.

Rules:
- Detect the diagram type from the code (Mermaid or PlantUML) and fix accordingly.
- Output ONLY valid diagram syntax (no markdown, no explanations).
- Be fast and concise but ensure all relationships and structures are complete.
- Always include nodes and connections if missing.
- For Mermaid: Use proper syntax like graph TD, flowchart LR, etc.
- For PlantUML: Use proper @startuml/@enduml tags and syntax.
`;

    const userPrompt = `
Error message: ${error}

Here is the current diagram code:
${code}

Fix and return only the valid diagram code.
`;

    // ✅ Fungsi untuk request ke Gemini API (fast optimized)
    async function requestGemini(prompt: string) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${systemPrompt}\n\n${prompt}` }],
              },
            ],
            generationConfig: {
              temperature: 0.3,        // Lebih rendah = fokus dan cepat
              topP: 0.8,               // Membatasi variasi untuk kecepatan
              topK: 40,                // Sampling terbatas agar efisien
              maxOutputTokens: 1500,   // Masih cukup besar untuk output panjang
              candidateCount: 1,       // Satu hasil saja = lebih cepat
            },
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("❌ Gemini API error:", response.status, text);

        if (response.status === 401)
          return jsonResponse({ error: "Invalid Gemini API key" }, 401);
        if (response.status === 429)
          return jsonResponse({ error: "Rate limit exceeded" }, 429);

        throw new Error(`Gemini API request failed (${response.status})`);
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
