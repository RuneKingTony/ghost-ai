import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"
import { metadata, schemaTask } from "@trigger.dev/sdk/v3"
import { put } from "@vercel/blob"

import { prisma } from "@/lib/prisma"
import { generateSpecPayloadSchema } from "@/types/tasks"
import type { GenerateSpecPayload, SpecCanvasEdge, SpecCanvasNode } from "@/types/tasks"

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_API_KEY })

const SYSTEM_PROMPT = `
You are a technical writer generating a Markdown system design specification for Ghost AI, a collaborative architecture diagramming tool. You are given the current canvas (its nodes and edges) and the conversation that shaped it, and you write a clear, well-organized spec a developer could implement from.

Structure the document with Markdown headings, for example:
- A short title and a one-paragraph overview of what the system does
- Components: one entry per node describing its role and responsibilities
- Interactions / Data Flow: one entry per edge describing what it represents
- Notes or open questions, if any are evident from the conversation

Only describe what is actually present in the canvas and conversation — do not invent components, integrations, or requirements that aren't reflected in the input. Output plain Markdown only, with no surrounding commentary.
`.trim()

function describeNode(node: SpecCanvasNode): string {
  const size =
    node.width !== undefined && node.height !== undefined ? `, size ${node.width}x${node.height}` : ""
  return `- id: ${node.id}, shape: ${node.shape}, label: "${node.label}", position: (${node.x}, ${node.y})${size}`
}

function describeEdge(edge: SpecCanvasEdge): string {
  return `- ${edge.source} -> ${edge.target}${edge.label ? ` ("${edge.label}")` : ""}`
}

function buildPrompt(
  chatHistory: GenerateSpecPayload["chatHistory"],
  nodes: readonly SpecCanvasNode[],
  edges: readonly SpecCanvasEdge[]
): string {
  const canvasDescription =
    nodes.length === 0 && edges.length === 0
      ? "The canvas is currently empty."
      : ["Nodes:", ...nodes.map(describeNode), "", "Edges:", ...edges.map(describeEdge)].join("\n")

  const conversationDescription =
    chatHistory.length === 0
      ? "No conversation history was provided."
      : chatHistory.map((message) => `${message.sender} (${message.role}): ${message.content}`).join("\n")

  return `Conversation:\n${conversationDescription}\n\nCurrent canvas state:\n${canvasDescription}`
}

export const generateSpecTask = schemaTask({
  id: "generate-spec",
  schema: generateSpecPayloadSchema,
  run: async (payload) => {
    console.log(`Generating spec for project ${payload.projectId} (room ${payload.roomId})`)

    metadata.set("status", "generating")

    try {
      const { text } = await generateText({
        // Same model as `design-agent.ts`, pinned there after live testing
        // ruled out every other candidate on this API key (see that file's
        // comment for the full elimination chain) — reused here rather than
        // re-deriving it, since this is the same Gemini account/quota.
        model: google("gemini-flash-lite-latest"),
        system: SYSTEM_PROMPT,
        prompt: buildPrompt(payload.chatHistory, payload.nodes, payload.edges),
      })

      // Metadata row is created first (empty `filePath`) so the blob key can
      // include the spec's own id, matching the `specs/{projectId}/{specId}.md`
      // path `architecture-context.md`'s storage model defines; `filePath` is
      // filled in once the upload resolves, following the same
      // metadata-then-blob-then-link pattern `canvas/route.ts` uses.
      const specRecord = await prisma.projectSpec.create({
        data: { projectId: payload.projectId, filePath: "" },
      })

      const blob = await put(`specs/${payload.projectId}/${specRecord.id}.md`, text, {
        access: "private",
        contentType: "text/markdown",
        addRandomSuffix: false,
        allowOverwrite: true,
      })

      await prisma.projectSpec.update({
        where: { id: specRecord.id },
        data: { filePath: blob.url },
      })

      metadata.set("status", "complete")

      return text
    } catch (error) {
      const message = error instanceof Error ? error.message : "Spec generation failed."
      metadata.set("status", "error")
      metadata.set("error", message)
      throw error
    }
  },
})
