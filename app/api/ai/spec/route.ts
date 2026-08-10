import { tasks } from "@trigger.dev/sdk/v3"
import { NextResponse } from "next/server"

import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access"
import { prisma } from "@/lib/prisma"
import type { generateSpecTask } from "@/src/trigger/generate-spec"
import { generateSpecPayloadSchema } from "@/types/tasks"

// `projectId` is deliberately excluded from the client-supplied body — per
// this unit's spec, project access must come from the authenticated user +
// `roomId`, never a client-provided project id. `roomId` and `projectId` are
// the same value per the `10-liveblocks-setup.md` convention, so the real
// `projectId` is resolved server-side by looking up the project by `roomId`.
const specRequestSchema = generateSpecPayloadSchema.omit({ projectId: true })

export async function POST(request: Request) {
  const identity = await getCurrentIdentity()

  if (!identity.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = specRequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { roomId, chatHistory, nodes, edges } = parsed.data

  const project = await prisma.project.findUnique({ where: { id: roomId } })

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (!(await hasProjectAccess(project, identity))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const handle = await tasks.trigger<typeof generateSpecTask>("generate-spec", {
    projectId: project.id,
    roomId,
    chatHistory,
    nodes,
    edges,
  })

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId: project.id,
      userId: identity.userId,
    },
  })

  return NextResponse.json({ runId: handle.id }, { status: 201 })
}
