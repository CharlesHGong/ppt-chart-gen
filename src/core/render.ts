import { DiagramSpec, Rect } from "./types";
import { layoutDiagram } from "./layout";

export async function renderDiagram(spec: DiagramSpec, rect: Rect): Promise<void> {
  const layout = layoutDiagram(spec, rect);
  await PowerPoint.run(async (context) => {
    const slide = context.presentation.getSelectedSlides().getItemAt(0);
    const shapeNames: string[] = [];
    const byId = new Map(layout.nodes.map((n) => [n.id, n]));
    const prefix = `DIAGRAM::${spec.id}::`;

    for (const n of layout.nodes) {
      const shape = slide.shapes.addGeometricShape(PowerPoint.GeometricShapeType.rectangle);
      shape.name = `${prefix}NODE::${n.id}`;
      shape.left = n.x;
      shape.top = n.y;
      shape.width = n.width;
      shape.height = n.height;
      shape.textFrame.textRange.text = n.text;
      shape.fill.setSolidColor(spec.style.nodeFill);
      shape.lineFormat.color = spec.style.nodeLine;
      shape.textFrame.textRange.font.color = spec.style.textColor;
      shape.textFrame.textRange.font.size = spec.style.fontSize;
      shapeNames.push(shape.name);
    }

    layout.edges.forEach((e, idx) => {
      const from = byId.get(e.from);
      const to = byId.get(e.to);
      if (!from || !to) return;
      const startX = from.x + from.width / 2;
      const startY = from.y + from.height;
      const endX = to.x + to.width / 2;
      const endY = to.y;
      const junctionY = startY + (endY - startY) / 2;
      const segments = [
        { x1: startX, y1: startY, x2: startX, y2: junctionY },
        { x1: startX, y1: junctionY, x2: endX, y2: junctionY },
        { x1: endX, y1: junctionY, x2: endX, y2: endY }
      ];
      segments.forEach((segment, j) => {
        const line = slide.shapes.addLine(segment.x1, segment.y1, segment.x2, segment.y2);
        line.name = `${prefix}EDGE::${idx}::${j}`;
        line.lineFormat.color = spec.style.connectorColor;
        shapeNames.push(line.name);
      });
      if (e.label) {
        const label = slide.shapes.addTextBox(e.label);
        label.name = `${prefix}LABEL::${idx}`;
        label.left = (startX + endX) / 2 - 20;
        label.top = junctionY - 10;
        label.width = 45;
        label.height = 18;
        label.fill.transparency = 1;
        label.lineFormat.color = "#FFFFFF";
        label.textFrame.textRange.font.size = Math.max(spec.style.fontSize - 1, 8);
        label.textFrame.textRange.font.color = spec.style.textColor;
        shapeNames.push(label.name);
      }
    });

    const meta = slide.shapes.addTextBox(JSON.stringify(spec));
    meta.name = `${prefix}META`;
    meta.left = -5000;
    meta.top = -5000;
    meta.width = 10;
    meta.height = 10;
    shapeNames.push(meta.name);

    slide.setSelectedShapes(shapeNames);
    const selected = context.presentation.getSelectedShapes();
    selected.group();
    selected.load("items/name");
    await context.sync();
    if (selected.items[0]) {
      selected.items[0].name = `${prefix}GROUP`;
    }
    await context.sync();
  });
}

export async function deleteDiagram(diagramId: string): Promise<void> {
  await PowerPoint.run(async (context) => {
    const slide = context.presentation.getSelectedSlides().getItemAt(0);
    const shapes = slide.shapes;
    shapes.load("items/name");
    await context.sync();
    shapes.items
      .filter((s) => s.name.startsWith(`DIAGRAM::${diagramId}::`))
      .forEach((s) => s.delete());
    await context.sync();
  });
}
