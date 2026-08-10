import { auth } from "@trigger.dev/sdk/v3"
import { NextResponse } from "next/server"
import { z } from "zod"

import { getCurrentIdentity } from "@/lib/project-access"
import { prisma } from "@/lib/prisma"

const tokenRequestSchema = z.object({ runId: z.string().min(1) })

export async function POST(request: Request) {
  const identity = await getCurrentIdentity()

  if (!identity.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = tokenRequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "runId is required" }, { status: 400 })
  }

  const { runId } = parsed.data

  const taskRun = await prisma.taskRun.findUnique({ where: { runId } })

  if (!taskRun) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (taskRun.userId !== identity.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const token = await auth.createPublicToken({
    scopes: { read: { runs: [runId] } },
    expirationTime: "1h",
  })

  return NextResponse.json({ token })
}
