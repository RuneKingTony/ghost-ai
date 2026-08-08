"use client"

import "@xyflow/react/dist/style.css"

import { useCallback, useEffect, useRef } from "react"
import type { DragEvent } from "react"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react"
import type { DefaultEdgeOptions } from "@xyflow/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { useCanRedo, useCanUndo, useRedo, useUndo } from "@liveblocks/react"

import { CanvasNodeRenderer } from "@/components/editor/canvas/canvas-node"
import { ControlBar } from "@/components/editor/canvas/control-bar"
import { SHAPE_PANEL_DRAG_TYPE, ShapePanel } from "@/components/editor/canvas/shape-panel"
import { useStarterTemplateContext } from "@/components/editor/canvas/starter-template-context"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { DEFAULT_NODE_COLOR, EDGE_COLOR } from "@/types/canvas"
import type { CanvasEdge, CanvasNode, ShapeDragPayload } from "@/types/canvas"

const ZOOM_DURATION = 200

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
  const reactFlowInstance = useReactFlow()
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = reactFlowInstance
  const nodeCounter = useRef(0)

  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  const handleZoomIn = useCallback(() => zoomIn({ duration: ZOOM_DURATION }), [zoomIn])
  const handleZoomOut = useCallback(() => zoomOut({ duration: ZOOM_DURATION }), [zoomOut])
  const handleFitView = useCallback(() => fitView({ duration: ZOOM_DURATION }), [fitView])

  useKeyboardShortcuts({ reactFlowInstance, onUndo: undo, onRedo: redo })

  const { pendingTemplate, clearPendingTemplate } = useStarterTemplateContext()
  const shouldFitViewAfterImportRef = useRef(false)
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)

  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  useEffect(() => {
    edgesRef.current = edges
  }, [edges])

  useEffect(() => {
    if (!pendingTemplate) return

    onDelete({ nodes: nodesRef.current, edges: edgesRef.current })

    onNodesChange(pendingTemplate.nodes.map((item) => ({ type: "add", item })))
    onEdgesChange(pendingTemplate.edges.map((item) => ({ type: "add", item })))

    shouldFitViewAfterImportRef.current = true
    clearPendingTemplate()
  }, [pendingTemplate, onDelete, onNodesChange, onEdgesChange, clearPendingTemplate])

  useEffect(() => {
    if (!shouldFitViewAfterImportRef.current) return
    shouldFitViewAfterImportRef.current = false
    fitView({ duration: ZOOM_DURATION })
  }, [nodes, fitView])

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
      </ReactFlow>
      <ShapePanel />
      <ControlBar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </div>
  )
}

export { Canvas }
