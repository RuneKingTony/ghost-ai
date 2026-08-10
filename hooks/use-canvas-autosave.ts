"use client"

import { useEffect, useRef, useState } from "react"

import type { CanvasEdge, CanvasNode } from "@/types/canvas"

type SaveStatus = "idle" | "saving" | "saved" | "error"

const AUTOSAVE_DEBOUNCE_MS = 1500

interface UseCanvasAutosaveOptions {
  projectId: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

function useCanvasAutosave({ projectId, nodes, edges }: UseCanvasAutosaveOptions) {
  const [status, setStatus] = useState<SaveStatus>("idle")
  const isFirstRunRef = useRef(true)
  const saveQueueRef = useRef(Promise.resolve())

  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false
      return
    }

    let cancelled = false

    const timeoutId = setTimeout(() => {
      setStatus("saving")

      // Chained onto the shared queue so PUTs are sent one at a time, in
      // order, and a stale response can never land after a newer one.
      saveQueueRef.current = saveQueueRef.current.catch(() => {}).then(async () => {
        try {
          const response = await fetch(`/api/projects/${projectId}/canvas`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nodes, edges }),
          })

          if (!response.ok) {
            throw new Error("Save failed")
          }

          if (!cancelled) setStatus("saved")
        } catch {
          if (!cancelled) setStatus("error")
        }
      })
    }, AUTOSAVE_DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [nodes, edges, projectId])

  return status
}

export { useCanvasAutosave }
export type { SaveStatus }
