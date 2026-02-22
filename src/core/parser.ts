import { DiagramSpec, UserSettings } from "./types";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function parseLocal(input: string, settings: UserSettings): DiagramSpec | null {
  const ownsMatch = input.match(/(\w+)\s+owns\s+(.+)/i);
  if (ownsMatch) {
    const owner = ownsMatch[1];
    const rest = ownsMatch[2];
    const pct = rest.match(/(\d+)%/);
    const children = rest.replace(/for\s+\d+%\.?/i, "").split(/,|and/).map((s) => s.replace(/[^\w]/g, "").trim()).filter(Boolean);
    const nodes = [owner, ...children].map((label) => ({ id: slug(label), label }));
    return {
      id: slug(owner),
      type: "ownership",
      nodes,
      edges: children.map((c) => ({ from: slug(owner), to: slug(c), label: pct ? `${pct[1]}%` : undefined })),
      layout: { direction: "TB", spacingX: settings.style.spacingX, spacingY: settings.style.spacingY, padding: settings.style.padding, nodeWidth: settings.style.nodeWidth, nodeHeight: settings.style.nodeHeight },
      style: { theme: "bw", fontSize: settings.style.fontSize, nodeFill: "#FFFFFF", nodeLine: "#000000", textColor: "#000000", connectorColor: "#000000" }
    };
  }

  const arrowMatch = input.match(/(\w+)\s*->\s*(.+)/i);
  if (arrowMatch) {
    const parent = arrowMatch[1];
    const children = arrowMatch[2].split(/,|and/).map((c) => c.trim()).filter(Boolean);
    const nodes = [parent, ...children].map((label) => ({ id: slug(label), label }));
    return {
      id: slug(parent),
      type: "tree",
      nodes,
      edges: children.map((c) => ({ from: slug(parent), to: slug(c) })),
      layout: { direction: "TB", spacingX: settings.style.spacingX, spacingY: settings.style.spacingY, padding: settings.style.padding, nodeWidth: settings.style.nodeWidth, nodeHeight: settings.style.nodeHeight },
      style: { theme: "bw", fontSize: settings.style.fontSize, nodeFill: "#FFFFFF", nodeLine: "#000000", textColor: "#000000", connectorColor: "#000000" }
    };
  }

  return null;
}
