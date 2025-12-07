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

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    if (!prompt) return jsonResponse({ error: "Prompt is required" }, 400);

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("❌ Missing GEMINI_API_KEY");
      return jsonResponse(
        { error: "Server misconfiguration: missing API key" },
        500
      );
    }

    // 🧠 System Prompt — versi paling lengkap, dengan fokus pada kecepatan + kelengkapan output
    const systemPrompt = `
You are a diagram generation expert proficient in both Mermaid and PlantUML syntax.
Your mission is to generate a fully valid, complete, and immediately renderable diagram that precisely represents the user's description.

🧩 Diagram Rules:
- If NOT UML-specific → use Mermaid syntax (flowchart, ERD, Gantt, Kanban, pie chart, git graph, state diagram, timeline, etc.)
- If UML-specific → use PlantUML syntax (sequence, class, activity, use case, component, deployment, object, etc.)
- Output ONLY the valid code (no markdown, no explanations, no comments).
- Make sure to create the diagram based on the user's prompt language. If it's english, create diagram using english. If it's bahasa indonesia, create diagram using bahasa indonesia.

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

      if (geminiResponse.status === 429)
        return jsonResponse(
          { error: "Rate limit exceeded. Please try again later." },
          429
        );
      if (geminiResponse.status === 503)
        return jsonResponse(
          { error: "Gemini model overloaded. Please retry shortly." },
          503
        );

      return jsonResponse({ error: "Failed to connect to Gemini API" }, 500);
    }

    const data = await geminiResponse.json();
    console.log("🧠 Gemini raw response:", JSON.stringify(data, null, 2));

    // Check for MAX_TOKENS finish reason - but still return partial response
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
      // Fallback: return a basic diagram based on the user prompt
      const fallbackDiagram = `graph TD
    A["User Request"] --> B["Processing"]
    B --> C["Result"]
    
    %% Generated from: ${prompt}`;
      return jsonResponse({ diagram: fallbackDiagram });
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
