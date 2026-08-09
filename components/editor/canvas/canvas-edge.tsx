"use client"

import { useCallback, useState } from "react"
import type { ChangeEvent, KeyboardEvent, MouseEvent as ReactMouseEvent } from "react"
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow } from "@xyflow/react"
import type { EdgeProps } from "@xyflow/react"

import type { CanvasEdge, CanvasNode } from "@/types/canvas"

function CanvasEdgeRenderer({
  id,
  data,
  selected,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerStart,
  markerEnd,
}: EdgeProps<CanvasEdge>) {
  const { updateEdgeData } = useReactFlow<CanvasNode, CanvasEdge>()
  const [isEditing, setIsEditing] = useState(false)

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const startEditing = useCallback((event: ReactMouseEvent) => {
    event.stopPropagation()
    setIsEditing(true)
  }, [])

  const stopEditing = useCallback(() => setIsEditing(false), [])

  const handleLabelChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      updateEdgeData(id, { label: event.target.value })
    },
    [id, updateEdgeData],
  )

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" || event.key === "Enter") {
      event.currentTarget.blur()
    }
  }, [])

  const label = data?.label ?? ""
  const showLabel = isEditing || Boolean(label) || selected

  return (
    <>
      {/* Wrapping <g> gives double-click a target across BaseEdge's full invisible
          interaction stroke, not just the thin 1.5px visible line. */}
      <g onDoubleClick={startEditing} className="cursor-pointer">
        <BaseEdge id={id} path={path} style={style} markerStart={markerStart} markerEnd={markerEnd} />
      </g>
      {showLabel ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan nowheel pointer-events-auto absolute"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
            onDoubleClick={startEditing}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {isEditing ? (
              <input
                autoFocus
                value={label}
                placeholder="Label"
                onChange={handleLabelChange}
                onBlur={stopEditing}
                onKeyDown={handleKeyDown}
                className="w-28 rounded-md border border-brand bg-surface px-2 py-0.5 text-center text-xs text-copy-primary outline-none placeholder:text-copy-muted"
              />
            ) : (
              <div className="rounded-md border border-subtle-border bg-surface/90 px-2 py-0.5 text-center text-xs text-copy-primary backdrop-blur">
                {label || <span className="text-copy-muted">Add label</span>}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  )
}

export { CanvasEdgeRenderer }
