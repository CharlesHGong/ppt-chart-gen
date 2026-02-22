export function inferIntent(input: string): "update" | "create" | "question" {
  const v = input.toLowerCase();
  if (v.includes("update") || v.includes("change selected") || v.includes("modify")) return "update";
  if (v.endsWith("?") || v.startsWith("what") || v.startsWith("how")) return "question";
  return "create";
}

export function allowsBestGuess(input: string): boolean {
  const v = input.toLowerCase();
  return v.includes("best guess") || v.includes("just do it") || v.includes("proceed anyway");
}
