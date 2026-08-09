"use client"

import { ErrorBoundary } from "react-error-boundary"
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense"

import { Canvas } from "@/components/editor/canvas/canvas"

interface CanvasRoomProps {
  roomId: string
}

function CanvasRoom({ roomId }: CanvasRoomProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider id={roomId} initialPresence={{ cursor: null, thinking: false }}>
        <ErrorBoundary fallback={<CanvasErrorFallback />}>
          <ClientSideSuspense fallback={<CanvasLoadingFallback />}>
            <Canvas projectId={roomId} />
          </ClientSideSuspense>
        </ErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
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
