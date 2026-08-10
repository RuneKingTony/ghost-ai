import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateObject } from "ai"
import { task } from "@trigger.dev/sdk/v3"
import { mutateFlow } from "@liveblocks/react-flow/node"
import type { MutableFlow } from "@liveblocks/react-flow/node"
import { MarkerType } from "@xyflow/react"
import { z } from "zod"

import { liveblocks } from "@/lib/liveblocks"
import {
  DEFAULT_NODE_COLOR,
  EDGE_COLOR,
  MIN_NODE_SIZE,
  NODE_COLORS,
  NODE_SHAPES,
  NODE_SHAPE_SIZES,
} from "@/types/canvas"
import type { CanvasEdge, CanvasNode } from "@/types/canvas"

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_API_KEY })

const AI_AGENT_USER_ID = "ai-agent"
const AI_AGENT_INFO = { name: "Ghost AI", avatar: "", color: "#8b82ff" }

const nodeShapeSchema = z.enum(NODE_SHAPES)
const nodeColorSchema = z.enum(NODE_COLORS.map((color) => color.fill) as [string, ...string[]])
const nodeIdSchema = z.string().min(1)
const coordinateSchema = z.number().min(-10000).max(10000)
const dimensionSchema = z.number().min(1).max(2000)

// Gemini's structured output mode is unreliable with a z.discriminatedUnion
// (nested oneOf schemas) — verified live, it produces malformed/truncated
// JSON instead of the union's shape. Every action instead shares one flat,
// mostly-optional object, and each action type's required fields are
// checked defensively in applyDesignAction below.
const designActionSchema = z.object({
  type: z.enum([
    "addNode",
    "moveNode",
    "resizeNode",
    "updateNodeData",
    "deleteNode",
    "addEdge",
    "deleteEdge",
  ]),
  id: nodeIdSchema,
  shape: nodeShapeSchema.optional(),
  // `label` and `color` are deliberately NOT `.optional()`, unlike every
  // other field here — live testing showed Gemini reliably omits a field
  // the schema marks optional even when the system prompt insists it's
  // required in prose (structured-output mode follows the JSON Schema's
  // `required` list, not the prompt text): with both optional, addNode
  // actions frequently came back missing `label` and/or `color` outright.
  // Requiring them is what actually gets both onto every addNode/addEdge
  // action; they're simply unused for action types that don't need them
  // (moveNode, resizeNode, deleteNode, deleteEdge). `applyDesignAction`'s
  // fallbacks/defensive checks stay in place as a backstop in case a
  // response still omits one.
  label: z.string().min(1),
  color: nodeColorSchema,
  x: coordinateSchema.optional(),
  y: coordinateSchema.optional(),
  width: dimensionSchema.optional(),
  height: dimensionSchema.optional(),
  source: nodeIdSchema.optional(),
  target: nodeIdSchema.optional(),
})

type DesignAction = z.infer<typeof designActionSchema>

const designResponseSchema = z.object({
  summary: z.string().min(1),
  actions: z.array(designActionSchema),
})

const SYSTEM_PROMPT = `
You are the AI system design agent for Ghost AI, a collaborative architecture diagramming tool. You translate a user's plain-English request into a list of canvas actions that add, move, resize, update, or remove nodes and edges on a shared canvas.

Rules you must follow:
- Only use these node shapes, matching their meaning:
  - rectangle: general-purpose component
  - diamond: decision / gateway
  - circle: event / endpoint
  - pill: service / process
  - cylinder: database / storage
  - hexagon: external system / boundary
- Every "addNode" action MUST include a "color" field, chosen from exactly these node fill colors (hex): ${NODE_COLORS.map((color) => color.fill).join(", ")}. Never omit color or leave a node uncolored. Use color to group related or similar nodes (e.g. every node in the same layer or subsystem shares a color), not randomly or all the same color.
- Every "addEdge" action MUST include a short "label" (2-4 words) describing the relationship or interaction it represents (e.g. "sends request", "writes to", "publishes event"). Never add an edge without a label.
- Lay nodes out left-to-right or top-to-bottom in the direction data generally flows, in clear rows/columns:
  - Leave at least 200px of horizontal space and 120px of vertical space between neighboring nodes so they never overlap.
  - Keep closely related nodes (e.g. a service and its database) visually close together.
  - When extending an existing canvas, place new nodes near the content they relate to and do not overlap the position of any existing node.
- Node ids you invent for new nodes must be short, unique slugs (e.g. "auth-service") not already used on the canvas.
- Only reference node/edge ids that already exist on the canvas, or that you are creating earlier in the same response.
- Keep every x/y position and width/height as a plain, reasonably small number (roughly -2000 to 2000 for positions, 40 to 400 for sizes). Never output extremely large numbers.
- Prefer editing and extending the existing canvas over discarding it, unless the user explicitly asks to start over.
- Keep labels short and human-readable (2-4 words).
- Write a one-sentence, past-tense "summary" describing what you changed, to show the user.
`.trim()

function buildPrompt(
  userPrompt: string,
  nodes: readonly CanvasNode[],
  edges: readonly CanvasEdge[]
): string {
  const canvasDescription =
    nodes.length === 0 && edges.length === 0
      ? "The canvas is currently empty."
      : JSON.stringify(
          {
            nodes: nodes.map((node) => ({
              id: node.id,
              shape: node.data.shape,
              label: node.data.label,
              color: node.data.color,
              x: node.position.x,
              y: node.position.y,
              width: node.width ?? NODE_SHAPE_SIZES[node.data.shape].width,
              height: node.height ?? NODE_SHAPE_SIZES[node.data.shape].height,
            })),
            edges: edges.map((edge) => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              label: edge.data?.label,
            })),
          },
          null,
          2
        )

  return `User request: ${userPrompt}\n\nCurrent canvas state (JSON):\n${canvasDescription}`
}

function applyDesignAction(flow: MutableFlow<CanvasNode, CanvasEdge>, action: DesignAction): void {
  switch (action.type) {
    case "addNode": {
      if (!action.shape || !action.label || action.x === undefined || action.y === undefined) {
        console.warn("Skipping malformed addNode action", action)
        return
      }
      const size = NODE_SHAPE_SIZES[action.shape]
      flow.addNode({
        id: action.id,
        type: "canvasNode",
        position: { x: action.x, y: action.y },
        width: size.width,
        height: size.height,
        // `color` is a required schema field now (see designActionSchema),
        // but the fallback stays as a defensive backstop in case a response
        // still comes back without it.
        data: { label: action.label, color: action.color ?? DEFAULT_NODE_COLOR, shape: action.shape },
      })
      return
    }
    case "moveNode":
      if (action.x === undefined || action.y === undefined) {
        console.warn("Skipping malformed moveNode action", action)
        return
      }
      flow.updateNode(action.id, { position: { x: action.x, y: action.y } })
      return
    case "resizeNode":
      if (action.width === undefined || action.height === undefined) {
        console.warn("Skipping malformed resizeNode action", action)
        return
      }
      flow.updateNode(action.id, {
        width: Math.max(action.width, MIN_NODE_SIZE.width),
        height: Math.max(action.height, MIN_NODE_SIZE.height),
      })
      return
    case "updateNodeData":
      if (action.label === undefined && action.color === undefined) {
        return
      }
      flow.updateNodeData(action.id, (data) => ({
        ...data,
        ...(action.label !== undefined ? { label: action.label } : {}),
        ...(action.color !== undefined ? { color: action.color } : {}),
      }))
      return
    case "deleteNode":
      flow.removeNode(action.id)
      return
    case "addEdge":
      if (!action.source || !action.target) {
        console.warn("Skipping malformed addEdge action", action)
        return
      }
      if (!flow.getNode(action.source) || !flow.getNode(action.target)) {
        console.warn("Skipping addEdge referencing a nonexistent node", action)
        return
      }
      flow.addEdge({
        id: action.id,
        source: action.source,
        target: action.target,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLOR },
        style: { stroke: EDGE_COLOR, strokeWidth: 1.5 },
        ...(action.label !== undefined ? { data: { label: action.label } } : {}),
      })
      return
    case "deleteEdge":
      flow.removeEdge(action.id)
      return
  }
}

// The node/edge id whose position the AI's presence cursor should hover over
// after an action is applied, so collaborators can see roughly what it's
// working on. Delete actions have nothing left to point at.
function actionFocusNodeId(action: DesignAction): string | null {
  switch (action.type) {
    case "addNode":
    case "moveNode":
    case "resizeNode":
    case "updateNodeData":
      return action.id
    case "addEdge":
      return action.target ?? null
    case "deleteNode":
    case "deleteEdge":
      return null
  }
}

function nodeCenter(node: CanvasNode): { x: number; y: number } {
  const size = NODE_SHAPE_SIZES[node.data.shape]
  return {
    x: node.position.x + (node.width ?? size.width) / 2,
    y: node.position.y + (node.height ?? size.height) / 2,
  }
}

async function setAiPresence(
  roomId: string,
  cursor: { x: number; y: number } | null,
  thinking: boolean
): Promise<void> {
  await liveblocks.setPresence(roomId, {
    userId: AI_AGENT_USER_ID,
    data: { cursor, thinking },
    userInfo: AI_AGENT_INFO,
  })
}

async function clearAiPresence(roomId: string): Promise<void> {
  // No API exists to delete ephemeral presence outright, so expire it almost
  // immediately by setting the minimum allowed TTL instead.
  await liveblocks.setPresence(roomId, {
    userId: AI_AGENT_USER_ID,
    data: { cursor: null, thinking: false },
    userInfo: AI_AGENT_INFO,
    ttl: 2,
  })
}

type DesignAgentStatus = "started" | "processing" | "complete" | "error"

async function publishAiStatus(
  roomId: string,
  runId: string,
  status: DesignAgentStatus,
  message: string
): Promise<void> {
  await liveblocks.broadcastEvent(roomId, { type: "ai-status", runId, status, message })
}

interface DesignAgentPayload {
  prompt: string
  roomId: string
}

export const designAgentTask = task({
  id: "design-agent",
  run: async (payload: DesignAgentPayload, { ctx }) => {
    const { prompt, roomId } = payload
    const runId = ctx.run.id

    try {
      await publishAiStatus(roomId, runId, "started", "Reading the current canvas...")
      await setAiPresence(roomId, null, true)

      let summary = "Updated the canvas."

      await mutateFlow<CanvasNode, CanvasEdge>({ client: liveblocks, roomId }, async (flow) => {
        await publishAiStatus(roomId, runId, "processing", "Designing the architecture with Gemini...")

        const { object } = await generateObject({
          // Model choice, in order of what was actually ruled out live on
          // this API key:
          // - "gemini-flash-latest" resolves to "gemini-3.6-flash", which has
          //   a real decoding bug in structured-output mode (emits runaway
          //   multi-hundred-digit numeric tokens for coordinate fields,
          //   failing schema validation almost every time).
          // - "gemini-2.5-flash" / "gemini-2.5-flash-lite": API error, "no
          //   longer available to new users."
          // - "gemini-2.0-flash" / "gemini-2.0-flash-001": API error, quota
          //   limit 0 for this key — this key's free tier has no allocation
          //   for the 2.0 generation at all, not just exhausted usage.
          // - "gemini-flash-lite-latest": verified clean against this exact
          //   schema/prompt on two separate live runs, no decoding issues.
          //   It's an alias (the same category of thing that broke
          //   "gemini-flash-latest"), but it's the only option confirmed to
          //   both work and actually be usable on this key, so it's the
          //   pragmatic choice over a dated id this key can't call at all.
          model: google("gemini-flash-lite-latest"),
          system: SYSTEM_PROMPT,
          prompt: buildPrompt(prompt, flow.nodes, flow.edges),
          schema: designResponseSchema,
        })

        summary = object.summary

        await publishAiStatus(roomId, runId, "processing", "Applying changes to the canvas...")

        for (const action of object.actions) {
          applyDesignAction(flow, action)

          const focusNodeId = actionFocusNodeId(action)
          const focusNode = focusNodeId ? flow.getNode(focusNodeId) : undefined

          if (focusNode) {
            await setAiPresence(roomId, nodeCenter(focusNode), true)
          }
        }
      })

      await publishAiStatus(roomId, runId, "complete", summary)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Design generation failed."
      await publishAiStatus(roomId, runId, "error", message)
      throw error
    } finally {
      await clearAiPresence(roomId)
    }
  },
})
