"use client"

import { createContext, useContext } from "react"

import type { CanvasTemplate } from "@/components/editor/starter-templates"

interface StarterTemplateContextValue {
  pendingTemplate: CanvasTemplate | null
  clearPendingTemplate: () => void
}

const StarterTemplateContext = createContext<StarterTemplateContextValue | null>(null)

function useStarterTemplateContext() {
  const context = useContext(StarterTemplateContext)
  if (!context) {
    throw new Error(
      "useStarterTemplateContext must be used within the editor shell"
    )
  }
  return context
}

export { StarterTemplateContext, useStarterTemplateContext }
