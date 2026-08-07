"use client"

import "@xyflow/react/dist/style.css"

import { useCallback, useRef } from "react"
import type { DragEvent } from "react"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react"
import type { DefaultEdgeOptions } from "@xyflow/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"

import { CanvasNodeRenderer } from "@/components/editor/canvas/canvas-node"
import { SHAPE_PANEL_DRAG_TYPE, ShapePanel } from "@/components/editor/canvas/shape-panel"
import { DEFAULT_NODE_COLOR, EDGE_COLOR } from "@/types/canvas"
import type { CanvasEdge, CanvasNode, ShapeDragPayload } from "@/types/canvas"

const nodeTypes = { canvasNode: CanvasNodeRenderer }

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLOR },
  style: { stroke: EDGE_COLOR, strokeWidth: 1.5 },
}

function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })

  return (
    <ReactFlowProvider>
      <CanvasFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
      />
    </ReactFlowProvider>
  )
}

interface CanvasFlowProps {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  onNodesChange: ReturnType<typeof useLiveblocksFlow<CanvasNode, CanvasEdge>>["onNodesChange"]
  onEdgesChange: ReturnType<typeof useLiveblocksFlow<CanvasNode, CanvasEdge>>["onEdgesChange"]
  onConnect: ReturnType<typeof useLiveblocksFlow<CanvasNode, CanvasEdge>>["onConnect"]
  onDelete: ReturnType<typeof useLiveblocksFlow<CanvasNode, CanvasEdge>>["onDelete"]
}

function CanvasFlow({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDelete,
}: CanvasFlowProps) {
  const { screenToFlowPosition } = useReactFlow()
  const nodeCounter = useRef(0)

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const raw = event.dataTransfer.getData(SHAPE_PANEL_DRAG_TYPE)
      if (!raw) {
        return
      }

      const { shape, size }: ShapeDragPayload = JSON.parse(raw)
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })

      nodeCounter.current += 1
      const id = `${shape}-${Date.now()}-${nodeCounter.current}`

      const newNode: CanvasNode = {
        id,
        type: "canvasNode",
        position,
        width: size.width,
        height: size.height,
        data: { label: "", color: DEFAULT_NODE_COLOR, shape },
      }

      onNodesChange([{ type: "add", item: newNode }])
    },
    [onNodesChange, screenToFlowPosition],
  )

  return (
    <div
      className="relative h-full w-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap />
      </ReactFlow>
      <ShapePanel />
    </div>
  )
}

export { Canvas }
