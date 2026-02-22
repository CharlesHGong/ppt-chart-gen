import OpenAI from "openai";
import { diagramSpecSchema, clarificationSchema } from "./schema";
import { InterpretResult, UserSettings } from "./types";

const BASE_PROMPT = `You transform user requests into strict JSON for DiagramSpec.
Rules:
- Output JSON only. No markdown.
- DiagramSpec fields: id,type,title?,nodes,edges,layout,style.
- ids must be stable slugified labels.
- types: ownership/org/tree. layout defaults direction TB.
- ownership percentages go in edge.label like "100%".
- style must be black and white.
- If ambiguous, output {"need_clarification":true,"questions":[...],"best_guess_spec":<DiagramSpec or null>}.
`;

function parseJson(raw: string): InterpretResult {
  const parsed = JSON.parse(raw);
  const clar = clarificationSchema.safeParse(parsed);
  if (clar.success) return clar.data;
  return diagramSpecSchema.parse(parsed);
}

export async function interpretWithOpenAI(userMessage: string, userSystem: string, settings: UserSettings): Promise<InterpretResult> {
  const client = new OpenAI({ apiKey: settings.apiKey, baseURL: settings.baseUrl || undefined, dangerouslyAllowBrowser: true });
  const prompt = `${BASE_PROMPT}\nUser system instructions:\n${userSystem}`;

  const response = await client.chat.completions.create({
    model: settings.model,
    temperature: settings.temperature,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: userMessage }
    ]
  });

  const first = response.choices[0]?.message?.content ?? "{}";
  try {
    return parseJson(first);
  } catch {
    const repair = await client.chat.completions.create({
      model: settings.model,
      temperature: 0,
      messages: [
        { role: "system", content: "Repair invalid JSON to match schema. Output JSON only." },
        { role: "user", content: first }
      ]
    });
    return parseJson(repair.choices[0]?.message?.content ?? "{}");
  }
}
