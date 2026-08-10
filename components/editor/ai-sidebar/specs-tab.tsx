"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Download, FileText, Loader2, Sparkles } from "lucide-react"
import { useFeedMessages, useRoom } from "@liveblocks/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import ReactMarkdown, { type Components } from "react-markdown"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { CanvasEdge, CanvasNode } from "@/types/canvas"
import {
  AI_CHAT_FEED_ID,
  parseAiChatMessagePayload,
  type AiChatMessagePayload,
  type GenerateSpecPayload,
} from "@/types/tasks"
import type { generateSpecTask } from "@/src/trigger/generate-spec"

interface SpecListItem {
  id: string
  createdAt: string
  filename: string
}

interface ChatFeedMessage {
  id: string
  createdAt: number
  data: AiChatMessagePayload
}

// Same ordering/validation pattern `ai-architect-tab.tsx`'s `useOrderedChatMessages`
// already established — duplicated locally rather than shared, since this is
// the only other place that needs the chat feed (as spec-generation input,
// not for rendering).
function useOrderedChatMessages(): ChatFeedMessage[] {
  const { messages } = useFeedMessages(AI_CHAT_FEED_ID)

  return useMemo(() => {
    const parsed: ChatFeedMessage[] = []

    for (const message of messages ?? []) {
      const data = parseAiChatMessagePayload(message.data)
      if (!data) continue
      parsed.push({ id: message.id, createdAt: message.createdAt, data })
    }

    return parsed.sort((a, b) => a.createdAt - b.createdAt)
  }, [messages])
}

type ListStatus = "loading" | "loaded" | "error"
type PreviewStatus = "loading" | "loaded" | "error"

// Custom tag renderers instead of `@tailwindcss/typography`'s `prose` classes
// (not installed) — keeps spec Markdown on the app's own tokens per
// `ui-context.md` rather than that plugin's default gray palette.
const markdownComponents: Components = {
  h1: ({ ...props }) => (
    <h1 className="mb-2 mt-4 text-lg font-semibold text-copy-primary first:mt-0" {...props} />
  ),
  h2: ({ ...props }) => (
    <h2 className="mb-2 mt-4 text-base font-semibold text-copy-primary first:mt-0" {...props} />
  ),
  h3: ({ ...props }) => (
    <h3 className="mb-1.5 mt-3 text-sm font-semibold text-copy-primary first:mt-0" {...props} />
  ),
  p: ({ ...props }) => (
    <p className="mb-3 text-sm leading-relaxed text-copy-secondary last:mb-0" {...props} />
  ),
  ul: ({ ...props }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-copy-secondary" {...props} />
  ),
  ol: ({ ...props }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-copy-secondary" {...props} />
  ),
  li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
  code: ({ ...props }) => (
    <code className="rounded bg-subtle px-1 py-0.5 font-mono text-xs text-ai-text" {...props} />
  ),
  pre: ({ ...props }) => (
    <pre
      className="mb-3 overflow-x-auto rounded-xl bg-subtle p-3 font-mono text-xs text-copy-secondary"
      {...props}
    />
  ),
  a: ({ ...props }) => (
    <a
      className="text-brand underline underline-offset-2"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  strong: ({ ...props }) => <strong className="font-semibold text-copy-primary" {...props} />,
  blockquote: ({ ...props }) => (
    <blockquote className="mb-3 border-l-2 border-subtle-border pl-3 text-copy-muted" {...props} />
  ),
  hr: () => <hr className="my-4 border-surface-border" />,
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function downloadUrl(projectId: string, specId: string): string {
  return `/api/projects/${projectId}/specs/${specId}/download`
}

function SpecsTab() {
  const room = useRoom()
  const projectId = room.id

  const [specs, setSpecs] = useState<SpecListItem[]>([])
  const [listStatus, setListStatus] = useState<ListStatus>("loading")
  const activeListLoadRef = useRef(0)

  const [selectedSpecId, setSelectedSpecId] = useState<string | null>(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>("loading")

  const [runId, setRunId] = useState<string | null>(null)
  const [publicToken, setPublicToken] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const chatMessages = useOrderedChatMessages()
  const { nodes: flowNodes, edges: flowEdges, isLoading: isFlowLoading } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>()

  const { run } = useRealtimeRun<typeof generateSpecTask>(runId ?? undefined, {
    accessToken: publicToken ?? undefined,
    enabled: Boolean(runId && publicToken),
  })

  const isRunActive = Boolean(runId) && !(run?.isCompleted ?? false)

  const fetchSpecs = useCallback(
    async (requestId: number) => {
      setListStatus("loading")

      try {
        const response = await fetch(`/api/projects/${projectId}/specs`)
        if (!response.ok) throw new Error("Failed to load specs")
        const { specs: loaded } = (await response.json()) as { specs: SpecListItem[] }

        if (requestId !== activeListLoadRef.current) return
        setSpecs(loaded)
        setListStatus("loaded")
      } catch {
        if (requestId !== activeListLoadRef.current) return
        setListStatus("error")
      }
    },
    [projectId]
  )

  const loadSpecs = useCallback(async () => {
    const requestId = ++activeListLoadRef.current
    await fetchSpecs(requestId)
  }, [fetchSpecs])

  useEffect(() => {
    loadSpecs()
  }, [loadSpecs])

  // Finalize exactly once per completed run — same guarded-ref pattern
  // `ai-architect-tab.tsx` uses for the design run, since `run` is a new
  // object reference on every throttled realtime update.
  const finalizedRunIdRef = useRef<string | null>(null)

  const applyRunCompletion = useCallback(
    async (isFailed: boolean, errorMessage?: string) => {
      if (isFailed) {
        setGenerateError(`Something went wrong generating that spec: ${errorMessage ?? "the run failed."}`)
      } else {
        await loadSpecs()
      }

      setRunId(null)
      setPublicToken(null)
    },
    [loadSpecs]
  )

  useEffect(() => {
    if (!run || !run.isCompleted) return
    if (finalizedRunIdRef.current === run.id) return
    finalizedRunIdRef.current = run.id

    applyRunCompletion(run.isFailed, run.error?.message)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run])

  const handleGenerate = async () => {
    if (isRunActive || isFlowLoading) return

    setGenerateError(null)

    const chatHistory: GenerateSpecPayload["chatHistory"] = chatMessages.map((message) => ({
      sender: message.data.sender,
      role: message.data.role,
      content: message.data.content,
      timestamp: message.data.timestamp,
    }))

    const nodes: GenerateSpecPayload["nodes"] = flowNodes.map((node) => ({
      id: node.id,
      label: node.data.label,
      shape: node.data.shape,
      color: node.data.color,
      x: node.position.x,
      y: node.position.y,
      width: node.width,
      height: node.height,
    }))

    const edges: GenerateSpecPayload["edges"] = flowEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.data?.label,
    }))

    try {
      const specResponse = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: projectId, chatHistory, nodes, edges }),
      })

      if (!specResponse.ok) throw new Error("Failed to start spec generation.")

      const { runId: newRunId } = (await specResponse.json()) as { runId: string }

      const tokenResponse = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: newRunId }),
      })

      if (!tokenResponse.ok) throw new Error("Failed to authorize spec generation.")

      const { token: newPublicToken } = (await tokenResponse.json()) as { token: string }

      setRunId(newRunId)
      setPublicToken(newPublicToken)
    } catch {
      setGenerateError("Couldn't start generating a spec. Try again.")
    }
  }

  const openPreview = (specId: string) => {
    setSelectedSpecId(specId)
    setPreviewStatus("loading")
    setPreviewContent(null)

    fetch(downloadUrl(projectId, specId))
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load spec")
        return response.text()
      })
      .then((text) => {
        setPreviewContent(text)
        setPreviewStatus("loaded")
      })
      .catch(() => {
        setPreviewStatus("error")
      })
  }

  const closePreview = () => {
    setSelectedSpecId(null)
    setPreviewContent(null)
  }

  const selectedSpec = specs.find((spec) => spec.id === selectedSpecId) ?? null

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
      <Button
        onClick={handleGenerate}
        disabled={isRunActive || isFlowLoading}
        className="w-full shrink-0 bg-ai text-white hover:bg-ai/90"
      >
        {isRunActive ? (
          <>
            <Loader2 data-icon="inline-start" className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles data-icon="inline-start" className="h-4 w-4" />
            Generate Spec
          </>
        )}
      </Button>

      {generateError && (
        <p className="shrink-0 text-sm text-error">{generateError}</p>
      )}

      {listStatus === "loading" && (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-copy-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading specs…
        </div>
      )}

      {listStatus === "error" && (
        <p className="text-sm text-error">Couldn&apos;t load specs. Try again.</p>
      )}

      {listStatus === "loaded" && specs.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <FileText className="h-8 w-8 text-ai-text" />
          <p className="text-sm text-copy-muted">
            No specs yet. Generate one to get started.
          </p>
        </div>
      )}

      {listStatus === "loaded" && specs.length > 0 && (
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2 pr-3">
            {specs.map((spec) => (
              <div
                key={spec.id}
                className="flex items-center gap-2 rounded-2xl border border-surface-border bg-elevated p-3"
              >
                <button
                  type="button"
                  onClick={() => openPreview(spec.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-subtle">
                    <FileText className="h-4 w-4 text-ai-text" />
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-copy-primary">
                      {spec.filename}
                    </span>
                    <span className="text-xs text-copy-muted">
                      {formatDate(spec.createdAt)}
                    </span>
                  </div>
                </button>
                <Button
                  asChild
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Download ${spec.filename}`}
                >
                  <a href={downloadUrl(projectId, spec.id)} download={spec.filename}>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <Dialog
        open={selectedSpecId !== null}
        onOpenChange={(open) => {
          if (!open) closePreview()
        }}
      >
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle>{selectedSpec?.filename ?? "Spec preview"}</DialogTitle>
            {selectedSpec && (
              <DialogDescription>{formatDate(selectedSpec.createdAt)}</DialogDescription>
            )}
          </DialogHeader>

          <ScrollArea className="h-[60vh] rounded-xl border border-surface-border bg-base p-4">
            {previewStatus === "loading" && (
              <div className="flex h-full items-center justify-center gap-2 text-sm text-copy-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading spec…
              </div>
            )}
            {previewStatus === "error" && (
              <p className="text-sm text-error">Couldn&apos;t load this spec. Try again.</p>
            )}
            {previewStatus === "loaded" && previewContent && (
              <ReactMarkdown components={markdownComponents}>{previewContent}</ReactMarkdown>
            )}
          </ScrollArea>

          <DialogFooter>
            {selectedSpec && (
              <Button asChild variant="outline">
                <a href={downloadUrl(projectId, selectedSpec.id)} download={selectedSpec.filename}>
                  <Download data-icon="inline-start" className="h-4 w-4" />
                  Download
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { SpecsTab }
