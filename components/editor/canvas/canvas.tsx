"use client"

import "@xyflow/react/dist/style.css"

import { useCallback, useEffect, useRef } from "react"
import type { DragEvent, MouseEvent as ReactMouseEvent } from "react"
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
import {
  useCanRedo,
  useCanUndo,
  useRedo,
  useUndo,
  useUpdateMyPresence,
} from "@liveblocks/react"

import { CanvasEdgeRenderer } from "@/components/editor/canvas/canvas-edge"
import { CanvasNodeRenderer } from "@/components/editor/canvas/canvas-node"
import { useCanvasSaveContext } from "@/components/editor/canvas/canvas-save-context"
import { ControlBar } from "@/components/editor/canvas/control-bar"
import { LiveCursors } from "@/components/editor/canvas/live-cursors"
import { PresenceAvatars } from "@/components/editor/canvas/presence-avatars"
import { SHAPE_PANEL_DRAG_TYPE, ShapePanel } from "@/components/editor/canvas/shape-panel"
import { useStarterTemplateContext } from "@/components/editor/canvas/starter-template-context"
import { useCanvasAutosave } from "@/hooks/use-canvas-autosave"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { DEFAULT_NODE_COLOR, EDGE_COLOR } from "@/types/canvas"
import type { CanvasEdge, CanvasNode, ShapeDragPayload } from "@/types/canvas"

const ZOOM_DURATION = 200

const nodeTypes = { canvasNode: CanvasNodeRenderer }
// Registering under the built-in "smoothstep" key overrides that renderer for every
// edge (all edges use type "smoothstep" via defaultEdgeOptions below) — confirmed via
// @xyflow/react's EdgeWrapper source: `edgeTypes?.[edgeType] || builtinEdgeTypes[edgeType]`.
const edgeTypes = { smoothstep: CanvasEdgeRenderer }

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLOR },
  style: { stroke: EDGE_COLOR, strokeWidth: 1.5 },
}

interface CanvasProps {
  projectId: string
}

function Canvas({ projectId }: CanvasProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })

  return (
    <ReactFlowProvider>
      <CanvasFlow
        projectId={projectId}
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
  projectId: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  onNodesChange: ReturnType<typeof useLiveblocksFlow<CanvasNode, CanvasEdge>>["onNodesChange"]
  onEdgesChange: ReturnType<typeof useLiveblocksFlow<CanvasNode, CanvasEdge>>["onEdgesChange"]
  onConnect: ReturnType<typeof useLiveblocksFlow<CanvasNode, CanvasEdge>>["onConnect"]
  onDelete: ReturnType<typeof useLiveblocksFlow<CanvasNode, CanvasEdge>>["onDelete"]
}

function CanvasFlow({
  projectId,
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

  const { setSaveStatus } = useCanvasSaveContext()
  const saveStatus = useCanvasAutosave({ projectId, nodes, edges })

  useEffect(() => {
    setSaveStatus(saveStatus)
  }, [saveStatus, setSaveStatus])

  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  const handleZoomIn = useCallback(() => zoomIn({ duration: ZOOM_DURATION }), [zoomIn])
  const handleZoomOut = useCallback(() => zoomOut({ duration: ZOOM_DURATION }), [zoomOut])
  const handleFitView = useCallback(() => fitView({ duration: ZOOM_DURATION }), [fitView])

  useKeyboardShortcuts({ reactFlowInstance, onUndo: undo, onRedo: redo })

  const updateMyPresence = useUpdateMyPresence()

  const handlePaneMouseMove = useCallback(
    (event: ReactMouseEvent) => {
      updateMyPresence({
        cursor: screenToFlowPosition({ x: event.clientX, y: event.clientY }),
      })
    },
    [updateMyPresence, screenToFlowPosition],
  )

  const handlePaneMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null })
  }, [updateMyPresence])

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

  const hasAttemptedSavedLoadRef = useRef(false)

  useEffect(() => {
    if (hasAttemptedSavedLoadRef.current) return
    hasAttemptedSavedLoadRef.current = true

    if (nodesRef.current.length > 0 || edgesRef.current.length > 0) return

    let cancelled = false

    async function loadSavedCanvas() {
      const response = await fetch(`/api/projects/${projectId}/canvas`)
      if (!response.ok) return

      const data: { canvas: { nodes: CanvasNode[]; edges: CanvasEdge[] } | null } =
        await response.json()

      if (cancelled || !data.canvas) return
      if (nodesRef.current.length > 0 || edgesRef.current.length > 0) return

      onNodesChange(data.canvas.nodes.map((item) => ({ type: "add", item })))
      onEdgesChange(data.canvas.edges.map((item) => ({ type: "add", item })))
    }

    loadSavedCanvas()

    return () => {
      cancelled = true
    }
  }, [projectId, onNodesChange, onEdgesChange])

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
      // screenToFlowPosition gives the flow-space point under the cursor, but a node's
      // `position` is its top-left corner — the drag preview (shape-panel.tsx's
      // setDragImage) is centered on the cursor, so the dropped node must be offset by
      // half its size to land where the ghost was actually shown, not shifted down-right.
      const cursorPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      const position = {
        x: cursorPosition.x - size.width / 2,
        y: cursorPosition.y - size.height / 2,
      }

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
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={defaultEdgeOptions}
        onPaneMouseMove={handlePaneMouseMove}
        onPaneMouseLeave={handlePaneMouseLeave}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
      <LiveCursors />
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
      <PresenceAvatars />
    </div>
  )
}

export { Canvas }
