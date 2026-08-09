"use client"

import { createContext, useContext } from "react"

import type { SaveStatus } from "@/hooks/use-canvas-autosave"

interface CanvasSaveContextValue {
  setSaveStatus: (status: SaveStatus) => void
}

const CanvasSaveContext = createContext<CanvasSaveContextValue | null>(null)

function useCanvasSaveContext() {
  const context = useContext(CanvasSaveContext)
  if (!context) {
    throw new Error("useCanvasSaveContext must be used within the editor shell")
  }
  return context
}

export { CanvasSaveContext, useCanvasSaveContext }
