import type { Edge, Node } from "@xyflow/react"

const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const

type NodeShape = (typeof NODE_SHAPES)[number]

interface NodeColor {
  fill: string
  text: string
}

const NODE_COLORS: NodeColor[] = [
  { fill: "#1F1F1F", text: "#EDEDED" },
  { fill: "#10233D", text: "#52A8FF" },
  { fill: "#2E1938", text: "#BF7AF0" },
  { fill: "#331B00", text: "#FF990A" },
  { fill: "#3C1618", text: "#FF6166" },
  { fill: "#3A1726", text: "#F75F8F" },
  { fill: "#0F2E18", text: "#62C073" },
  { fill: "#062822", text: "#0AC7B4" },
]

interface CanvasNodeData extends Record<string, unknown> {
  label: string
  color: string
  shape: NodeShape
}

interface CanvasEdgeData extends Record<string, unknown> {
  label?: string
}

type CanvasNode = Node<CanvasNodeData, "canvasNode">
type CanvasEdge = Edge<CanvasEdgeData, "smoothstep">

interface ShapeSize {
  width: number
  height: number
}

const NODE_SHAPE_SIZES: Record<NodeShape, ShapeSize> = {
  rectangle: { width: 160, height: 80 },
  diamond: { width: 180, height: 180 },
  circle: { width: 100, height: 100 },
  pill: { width: 160, height: 56 },
  cylinder: { width: 100, height: 120 },
  hexagon: { width: 160, height: 100 },
}

const DEFAULT_NODE_COLOR = NODE_COLORS[0].fill

const MIN_NODE_SIZE: ShapeSize = { width: 40, height: 40 }

const EDGE_COLOR = "#f8fafc"

interface ShapeDragPayload {
  shape: NodeShape
  size: ShapeSize
}

export { DEFAULT_NODE_COLOR, EDGE_COLOR, MIN_NODE_SIZE, NODE_COLORS, NODE_SHAPE_SIZES, NODE_SHAPES }
export type {
  CanvasEdge,
  CanvasEdgeData,
  CanvasNode,
  CanvasNodeData,
  NodeColor,
  NodeShape,
  ShapeDragPayload,
  ShapeSize,
}
