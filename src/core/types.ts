export type DiagramType = "ownership" | "org" | "tree";
export type Direction = "TB" | "LR";

export interface NodeSpec {
  id: string;
  label: string;
  subtitle?: string;
}

export interface EdgeSpec {
  from: string;
  to: string;
  label?: string;
}

export interface LayoutOptions {
  direction: Direction;
  spacingX: number;
  spacingY: number;
  padding: number;
  nodeWidth: number;
  nodeHeight: number;
}

export interface StyleOptions {
  theme: "bw";
  fontSize: number;
  nodeFill: string;
  nodeLine: string;
  textColor: string;
  connectorColor: string;
}

export interface DiagramSpec {
  id: string;
  type: DiagramType;
  title?: string;
  nodes: NodeSpec[];
  edges: EdgeSpec[];
  layout: LayoutOptions;
  style: StyleOptions;
}

export interface ClarificationResponse {
  need_clarification: true;
  questions: string[];
  best_guess_spec: DiagramSpec | null;
}

export type InterpretResult = DiagramSpec | ClarificationResponse;

export interface UserSettings {
  apiKey: string;
  model: string;
  baseUrl: string;
  temperature: number;
  useOpenAI: boolean;
  style: Pick<LayoutOptions, "nodeWidth" | "nodeHeight" | "padding" | "spacingX" | "spacingY"> & Pick<StyleOptions, "fontSize">;
  autoRender: boolean;
  showSpecPreview: boolean;
}

export interface ActionRecord {
  kind: "create" | "update" | "delete";
  diagramId: string;
  prevSpec?: DiagramSpec;
  nextSpec?: DiagramSpec;
  targetRect?: Rect;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
