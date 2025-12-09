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
    const GLM_API_KEY = Deno.env.get("GLM_API_KEY");
    if (!GLM_API_KEY) {
      console.error("❌ Missing GLM_API_KEY");
      return jsonResponse(
        { error: "Server misconfiguration: missing GLM API key" },
        500,
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

Fix it now (output only the corrected code):`;

    // ✅ Fungsi untuk request ke GLM API (optimized for direct output)
    async function requestGLM(userPrompt: string) {
      const response = await fetch(
        "https://open.bigmodel.cn/api/paas/v4/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GLM_API_KEY}`,
          },
          body: JSON.stringify({
            model: "glm-4-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.1,  // Very low = more focused, less reasoning
            top_p: 0.7,        // Limit diversity
            max_tokens: 2000,  // Enough for diagram, not too much for reasoning
            // Note: GLM doesn't support response_format like OpenAI
            // But low temperature + directive prompt should minimize reasoning
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("❌ GLM API error:", response.status, text);

        // Parse error details if available
        let errorMessage = "Gagal memperbaiki diagram";
        try {
          const errorData = JSON.parse(text);
          const apiError = errorData?.error?.message || "";
          const errorCode = errorData?.error?.code || "";
          
          if (errorCode === "1302" || apiError.includes("High concurrency")) {
            errorMessage = "Terlalu banyak permintaan. Silakan tunggu beberapa saat dan coba lagi.";
            return jsonResponse({ error: errorMessage }, 429);
          }
          
          if (response.status === 429) {
            errorMessage = "Terlalu banyak permintaan. Silakan tunggu beberapa saat dan coba lagi.";
            return jsonResponse({ error: errorMessage }, 429);
          }
          
          if (response.status === 401) {
            errorMessage = "Konfigurasi API key tidak valid. Silakan hubungi administrator.";
            return jsonResponse({ error: errorMessage }, 401);
          }
          
          if (response.status === 503) {
            errorMessage = "Layanan GLM sedang sibuk. Silakan coba lagi dalam beberapa saat.";
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
    const data = await requestGLM(userPrompt);

    // ✅ Ekstrak teks dari hasil (support both Gemini and GLM formats)
    let text: string | null = null;
    
    // Try Gemini format first
    text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
           data?.candidates?.[0]?.output?.trim() ??
           null;
    
    // If Gemini format failed, try GLM format
    if (!text) {
      // GLM API format: choices[0].message.content
      text = data?.choices?.[0]?.message?.content?.trim() ?? null;
    }
    
    // Check finish_reason for both APIs
    const finishReason = data?.candidates?.[0]?.finishReason || 
                        data?.choices?.[0]?.finish_reason;
    
    // Handle case where response was truncated due to length
    if (finishReason === 'length' || finishReason === 'MAX_TOKENS') {
      console.warn('⚠️ Response truncated due to length limit');
      
      // For GLM: try to extract from reasoning_content if content is empty
      if (!text || text.length === 0) {
        const reasoningContent = data?.choices?.[0]?.message?.reasoning_content;
        if (reasoningContent) {
          console.log('Attempting to extract diagram from reasoning_content...');
          
          // Try to find PlantUML or Mermaid code blocks in reasoning
          const plantumlMatch = reasoningContent.match(/@startuml[\s\S]*?@enduml/);
          const mermaidMatch = reasoningContent.match(/```(?:mermaid)?\n([\s\S]*?)```/);
          
          if (plantumlMatch) {
            text = plantumlMatch[0];
            console.log('✅ Extracted PlantUML from reasoning_content');
          } else if (mermaidMatch) {
            text = mermaidMatch[1];
            console.log('✅ Extracted Mermaid from reasoning_content');
          }
        }
      }
      
      // If still no text, return helpful error
      if (!text || text.length === 0) {
        console.error('⚠️ Response truncated and no diagram code found');
        return jsonResponse({
          error: 'AI response was too long and got truncated. Please try with a simpler diagram or break it into smaller parts.'
        }, 500);
      }
    }

    if (!text) {
      console.error("⚠️ Invalid API response structure:", JSON.stringify(data, null, 2));
      return jsonResponse(
        { error: "AI did not return a valid diagram fix. Please try again." },
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
