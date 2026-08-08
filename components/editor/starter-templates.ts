import { MarkerType } from "@xyflow/react"

import { EDGE_COLOR, NODE_COLORS, NODE_SHAPE_SIZES } from "@/types/canvas"
import type { CanvasEdge, CanvasNode, NodeShape } from "@/types/canvas"

interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

interface TemplatePosition {
  x: number
  y: number
}

function templateNode(
  id: string,
  shape: NodeShape,
  label: string,
  position: TemplatePosition,
  colorIndex = 0
): CanvasNode {
  const size = NODE_SHAPE_SIZES[shape]

  return {
    id,
    type: "canvasNode",
    position,
    width: size.width,
    height: size.height,
    data: { label, color: NODE_COLORS[colorIndex].fill, shape },
  }
}

function templateEdge(id: string, source: string, target: string): CanvasEdge {
  return {
    id,
    source,
    target,
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLOR },
    style: { stroke: EDGE_COLOR, strokeWidth: 1.5 },
  }
}

const microservicesTemplate: CanvasTemplate = {
  id: "microservices",
  name: "Microservices",
  description: "An API gateway routing to independent services, each backed by its own database.",
  nodes: [
    templateNode("gateway", "hexagon", "API Gateway", { x: 300, y: 0 }, 0),
    templateNode("auth-service", "pill", "Auth Service", { x: 60, y: 180 }, 1),
    templateNode("orders-service", "pill", "Orders Service", { x: 300, y: 180 }, 1),
    templateNode("inventory-service", "pill", "Inventory Service", { x: 540, y: 180 }, 1),
    templateNode("auth-db", "cylinder", "Auth DB", { x: 90, y: 340 }, 6),
    templateNode("orders-db", "cylinder", "Orders DB", { x: 330, y: 340 }, 6),
    templateNode("inventory-db", "cylinder", "Inventory DB", { x: 570, y: 340 }, 6),
  ],
  edges: [
    templateEdge("gateway-auth", "gateway", "auth-service"),
    templateEdge("gateway-orders", "gateway", "orders-service"),
    templateEdge("gateway-inventory", "gateway", "inventory-service"),
    templateEdge("auth-service-db", "auth-service", "auth-db"),
    templateEdge("orders-service-db", "orders-service", "orders-db"),
    templateEdge("inventory-service-db", "inventory-service", "inventory-db"),
  ],
}

const cicdPipelineTemplate: CanvasTemplate = {
  id: "cicd-pipeline",
  name: "CI/CD Pipeline",
  description: "A build pipeline from source through tests to a gated staging and production deploy.",
  nodes: [
    templateNode("source", "rectangle", "Source Repo", { x: 0, y: 100 }, 0),
    templateNode("build", "rectangle", "Build", { x: 220, y: 100 }, 1),
    templateNode("test", "rectangle", "Test", { x: 440, y: 100 }, 1),
    templateNode("approval", "diamond", "Approved?", { x: 660, y: 60 }, 3),
    templateNode("deploy-staging", "pill", "Deploy to Staging", { x: 920, y: 0 }, 6),
    templateNode("deploy-prod", "pill", "Deploy to Production", { x: 920, y: 200 }, 4),
  ],
  edges: [
    templateEdge("source-build", "source", "build"),
    templateEdge("build-test", "build", "test"),
    templateEdge("test-approval", "test", "approval"),
    templateEdge("approval-staging", "approval", "deploy-staging"),
    templateEdge("approval-prod", "approval", "deploy-prod"),
  ],
}

const eventDrivenTemplate: CanvasTemplate = {
  id: "event-driven-system",
  name: "Event-Driven System",
  description: "A producer publishing to an event bus, fanning out to multiple consumers and a store.",
  nodes: [
    templateNode("producer", "rectangle", "Producer Service", { x: 0, y: 120 }, 0),
    templateNode("event-bus", "hexagon", "Event Bus", { x: 260, y: 100 }, 2),
    templateNode("consumer-a", "pill", "Consumer A", { x: 580, y: 0 }, 1),
    templateNode("consumer-b", "pill", "Consumer B", { x: 580, y: 160 }, 5),
    templateNode("consumer-c", "pill", "Consumer C", { x: 580, y: 320 }, 6),
    templateNode("event-store", "cylinder", "Event Store", { x: 270, y: 300 }, 7),
  ],
  edges: [
    templateEdge("producer-bus", "producer", "event-bus"),
    templateEdge("bus-consumer-a", "event-bus", "consumer-a"),
    templateEdge("bus-consumer-b", "event-bus", "consumer-b"),
    templateEdge("bus-consumer-c", "event-bus", "consumer-c"),
    templateEdge("bus-store", "event-bus", "event-store"),
  ],
}

const CANVAS_TEMPLATES: CanvasTemplate[] = [
  microservicesTemplate,
  cicdPipelineTemplate,
  eventDrivenTemplate,
]

export { CANVAS_TEMPLATES }
export type { CanvasTemplate }
