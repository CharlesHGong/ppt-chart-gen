import { DiagramSpec, Rect } from "./types";

export interface PositionedNode { id: string; x: number; y: number; width: number; height: number; text: string; }
export interface PositionedEdge { from: string; to: string; label?: string; }

interface TreeNode { id: string; children: TreeNode[]; }

function buildForest(spec: DiagramSpec): TreeNode[] {
  const map = new Map<string, TreeNode>();
  spec.nodes.forEach((n) => map.set(n.id, { id: n.id, children: [] }));
  const hasParent = new Set<string>();
  spec.edges.forEach((e) => {
    const p = map.get(e.from); const c = map.get(e.to);
    if (p && c) { p.children.push(c); hasParent.add(c.id); }
  });
  const roots = [...map.values()].filter((n) => !hasParent.has(n.id));
  return roots.length ? roots : [...map.values()].slice(0, 1);
}

export function layoutDiagram(spec: DiagramSpec, rect: Rect): { nodes: PositionedNode[]; edges: PositionedEdge[] } {
  const roots = buildForest(spec);
  const layout = spec.layout;
  const nodeById = new Map(spec.nodes.map((n) => [n.id, n]));
  const positions = new Map<string, { x: number; y: number }>();

  let cursor = 0;
  const depthMap = new Map<string, number>();
  function walk(node: TreeNode, depth: number): number {
    if (depth > 100) throw new Error("Layout depth limit exceeded");
    depthMap.set(node.id, depth);
    if (!node.children.length) {
      const leafX = cursor++;
      positions.set(node.id, { x: leafX, y: depth });
      return leafX;
    }
    const childXs = node.children.map((c) => walk(c, depth + 1));
    const mean = (Math.min(...childXs) + Math.max(...childXs)) / 2;
    positions.set(node.id, { x: mean, y: depth });
    return mean;
  }
  roots.forEach((r) => walk(r, 0));

  const xs = [...positions.values()].map((p) => p.x);
  const ys = [...positions.values()].map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), maxY = Math.max(...ys);
  const graphW = (maxX - minX + 1) * layout.nodeWidth + (maxX - minX) * layout.spacingX + 2 * layout.padding;
  const graphH = (maxY + 1) * layout.nodeHeight + maxY * layout.spacingY + 2 * layout.padding;
  const scale = Math.min(rect.width / graphW, rect.height / graphH, 1);

  const outNodes: PositionedNode[] = [];
  positions.forEach((p, id) => {
    const n = nodeById.get(id);
    if (!n) return;
    const x = rect.x + (p.x - minX) * (layout.nodeWidth + layout.spacingX) * scale + layout.padding * scale;
    const y = rect.y + p.y * (layout.nodeHeight + layout.spacingY) * scale + layout.padding * scale;
    outNodes.push({ id, x, y, width: layout.nodeWidth * scale, height: layout.nodeHeight * scale, text: n.subtitle ? `${n.label}\n${n.subtitle}` : n.label });
  });

  return { nodes: outNodes, edges: spec.edges.map((e) => ({ ...e })) };
}
