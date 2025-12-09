import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Helper function to sleep/delay
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry function with exponential backoff for concurrency errors
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 API call attempt ${attempt + 1}/${maxRetries + 1}`);
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Check if it's a concurrency error (GLM specific)
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isConcurrencyError = errorMessage.includes('1302') || 
                                 errorMessage.includes('GLM_CONCURRENCY_ERROR') ||
                                 errorMessage.includes('High concurrency') ||
                                 errorMessage.includes('concurrent connection') ||
                                 errorMessage.includes('concurrency usage');
      
      console.log(`❌ Error on attempt ${attempt + 1}: ${errorMessage.substring(0, 100)}`);
      console.log(`🔍 Is concurrency error: ${isConcurrencyError}`);
      
      // If it's the last attempt or not a concurrency error, throw immediately
      if (attempt === maxRetries) {
        console.log(`⛔ Max retries (${maxRetries}) reached, giving up`);
        throw error;
      }
      
      if (!isConcurrencyError) {
        console.log(`⛔ Not a concurrency error, throwing immediately`);
        throw error;
      }
      
      // Calculate delay with exponential backoff + jitter
      const delay = initialDelay * Math.pow(2, attempt) + Math.random() * 500;
      console.log(`⏳ Concurrency limit hit, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})...`);
      
      await sleep(delay);
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    if (!prompt) return jsonResponse({ error: "Prompt is required" }, 400);

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const GLM_API_KEY = Deno.env.get("GLM_API_KEY");
    
    // Prioritize GLM if available, fallback to Gemini
    const useGLM = !!GLM_API_KEY;
    
    if (!GEMINI_API_KEY && !GLM_API_KEY) {
      console.error("❌ Missing API keys");
      return jsonResponse(
        { error: "Server misconfiguration: missing API key" },
        500
      );
    }

    // 🧠 System Prompt — versi paling lengkap, dengan fokus pada kecepatan + kelengkapan output
    const systemPrompt = `
You are a diagram generation expert proficient in both Mermaid and PlantUML syntax.
Your mission is to generate a fully valid, complete, and immediately renderable diagram that precisely represents the user's description.

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
- Use concise variable names when possible.
- Keep the diagram well-structured but avoid redundant nodes.
- Aim for full code output, even if it consumes many tokens.
- The output should be complete within one response.

Now generate the most accurate diagram possible for the user's request.
`.trim();

    const userPrompt = `User request:\n${prompt}`;

    // Function to call API with retry logic
    const callAIAPI = async () => {
      if (useGLM) {
        // GLM API call
        const glmResponse = await fetch(
          "https://open.bigmodel.cn/api/paas/v4/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${GLM_API_KEY}`,
            },
            body: JSON.stringify({
              model: "glm-4.5-flash",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ],
              temperature: 0.7,
              top_p: 0.95,
              max_tokens: 8192,
            }),
          }
        );

        if (!glmResponse.ok) {
          const errorText = await glmResponse.text();
          console.error("❌ GLM API error:", glmResponse.status, errorText);

          let errorMessage = "Gagal membuat diagram";
          try {
            const errorData = JSON.parse(errorText);
            const apiError = errorData?.error?.message || "";
            const errorCode = errorData?.error?.code || "";

            // Handle GLM-specific concurrency error
            if (errorCode === "1302" || apiError.includes("High concurrency")) {
              throw new Error("GLM_CONCURRENCY_ERROR: " + apiError);
            }

            if (glmResponse.status === 429) {
              errorMessage = "Terlalu banyak permintaan. Silakan tunggu beberapa saat dan coba lagi.";
              throw new Error(errorMessage);
            }

            if (glmResponse.status === 503) {
              errorMessage = "Layanan GLM sedang sibuk. Silakan coba lagi dalam beberapa saat.";
              throw new Error(errorMessage);
            }

            if (glmResponse.status === 401) {
              errorMessage = "Konfigurasi API key tidak valid. Silakan hubungi administrator.";
              throw new Error(errorMessage);
            }

            if (glmResponse.status === 400) {
              errorMessage = "Permintaan tidak valid. Silakan coba lagi dengan prompt yang berbeda.";
              throw new Error(errorMessage);
            }
          } catch (parseError) {
            if (parseError instanceof Error && parseError.message.includes("GLM_CONCURRENCY_ERROR")) {
              throw parseError;
            }
            console.error("Failed to parse error response:", parseError);
          }

          throw new Error(`${errorMessage} (Error ${glmResponse.status})`);
        }

        const data = await glmResponse.json();
        console.log("🧠 GLM raw response:", JSON.stringify(data, null, 2));

        const generatedText = data?.choices?.[0]?.message?.content ?? null;

        if (!generatedText) {
          console.error("⚠️ Invalid GLM response structure:", data);
          throw new Error("No diagram returned from GLM API");
        }

        return generatedText;
      } else {
        // Gemini API call (fallback)
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
              generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 50,
                candidateCount: 1,
                maxOutputTokens: 8192,
                responseMimeType: "text/plain",
              },
            }),
          }
        );

        if (!geminiResponse.ok) {
          const errorText = await geminiResponse.text();
          console.error("❌ Gemini API error:", geminiResponse.status, errorText);

          let errorMessage = "Gagal membuat diagram";
          try {
            const errorData = JSON.parse(errorText);
            const apiError = errorData?.error?.message || "";

            if (geminiResponse.status === 429) {
              if (apiError.includes("quota") || apiError.includes("RESOURCE_EXHAUSTED")) {
                errorMessage = "Kuota API Gemini telah habis. Silakan coba lagi nanti atau upgrade ke paket berbayar.";
              } else {
                errorMessage = "Terlalu banyak permintaan. Silakan tunggu beberapa saat dan coba lagi.";
              }
              throw new Error(errorMessage);
            }

            if (geminiResponse.status === 503) {
              errorMessage = "Layanan Gemini sedang sibuk. Silakan coba lagi dalam beberapa saat.";
              throw new Error(errorMessage);
            }

            if (geminiResponse.status === 401) {
              errorMessage = "Konfigurasi API key tidak valid. Silakan hubungi administrator.";
              throw new Error(errorMessage);
            }

            if (geminiResponse.status === 400) {
              errorMessage = "Permintaan tidak valid. Silakan coba lagi dengan prompt yang berbeda.";
              throw new Error(errorMessage);
            }
          } catch (parseError) {
            console.error("Failed to parse error response:", parseError);
          }

          throw new Error(`${errorMessage} (Error ${geminiResponse.status})`);
        }

        const data = await geminiResponse.json();
        console.log("🧠 Gemini raw response:", JSON.stringify(data, null, 2));

        const finishReason = data?.candidates?.[0]?.finishReason;
        if (finishReason === "MAX_TOKENS") {
          console.warn(
            "⚠️ Gemini response exceeded MAX_TOKENS limit, returning partial response"
          );
        }

        const generatedText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ??
          data?.candidates?.[0]?.output ??
          null;

        if (!generatedText) {
          console.error("⚠️ Invalid Gemini response structure:", data);
          throw new Error("No diagram returned from Gemini API");
        }

        return generatedText;
      }
    };

    // Call API with retry logic for concurrency errors
    // Increased retries: 5 attempts with 2s initial delay for better success rate
    let generatedText: string;
    try {
      generatedText = await retryWithBackoff(callAIAPI, 5, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check if it's a concurrency error after all retries
      const isConcurrencyError = errorMessage.includes('1302') || 
                                 errorMessage.includes('High concurrency') ||
                                 errorMessage.includes('concurrent connection');
      
      // If GLM failed due to concurrency AND we have Gemini as fallback, try Gemini
      if (isConcurrencyError && useGLM && GEMINI_API_KEY) {
        console.log('🔄 GLM concurrency limit reached after all retries, falling back to Gemini API...');
        
        try {
          // Try Gemini as fallback
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
                generationConfig: {
                  temperature: 0.7,
                  topP: 0.95,
                  topK: 50,
                  candidateCount: 1,
                  maxOutputTokens: 8192,
                  responseMimeType: "text/plain",
                },
              }),
            }
          );

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            const geminiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
            
            if (geminiText) {
              console.log('✅ Successfully generated diagram using Gemini fallback');
              generatedText = geminiText;
            } else {
              throw new Error('Gemini fallback: no text returned');
            }
          } else {
            const geminiError = await geminiResponse.text();
            console.error('❌ Gemini fallback failed:', geminiResponse.status, geminiError);
            throw new Error('Gemini fallback failed');
          }
        } catch (geminiError) {
          console.error('❌ Gemini fallback also failed:', geminiError);
          // If Gemini also fails, return the original concurrency error
          return jsonResponse({
            error: "Layanan sedang sibuk karena banyak pengguna. Silakan tunggu 10-30 detik dan coba lagi."
          }, 429);
        }
      } else if (isConcurrencyError) {
        // GLM concurrency error but no Gemini fallback available
        return jsonResponse({
          error: "Layanan sedang sibuk karena banyak pengguna. Silakan tunggu 10-30 detik dan coba lagi."
        }, 429);
      } else {
        // Other errors
        return jsonResponse({
          error: errorMessage
        }, 500);
      }
    }

    // 🧹 Bersihkan hasil
    let cleanedDiagram = generatedText.trim();
    if (cleanedDiagram.startsWith("```")) {
      cleanedDiagram = cleanedDiagram
        .replace(/```(mermaid|plantuml)?\n?/gi, "")
        .replace(/```/g, "")
        .trim();
    }

    // Ensure we always return a valid diagram
    if (!cleanedDiagram || cleanedDiagram.length === 0) {
      console.warn("⚠️ Empty diagram after cleaning, using fallback");
      cleanedDiagram = `graph TD
    A["User Request"] --> B["Processing"]
    B --> C["Result"]
    
    %% Generated from: ${prompt}`;
    }

    return jsonResponse({ diagram: cleanedDiagram });
  } catch (err) {
    console.error("🔥 Error in generate-diagram function:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Unknown internal error" },
      500
    );
  }
});
