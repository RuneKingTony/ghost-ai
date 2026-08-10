"use client"

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type SubmitEvent } from "react"
import { Bot, Loader2, Send } from "lucide-react"
import {
  useCreateFeed,
  useCreateFeedMessage,
  useFeedMessages,
  useRoom,
  useSelf,
} from "@liveblocks/react"
import { useRealtimeRun } from "@trigger.dev/react-hooks"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  AI_CHAT_FEED_ID,
  AI_STATUS_FEED_ID,
  isAiStatusFeedPayload,
  parseAiChatMessagePayload,
  type AiChatMessagePayload,
  type AiStatusFeedPayload,
} from "@/types/tasks"
import type { designAgentTask } from "@/src/trigger/design-agent"

interface AiArchitectTabProps {
  isGenerating: boolean
}

interface ChatFeedMessage {
  id: string
  createdAt: number
  data: AiChatMessagePayload
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

// Reused verbatim from `NODE_COLORS`' Green entry (`types/canvas.ts`) rather
// than introducing a new hex — the spec calls for this exact green as the
// submit button/status-strip accent and the user chat bubble background.
const GREEN_ACCENT = "#62C073"
const GREEN_ACCENT_CONTRAST = "#0F2E18"

function formatTimestamp(createdAt: number): string {
  return new Date(createdAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })
}

// The feed hook returns a page of messages, not guaranteed to be sorted —
// order by the feed's own `createdAt` (authoritative) rather than assuming
// array order, and validate each message's data before it's ever rendered.
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

// Same "pick the true latest by createdAt, validate before trusting" pattern
// `ai-sidebar.tsx` already established for this feed — duplicated locally
// (rather than shared) since this is the only other place that needs the
// feed's latest message, as the status strip's text source.
function useLatestAiStatus(): AiStatusFeedPayload | null {
  const { messages } = useFeedMessages(AI_STATUS_FEED_ID)

  return useMemo(() => {
    let latest: { createdAt: number; data: AiStatusFeedPayload } | null = null

    for (const message of messages ?? []) {
      if (!isAiStatusFeedPayload(message.data)) continue
      if (!latest || message.createdAt > latest.createdAt) {
        latest = { createdAt: message.createdAt, data: message.data }
      }
    }

    return latest?.data ?? null
  }, [messages])
}

function AiArchitectTab({ isGenerating }: AiArchitectTabProps) {
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [runId, setRunId] = useState<string | null>(null)
  const [publicToken, setPublicToken] = useState<string | null>(null)

  const room = useRoom()
  const self = useSelf()
  const senderName = self?.info?.name ?? "Anonymous"

  const chatMessages = useOrderedChatMessages()
  const latestAiStatus = useLatestAiStatus()
  const createFeed = useCreateFeed()
  const createFeedMessage = useCreateFeedMessage()

  const { run } = useRealtimeRun<typeof designAgentTask>(runId ?? undefined, {
    accessToken: publicToken ?? undefined,
    enabled: Boolean(runId && publicToken),
  })

  const isRunActive = Boolean(runId) && !(run?.isCompleted ?? false)

  const postAssistantMessage = async (content: string) => {
    const payload: AiChatMessagePayload = {
      sender: "Ghost AI",
      role: "assistant",
      content,
      timestamp: Date.now(),
    }

    try {
      await createFeedMessage(AI_CHAT_FEED_ID, payload)
    } catch {
      try {
        await createFeed(AI_CHAT_FEED_ID)
        await createFeedMessage(AI_CHAT_FEED_ID, payload)
      } catch {
        // Best effort — there's no further fallback for a system message.
      }
    }
  }

  // Finalize exactly once per completed run: push the closing AI message to
  // `ai-chat`, then reset loading + run state. Guarded by a ref (not just the
  // effect's own dependency array) because `run` is a new object on every
  // throttled update from the subscription, including re-renders that happen
  // after this run has already been finalized but before `runId`/`publicToken`
  // have actually cleared.
  const finalizedRunIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!run || !run.isCompleted) return
    if (finalizedRunIdRef.current === run.id) return
    finalizedRunIdRef.current = run.id

    const message = run.isFailed
      ? `Something went wrong generating that design: ${run.error?.message ?? "the run failed."}`
      : "I've updated the canvas based on your request."

    void postAssistantMessage(message).finally(() => {
      setRunId(null)
      setPublicToken(null)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run])

  const sendMessage = async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || isSending || isRunActive) return

    const payload: AiChatMessagePayload = {
      sender: senderName,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    }

    setIsSending(true)
    setSendError(null)

    try {
      await createFeedMessage(AI_CHAT_FEED_ID, payload)
    } catch {
      try {
        // Feed doesn't exist yet in this room — create (idempotent, "create
        // or reuse") and retry once.
        await createFeed(AI_CHAT_FEED_ID)
        await createFeedMessage(AI_CHAT_FEED_ID, payload)
      } catch {
        setSendError("Couldn't send your message. Try again.")
        setIsSending(false)
        return
      }
    }

    setInput("")

    try {
      const designResponse = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          roomId: room.id,
          projectId: room.id,
        }),
      })

      if (!designResponse.ok) {
        throw new Error("Failed to start the design run.")
      }

      const { runId: newRunId } = (await designResponse.json()) as {
        runId: string
      }

      const tokenResponse = await fetch("/api/ai/design/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: newRunId }),
      })

      if (!tokenResponse.ok) {
        throw new Error("Failed to authorize the design run.")
      }

      const { token: newPublicToken } = (await tokenResponse.json()) as {
        token: string
      }

      setRunId(newRunId)
      setPublicToken(newPublicToken)
    } catch {
      await postAssistantMessage(
        "I couldn't start generating a design for that request. Please try again."
      )
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault()
    void sendMessage(input)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void sendMessage(input)
    }
  }

  const isInputDisabled = isGenerating || isSending || isRunActive

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {chatMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <Bot className="h-8 w-8 text-ai-text" />
            <p className="text-sm text-copy-muted">
              No messages yet. Start the conversation.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isInputDisabled}
                  onClick={() => setInput(prompt)}
                  className="rounded-full bg-subtle px-3 py-1.5 text-xs text-ai-text transition-colors hover:bg-subtle/70 disabled:pointer-events-none disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {chatMessages.map((message) => {
              const isOwnMessage = message.data.sender === senderName

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col gap-1",
                    isOwnMessage ? "items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center gap-2 text-xs text-copy-muted">
                    <span className="font-medium text-copy-primary">
                      {message.data.sender}
                    </span>
                    <span>{formatTimestamp(message.createdAt)}</span>
                  </div>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                      !isOwnMessage &&
                        "border border-surface-border bg-elevated text-ai-text"
                    )}
                    style={
                      isOwnMessage
                        ? { backgroundColor: GREEN_ACCENT, color: GREEN_ACCENT_CONTRAST }
                        : undefined
                    }
                  >
                    {message.data.content}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {isRunActive && (
        <div
          className="mx-4 mt-3 flex shrink-0 items-center gap-2 rounded-lg bg-base px-3 py-2 text-xs"
          style={{ color: GREEN_ACCENT, border: `1px solid ${GREEN_ACCENT}4D` }}
        >
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
          <span className="truncate">
            {latestAiStatus?.text ?? "Ghost AI is designing your canvas…"}
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-surface-border p-4 pb-16"
      >
        {sendError && (
          <p className="mb-2 text-xs text-error">{sendError}</p>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isInputDisabled}
            placeholder="Send a message to the room..."
            className="min-h-[72px] max-h-[160px] resize-none overflow-y-auto"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isInputDisabled}
            aria-label="Send message"
            className="shrink-0 hover:opacity-90"
            style={{ backgroundColor: GREEN_ACCENT, color: GREEN_ACCENT_CONTRAST }}
          >
            {isInputDisabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export { AiArchitectTab }
