"use client"

import { ErrorBoundary } from "react-error-boundary"
import { ClientSideSuspense } from "@liveblocks/react/suspense"

import { Canvas } from "@/components/editor/canvas/canvas"

interface CanvasRoomProps {
  roomId: string
}

// The Liveblocks room (`LiveblocksProvider`/`RoomProvider`) is established
// higher up, in `EditorShell` — it's shared with the AI sidebar, which is a
// sibling of this page, not a descendant of it. This component only needs
// the loading/error boundary around the canvas itself.
function CanvasRoom({ roomId }: CanvasRoomProps) {
  return (
    <ErrorBoundary fallback={<CanvasErrorFallback />}>
      <ClientSideSuspense fallback={<CanvasLoadingFallback />}>
        <Canvas projectId={roomId} />
      </ClientSideSuspense>
    </ErrorBoundary>
  )
}

function CanvasLoadingFallback() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-copy-muted">
      Loading canvas…
    </div>
  )
}

function CanvasErrorFallback() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-copy-muted">
      Couldn&apos;t connect to the canvas. Try refreshing the page.
    </div>
  )
}

export { CanvasRoom }
