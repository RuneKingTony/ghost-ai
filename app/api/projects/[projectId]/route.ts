import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ projectId: string }> }

export async function PATCH(request: Request, { params }: RouteParams) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const name = typeof body?.name === "string" ? body.name.trim() : ""

  if (name.length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const { projectId } = await params
  const existing = await prisma.project.findUnique({ where: { id: projectId } })

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (existing.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name },
  })

  return NextResponse.json({ project })
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params
  const existing = await prisma.project.findUnique({ where: { id: projectId } })

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (existing.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const project = await prisma.project.delete({ where: { id: projectId } })

  return NextResponse.json({ project })
}
