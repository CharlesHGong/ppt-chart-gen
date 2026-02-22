import { DiagramSpec, Rect } from "./types";

export async function getSelectedDiagram(): Promise<{ diagramId: string; spec: DiagramSpec; rect: Rect } | null> {
  return PowerPoint.run(async (context) => {
    const selected = context.presentation.getSelectedShapes();
    selected.load("items/name,items/left,items/top,items/width,items/height");
    await context.sync();
    const group = selected.items.find((s) => s.name.startsWith("DIAGRAM::") && s.name.endsWith("::GROUP"));
    if (!group) return null;
    const parts = group.name.split("::");
    const diagramId = parts[1];
    const slide = context.presentation.getSelectedSlides().getItemAt(0);
    const meta = slide.shapes.getItemOrNullObject(`DIAGRAM::${diagramId}::META`);
    meta.load("textFrame/textRange/text");
    await context.sync();
    if (meta.isNullObject) return null;
    return {
      diagramId,
      spec: JSON.parse(meta.textFrame.textRange.text) as DiagramSpec,
      rect: { x: group.left, y: group.top, width: group.width, height: group.height }
    };
  });
}
