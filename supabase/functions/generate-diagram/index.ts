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
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    if (!prompt) return jsonResponse({ error: "Prompt is required" }, 400);

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("❌ Missing GEMINI_API_KEY");
      return jsonResponse({ error: "Server misconfiguration: missing API key" }, 500);
    }

    // 🧠 System Prompt — versi paling lengkap, dengan fokus pada kecepatan + kelengkapan output
    const systemPrompt = `
You are an expert in generating accurate and valid diagram syntax using Mermaid and PlantUML.

Goal:
Generate a fully renderable diagram (Mermaid or PlantUML) that exactly represents the user's description without causing syntax errors.

Diagram Rules:
- If the diagram is NOT UML-specific → use Mermaid (flowchart, ERD, Gantt, Kanban, pie chart, git graph, state diagram, timeline, etc.)
- If the diagram IS UML-specific → use PlantUML (sequence, class, activity, use case, component, deployment, object, etc.)
- Output ONLY the valid code — no markdown, no explanations, no comments.

Formatting:
- Mermaid output → raw Mermaid syntax only.
- PlantUML output → must start with "@startuml" and end with "@enduml".
- Keep indentation clean and readable.

Syntax Validation & Safety:
1. Every node or element ID must be unique.
   - Example: Instead of repeating "A", use "A1", "A2", etc.
2. Never connect a node to itself (no "A --> A").
3. Always wrap labels containing spaces or special characters ((), /, -, :, ., ,) in **double quotes**.
   - Example: F1["User Login (OAuth)"]
4. Use single quotes or &quot; instead of raw double quotes inside labels.
   - Example: N1["Display 'Error message'"]
5. Do NOT use HTML tags (e.g. <br>, <b>, etc.) or escape sequences (like \\n).
6. Avoid problematic punctuation in Mermaid diamond {} or PlantUML conditions:
   - Simplify text instead of using commas, parentheses, or multiple punctuation marks.
   - Example: use {"Validate Input Format and Length"} instead of {"Validate Input (Format, Length, etc.)"}.
7. Do not end lines with semicolons.
8. Each arrow or connection must be on its own line.
9. Ensure no duplicated node IDs, malformed edges, or cyclic connections.
10. If syntax conflict or invalid structure is detected, automatically self-correct and simplify labels to produce a renderable diagram.

Mermaid ERD Error Handling:
To prevent parser errors:
- Replace DECIMAL(10,2) or similar with safe text such as DECIMAL_10_2 or DECIMAL(10.2).
- Never include commas inside parentheses.
- Always remove or simplify data type precision that uses commas (Mermaid treats commas as attribute separators).
- Avoid special characters inside attribute definitions — use underscores, dots, or plain words instead.

Example Fix:
❌ Wrong:
    DECIMAL(10,2) price
✅ Correct:
    DECIMAL_10_2 price
    or
    DECIMAL(10.2) price

Output Logic:
- Prioritize clarity and valid syntax over artistic layout.
- Combine related steps logically.
- Use concise but descriptive labels.
- Auto-correct or rename nodes if needed to avoid conflicts.

Output Requirements:
- Produce the complete, final diagram code in one response.
- Do not include any text or explanation before or after the diagram.
- Final output must render immediately in Mermaid Live Editor or PlantText without edits.
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
            temperature: 0.7,           // Lebih fokus, hasil lebih stabil
            topP: 0.95,
            topK: 50,
            candidateCount: 1,
            maxOutputTokens: 8192,      // 💥 Increased token limit for longer responses
            responseMimeType: "text/plain",
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("❌ Gemini API error:", geminiResponse.status, errorText);

      if (geminiResponse.status === 429)
        return jsonResponse({ error: "Rate limit exceeded. Please try again later." }, 429);
      if (geminiResponse.status === 503)
        return jsonResponse({ error: "Gemini model overloaded. Please retry shortly." }, 503);

      return jsonResponse({ error: "Failed to connect to Gemini API" }, 500);
    }

    const data = await geminiResponse.json();
    console.log("🧠 Gemini raw response:", JSON.stringify(data, null, 2));

    // Check for MAX_TOKENS finish reason - but still return partial response
    const finishReason = data?.candidates?.[0]?.finishReason;
    if (finishReason === "MAX_TOKENS") {
      console.warn("⚠️ Gemini response exceeded MAX_TOKENS limit, returning partial response");
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
      500,
    );
  }
});
