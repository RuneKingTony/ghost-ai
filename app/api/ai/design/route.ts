import { tasks } from "@trigger.dev/sdk/v3"
import { NextResponse } from "next/server"

import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access"
import { prisma } from "@/lib/prisma"
import type { designAgentTask } from "@/src/trigger/design-agent"

export async function POST(request: Request) {
  const identity = await getCurrentIdentity()

  if (!identity.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : ""
  const roomId = typeof body?.roomId === "string" ? body.roomId : ""
  const projectId = typeof body?.projectId === "string" ? body.projectId : ""

  if (prompt.length === 0 || roomId.length === 0 || projectId.length === 0) {
    return NextResponse.json(
      { error: "prompt, roomId, and projectId are required" },
      { status: 400 }
    )
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } })

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (!(await hasProjectAccess(project, identity))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const handle = await tasks.trigger<typeof designAgentTask>("design-agent", {
    prompt,
    roomId,
  })

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId,
      userId: identity.userId,
    },
  })

  return NextResponse.json({ runId: handle.id }, { status: 201 })
}
