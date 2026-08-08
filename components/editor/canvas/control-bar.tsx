"use client"

import type { ReactNode } from "react"
import { Maximize, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react"

interface ControlBarProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

function ControlBar({ onZoomIn, onZoomOut, onFitView, onUndo, onRedo, canUndo, canRedo }: ControlBarProps) {
  return (
    <div className="pointer-events-none absolute bottom-6 left-6 z-20 flex">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-subtle-border bg-surface/90 p-2 shadow-lg backdrop-blur">
        <ControlBarButton label="Zoom out" onClick={onZoomOut}>
          <ZoomOut className="h-5 w-5" />
        </ControlBarButton>
        <ControlBarButton label="Fit view" onClick={onFitView}>
          <Maximize className="h-5 w-5" />
        </ControlBarButton>
        <ControlBarButton label="Zoom in" onClick={onZoomIn}>
          <ZoomIn className="h-5 w-5" />
        </ControlBarButton>
        <div className="mx-1 h-5 w-px bg-subtle-border" />
        <ControlBarButton label="Undo" onClick={onUndo} disabled={!canUndo}>
          <Undo2 className="h-5 w-5" />
        </ControlBarButton>
        <ControlBarButton label="Redo" onClick={onRedo} disabled={!canRedo}>
          <Redo2 className="h-5 w-5" />
        </ControlBarButton>
      </div>
    </div>
  )
}

interface ControlBarButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}

function ControlBarButton({ label, onClick, disabled, children }: ControlBarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-subtle hover:text-copy-primary disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export { ControlBar }
