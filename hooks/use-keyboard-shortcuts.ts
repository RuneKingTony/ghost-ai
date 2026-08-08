"use client"

import { useEffect } from "react"
import type { ReactFlowInstance } from "@xyflow/react"

const ZOOM_DURATION = 200

interface UseKeyboardShortcutsOptions {
  reactFlowInstance: ReactFlowInstance | null
  onUndo: () => void
  onRedo: () => void
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA"
}

function useKeyboardShortcuts({ reactFlowInstance, onUndo, onRedo }: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) {
        return
      }

      const isModifierPressed = event.metaKey || event.ctrlKey

      if (isModifierPressed && event.key.toLowerCase() === "z") {
        event.preventDefault()
        if (event.shiftKey) {
          onRedo()
        } else {
          onUndo()
        }
        return
      }

      if (isModifierPressed && event.key.toLowerCase() === "y") {
        event.preventDefault()
        onRedo()
        return
      }

      if (isModifierPressed) {
        return
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault()
        reactFlowInstance?.zoomIn({ duration: ZOOM_DURATION })
        return
      }

      if (event.key === "-") {
        event.preventDefault()
        reactFlowInstance?.zoomOut({ duration: ZOOM_DURATION })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [reactFlowInstance, onUndo, onRedo])
}

export { useKeyboardShortcuts }
