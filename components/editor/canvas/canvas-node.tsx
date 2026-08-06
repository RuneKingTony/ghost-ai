"use client"

import type { NodeProps } from "@xyflow/react"

import { NODE_COLORS } from "@/types/canvas"
import type { CanvasNode } from "@/types/canvas"

function CanvasNodeRenderer({ data }: NodeProps<CanvasNode>) {
  const textColor = NODE_COLORS.find((color) => color.fill === data.color)?.text ?? NODE_COLORS[0].text

  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-xl border border-subtle-border px-3 text-center text-sm"
      style={{ backgroundColor: data.color, color: textColor }}
    >
      {data.label}
    </div>
  )
}

export { CanvasNodeRenderer }
