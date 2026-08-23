import { MarkerType, type Edge, type Node } from "@xyflow/react";

export const CANVAS_NODE_TYPE = "canvasNode";
export const CANVAS_EDGE_TYPE = "canvasEdge";

export const NODE_COLORS = [
  { fill: "#1F1F1F", name: "neutral", text: "#EDEDED" },
  { fill: "#10233D", name: "blue", text: "#52A8FF" },
  { fill: "#2E1938", name: "purple", text: "#BF7AF0" },
  { fill: "#331B00", name: "orange", text: "#FF990A" },
  { fill: "#3C1618", name: "red", text: "#FF6166" },
  { fill: "#3A1726", name: "pink", text: "#F75F8F" },
  { fill: "#0F2E18", name: "green", text: "#62C073" },
  { fill: "#062822", name: "teal", text: "#0AC7B4" },
] as const;

export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const;

export type CanvasNodeColor = (typeof NODE_COLORS)[number]["fill"];
export type CanvasNodeShape = (typeof NODE_SHAPES)[number];

export interface CanvasNodeSize {
  height: number;
  width: number;
}

export const NODE_SHAPE_DEFAULT_SIZES = {
  rectangle: { width: 180, height: 96 },
  diamond: { width: 176, height: 144 },
  circle: { width: 120, height: 120 },
  pill: { width: 180, height: 76 },
  cylinder: { width: 160, height: 100 },
  hexagon: { width: 180, height: 110 },
} as const satisfies Record<CanvasNodeShape, CanvasNodeSize>;

export const CANVAS_NODE_MINIMUM_SIZE = {
  height: 48,
  width: 80,
} as const satisfies CanvasNodeSize;

export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color: CanvasNodeColor;
  shape: CanvasNodeShape;
}

export interface CanvasEdgeData extends Record<string, unknown> {
  label: string;
}

export type CanvasNode = Node<CanvasNodeData, typeof CANVAS_NODE_TYPE>;
export type CanvasEdge = Edge<CanvasEdgeData, typeof CANVAS_EDGE_TYPE>;

export const DEFAULT_CANVAS_EDGE_OPTIONS = {
  data: { label: "" },
  markerEnd: {
    color: "var(--text-primary)",
    type: MarkerType.ArrowClosed,
  },
  style: {
    stroke: "var(--text-primary)",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  type: CANVAS_EDGE_TYPE,
} as const satisfies Partial<CanvasEdge>;
