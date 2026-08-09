"use client"

import { MousePointer2 } from "lucide-react"
import { useOthers } from "@liveblocks/react"
import { useViewport } from "@xyflow/react"

function LiveCursors() {
  const others = useOthers()
  const { x: panX, y: panY, zoom } = useViewport()

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {others.map((other) => {
        const cursor = other.presence.cursor
        if (!cursor) return null

        const name = other.info?.name ?? "Anonymous"
        const color = other.info?.color ?? "#EDEDED"

        return (
          <div
            key={other.connectionId}
            className="absolute left-0 top-0 flex items-center gap-1 will-change-transform"
            style={{
              transform: `translate3d(${cursor.x * zoom + panX}px, ${cursor.y * zoom + panY}px, 0)`,
            }}
          >
            <MousePointer2
              className="h-4 w-4 -translate-x-0.5 -translate-y-0.5"
              style={{ color, fill: color }}
            />
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium text-black/80 shadow-sm"
              style={{ backgroundColor: color }}
            >
              {name}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export { LiveCursors }
