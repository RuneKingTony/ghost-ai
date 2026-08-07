"use client"

import type { DragEvent } from "react"
import { useRef } from "react"
import { Circle, Cylinder, Diamond, Hexagon, Pill as PillIcon, Square } from "lucide-react"

import { NodeShapeVisual } from "@/components/editor/canvas/node-shape"
import { DEFAULT_NODE_COLOR, NODE_SHAPES, NODE_SHAPE_SIZES } from "@/types/canvas"
import type { NodeShape, ShapeDragPayload } from "@/types/canvas"

const SHAPE_PANEL_DRAG_TYPE = "application/x-canvas-shape"

const SHAPE_ICONS: Record<NodeShape, typeof Square> = {
  rectangle: Square,
  diamond: Diamond,
  circle: Circle,
  pill: PillIcon,
  cylinder: Cylinder,
  hexagon: Hexagon,
}

const SHAPE_LABELS: Record<NodeShape, string> = {
  rectangle: "Rectangle",
  diamond: "Diamond",
  circle: "Circle",
  pill: "Pill",
  cylinder: "Cylinder",
  hexagon: "Hexagon",
}

function ShapePanel() {
  const previewRefs = useRef<Partial<Record<NodeShape, HTMLDivElement | null>>>({})

  function handleShapeDragStart(event: DragEvent<HTMLButtonElement>, shape: NodeShape) {
    const size = NODE_SHAPE_SIZES[shape]
    const payload: ShapeDragPayload = { shape, size }
    event.dataTransfer.setData(SHAPE_PANEL_DRAG_TYPE, JSON.stringify(payload))
    event.dataTransfer.effectAllowed = "move"

    const preview = previewRefs.current[shape]
    if (preview) {
      event.dataTransfer.setDragImage(preview, size.width / 2, size.height / 2)
    }
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-subtle-border bg-surface/90 p-2 shadow-lg backdrop-blur">
          {Object.entries(SHAPE_ICONS).map(([shape, Icon]) => (
            <button
              key={shape}
              type="button"
              draggable
              onDragStart={(event) => handleShapeDragStart(event, shape as NodeShape)}
              aria-label={`Drag to add a ${SHAPE_LABELS[shape as NodeShape]} node`}
              title={SHAPE_LABELS[shape as NodeShape]}
              className="flex h-10 w-10 cursor-grab items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-subtle hover:text-copy-primary active:cursor-grabbing"
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>
      <div className="fixed left-[-9999px] top-[-9999px]" aria-hidden>
        {NODE_SHAPES.map((shape) => {
          const size = NODE_SHAPE_SIZES[shape]

          return (
            <div
              key={shape}
              ref={(node) => {
                previewRefs.current[shape] = node
              }}
              style={{ width: size.width, height: size.height, opacity: 0.85 }}
            >
              <NodeShapeVisual shape={shape} width={size.width} height={size.height} fill={DEFAULT_NODE_COLOR} />
            </div>
          )
        })}
      </div>
    </>
  )
}

export { SHAPE_PANEL_DRAG_TYPE, ShapePanel }
