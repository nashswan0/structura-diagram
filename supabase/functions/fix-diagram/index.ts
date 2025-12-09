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

    // ✅ Ambil API key dari environment (Supabase Edge Secret)
    const GLM_API_KEY = Deno.env.get("GLM_API_KEY");
    if (!GLM_API_KEY) {
      console.error("❌ Missing GLM_API_KEY");
      return jsonResponse(
        { error: "Server misconfiguration: missing GLM API key" },
        500
      );
    }

    const systemPrompt = `You are a diagram syntax expert. Fix the broken diagram code based on the error.

CRITICAL RULES:
- Output ONLY the corrected diagram code
- NO explanations, NO reasoning, NO markdown
- Start directly with @startuml (PlantUML) or diagram type (Mermaid)
- Be concise and direct`;

    const userPrompt = `Error: ${error}

Code:
${code}

Fix the error and return ONLY the corrected code.`;

    // ✅ Fungsi untuk request ke GLM API (optimized for speed)
    async function requestGLM(userPrompt: string) {
      const response = await fetch(
        "https://api.z.ai/api/paas/v4/chat/completions",  // ⚡ FIXED: Use Z.AI endpoint
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GLM_API_KEY}`,
            "Content-Type": "application/json",
            "Accept-Language": "en-US,en"
          },
          body: JSON.stringify({
            model: "glm-4.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.3,      // ⚡ Low for fast, focused fixes
            top_p: 0.7,            // ⚡ Reduced for speed
            max_tokens: 4096,      // ⚡ Reduced for faster response
            stream: false
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("❌ GLM API error:", response.status, text);

        if (response.status === 429) {
          return jsonResponse({ 
            error: "Terlalu banyak permintaan. Silakan tunggu beberapa saat dan coba lagi." 
          }, 429);
        }

        if (response.status === 401) {
          return jsonResponse({ 
            error: "Konfigurasi API key tidak valid. Silakan hubungi administrator." 
          }, 401);
        }

        if (response.status === 503) {
          return jsonResponse({ 
            error: "Layanan GLM sedang sibuk. Silakan coba lagi dalam beberapa saat." 
          }, 503);
        }

        return jsonResponse({
          error: `Gagal memperbaiki diagram (Error ${response.status})`
        }, response.status);
      }

      return await response.json();
    }

    // ✅ Kirim permintaan utama
    const data = await requestGLM(userPrompt);

    // ✅ Ekstrak teks dari hasil GLM
    const text = data?.choices?.[0]?.message?.content?.trim() ?? null;

    if (!text) {
      console.error(
        "⚠️ Invalid API response structure:",
        JSON.stringify(data, null, 2)
      );
      return jsonResponse(
        { error: "AI did not return a valid diagram fix. Please try again." },
        500
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
      500
    );
  }
});
