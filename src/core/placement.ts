import { Rect } from "./types";

export async function findPlacementRect(targetWidth = 500, targetHeight = 350): Promise<{ rect: Rect; warning?: string }> {
  return PowerPoint.run(async (context) => {
    const slide = context.presentation.getSelectedSlides().getItemAt(0);
    const shapes = slide.shapes;
    shapes.load("items/left,items/top,items/width,items/height");
    context.presentation.load("slideWidth,slideHeight");
    await context.sync();

    const sw = context.presentation.slideWidth;
    const sh = context.presentation.slideHeight;
    const positions: Rect[] = [
      { x: sw - targetWidth - 20, y: 20, width: targetWidth, height: targetHeight },
      { x: 20, y: 20, width: targetWidth, height: targetHeight },
      { x: sw - targetWidth - 20, y: sh - targetHeight - 20, width: targetWidth, height: targetHeight },
      { x: 20, y: sh - targetHeight - 20, width: targetWidth, height: targetHeight },
      { x: (sw - targetWidth) / 2, y: (sh - targetHeight) / 2, width: targetWidth, height: targetHeight }
    ];

    const overlap = (a: Rect, b: Rect) => !(a.x + a.width < b.x || b.x + b.width < a.x || a.y + a.height < b.y || b.y + b.height < a.y);
    const existing = shapes.items.map((s) => ({ x: s.left, y: s.top, width: s.width, height: s.height }));
    for (const p of positions) {
      if (!existing.some((e) => overlap(p, e))) return { rect: p };
    }
    return { rect: positions[4], warning: "No empty area found. Placed at center." };
  });
}
