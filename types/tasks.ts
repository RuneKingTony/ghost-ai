import { z } from "zod"

// Shared AI status feed: a Liveblocks feed (`useFeedMessages`/`useCreateFeedMessage`)
// used to broadcast the AI agent's current activity to everyone in the room.
// Kept intentionally generic so design generation and future spec generation
// can both publish to it.
export const AI_STATUS_FEED_ID = "ai-status-feed"

export const AI_STATUSES = ["thinking", "done", "error"] as const

export type AiStatus = (typeof AI_STATUSES)[number]

export interface AiStatusFeedPayload {
  // An explicit index signature (rather than relying on structural literal
  // inference) is needed so a variable of this type — not just an inline
  // object literal — can be passed directly to Liveblocks feed APIs typed
  // against `JsonObject`.
  [key: string]: string | undefined
  status: AiStatus
  text?: string
}

export function isAiStatusFeedPayload(value: unknown): value is AiStatusFeedPayload {
  if (typeof value !== "object" || value === null) return false

  const candidate = value as Record<string, unknown>

  if (!AI_STATUSES.includes(candidate.status as AiStatus)) return false
  if (candidate.text !== undefined && typeof candidate.text !== "string") return false

  return true
}

// Shared AI chat feed: a separate, room-scoped Liveblocks feed for
// collaborative sidebar chat between users. Kept separate from
// `ai-status-feed` (AI progress/presence updates) rather than mixed in.
export const AI_CHAT_FEED_ID = "ai-chat"

export const CHAT_ROLES = ["user", "assistant"] as const

export type ChatRole = (typeof CHAT_ROLES)[number]

export const aiChatMessageSchema = z.object({
  sender: z.string().min(1),
  role: z.enum(CHAT_ROLES),
  content: z.string().min(1),
  timestamp: z.number(),
})

export interface AiChatMessagePayload {
  // Same index-signature requirement as `AiStatusFeedPayload` above — needed
  // so a typed variable (not just an inline literal) satisfies Liveblocks'
  // `JsonObject`-typed feed APIs.
  [key: string]: string | number | undefined
  sender: string
  role: ChatRole
  content: string
  timestamp: number
}

// Validates unknown feed message data against `aiChatMessageSchema` before
// it's ever rendered, per `code-standards.md`'s "validate unknown external
// input" rule — the global Liveblocks type declaration only constrains what
// this app *writes*, not what's actually on the wire.
export function parseAiChatMessagePayload(value: unknown): AiChatMessagePayload | null {
  const result = aiChatMessageSchema.safeParse(value)
  return result.success ? (result.data as AiChatMessagePayload) : null
}

// Shared request/task payload contract for spec generation (`POST /api/ai/spec`
// and the `generate-spec` Trigger.dev task both import this) — single source
// of truth so the API boundary and the task validate the exact same shape.
// Nodes/edges are described loosely (not `types/canvas.ts`'s `CanvasNode`
// shapes/colors) since this is an AI-input contract describing canvas state
// for prose generation, not a canvas-mutation authority.
export const specCanvasNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  shape: z.string().min(1),
  color: z.string().min(1),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
})

export const specCanvasEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().optional(),
})

export const generateSpecPayloadSchema = z.object({
  projectId: z.string().min(1),
  roomId: z.string().min(1),
  chatHistory: z.array(aiChatMessageSchema),
  nodes: z.array(specCanvasNodeSchema),
  edges: z.array(specCanvasEdgeSchema),
})

export type SpecCanvasNode = z.infer<typeof specCanvasNodeSchema>
export type SpecCanvasEdge = z.infer<typeof specCanvasEdgeSchema>
export type GenerateSpecPayload = z.infer<typeof generateSpecPayloadSchema>
