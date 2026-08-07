"use client"

import { useCallback, useState } from "react"
import type { ChangeEvent, CSSProperties, KeyboardEvent, MouseEvent as ReactMouseEvent } from "react"
import { Handle, NodeResizer, NodeToolbar, Position, useReactFlow } from "@xyflow/react"
import type { NodeProps } from "@xyflow/react"

import { NodeShapeVisual } from "@/components/editor/canvas/node-shape"
import { cn } from "@/lib/utils"
import { MIN_NODE_SIZE, NODE_COLORS, NODE_SHAPE_SIZES } from "@/types/canvas"
import type { CanvasNode } from "@/types/canvas"

const LABEL_FONT_SIZE = 14
const LABEL_LINE_HEIGHT = 20

const CONNECTION_HANDLE_POSITIONS = [Position.Top, Position.Right, Position.Bottom, Position.Left]

function CanvasNodeRenderer({ id, data, selected, width, height }: NodeProps<CanvasNode>) {
  const { updateNodeData } = useReactFlow<CanvasNode>()
  const [isEditing, setIsEditing] = useState(false)

  const textColor = NODE_COLORS.find((color) => color.fill === data.color)?.text ?? NODE_COLORS[0].text
  const defaultSize = NODE_SHAPE_SIZES[data.shape]
  const nodeWidth = width ?? defaultSize.width
  const nodeHeight = height ?? defaultSize.height
  const verticalPadding = Math.max(4, (nodeHeight - LABEL_LINE_HEIGHT) / 2)

  const startEditing = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    setIsEditing(true)
  }, [])

  const stopEditing = useCallback(() => setIsEditing(false), [])

  const handleLabelChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { label: event.target.value })
    },
    [id, updateNodeData],
  )

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      event.currentTarget.blur()
    }
  }, [])

  const handleColorSelect = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>, fill: string) => {
      event.stopPropagation()
      updateNodeData(id, { color: fill })
    },
    [id, updateNodeData],
  )

  return (
    <div className="group relative h-full w-full" onDoubleClick={startEditing}>
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        offset={12}
        onMouseDown={(event: ReactMouseEvent<HTMLDivElement>) => event.stopPropagation()}
        className="nodrag nopan nowheel flex items-center gap-1.5 rounded-full border border-subtle-border bg-surface/95 p-1.5 shadow-lg backdrop-blur"
      >
        {NODE_COLORS.map((color) => {
          const isActive = color.fill === data.color

          return (
            <button
              key={color.fill}
              type="button"
              aria-label={`Set node color to ${color.text}`}
              aria-pressed={isActive}
              onClick={(event) => handleColorSelect(event, color.fill)}
              className={cn(
                "h-5 w-5 shrink-0 rounded-full ring-2 ring-transparent transition-all duration-150 hover:scale-110 hover:shadow-[0_0_4px_1px_var(--glow-color)]",
                isActive && "scale-110 ring-brand",
              )}
              style={
                {
                  backgroundColor: color.fill,
                  border: `1.5px solid ${color.text}`,
                  "--glow-color": color.text,
                } as CSSProperties
              }
            />
          )
        })}
      </NodeToolbar>
      {CONNECTION_HANDLE_POSITIONS.map((position) => (
        // Loose connection mode (canvas.tsx) ignores handle `type` when validating a
        // connection, and both isConnectableStart/End default to true regardless of
        // `type` — so a single "source" handle per side already works as a drop target
        // too, without needing a stacked "target" handle at the same spot.
        <Handle
          key={position}
          type="source"
          position={position}
          id={position}
          className="opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            width: 8,
            height: 8,
            backgroundColor: "var(--text-primary)",
            border: "1px solid var(--bg-base)",
          }}
        />
      ))}
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_SIZE.width}
        minHeight={MIN_NODE_SIZE.height}
        color="var(--accent-primary)"
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 9999,
          border: "1px solid var(--bg-base)",
          backgroundColor: "var(--accent-primary)",
        }}
        lineStyle={{ borderColor: "var(--accent-primary)" }}
      />
      <NodeShapeVisual
        shape={data.shape}
        width={nodeWidth}
        height={nodeHeight}
        fill={data.color}
        selected={selected}
      />
      {isEditing ? (
        <textarea
          autoFocus
          value={data.label}
          placeholder="Label"
          onChange={handleLabelChange}
          onBlur={stopEditing}
          onKeyDown={handleKeyDown}
          onDoubleClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          className="nodrag nopan nowheel absolute inset-0 resize-none border-none bg-transparent px-3 text-center text-sm outline-none placeholder:text-copy-muted"
          style={{ color: textColor, paddingTop: verticalPadding, paddingBottom: verticalPadding, fontSize: LABEL_FONT_SIZE, lineHeight: `${LABEL_LINE_HEIGHT}px` }}
        />
      ) : (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-3 text-center text-sm"
          style={{ color: data.label ? textColor : undefined }}
        >
          {data.label || <span className="text-copy-muted">Label</span>}
        </div>
      )}
    </div>
  )
}

export { CanvasNodeRenderer }
