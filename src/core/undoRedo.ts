import { ActionRecord } from "./types";
import { deleteDiagram, renderDiagram } from "./render";

const MAX = 30;
const undoStack: ActionRecord[] = [];
const redoStack: ActionRecord[] = [];

export function pushAction(action: ActionRecord) {
  undoStack.push(action);
  if (undoStack.length > MAX) undoStack.shift();
  redoStack.length = 0;
}

export async function undo() {
  const action = undoStack.pop();
  if (!action) return;
  if (action.kind === "create") {
    await deleteDiagram(action.diagramId);
  } else if (action.kind === "update" && action.prevSpec && action.targetRect) {
    await deleteDiagram(action.diagramId);
    await renderDiagram(action.prevSpec, action.targetRect);
  }
  redoStack.push(action);
}

export async function redo() {
  const action = redoStack.pop();
  if (!action) return;
  if ((action.kind === "create" || action.kind === "update") && action.nextSpec && action.targetRect) {
    await deleteDiagram(action.diagramId);
    await renderDiagram(action.nextSpec, action.targetRect);
  }
  undoStack.push(action);
}
