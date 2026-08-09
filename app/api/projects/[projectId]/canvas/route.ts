import { get, put } from "@vercel/blob"
import { NextResponse } from "next/server"

import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access"
import { prisma } from "@/lib/prisma"
import type { CanvasEdge, CanvasNode } from "@/types/canvas"

type RouteParams = { params: Promise<{ projectId: string }> }

interface CanvasPayload {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

function isCanvasPayload(body: unknown): body is CanvasPayload {
  if (typeof body !== "object" || body === null) return false
  const { nodes, edges } = body as Record<string, unknown>
  return Array.isArray(nodes) && Array.isArray(edges)
}

export async function PUT(request: Request, { params }: RouteParams) {
  const identity = await getCurrentIdentity()

  if (!identity.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params
  const project = await prisma.project.findUnique({ where: { id: projectId } })

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (!(await hasProjectAccess(project, identity))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => null)

  if (!isCanvasPayload(body)) {
    return NextResponse.json(
      { error: "Request body must include nodes and edges arrays" },
      { status: 400 }
    )
  }

  const blob = await put(
    `canvas/${projectId}.json`,
    JSON.stringify({ nodes: body.nodes, edges: body.edges }),
    {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    }
  )

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  })

  return NextResponse.json({ url: blob.url })
}

export async function GET(_request: Request, { params }: RouteParams) {
  const identity = await getCurrentIdentity()

  if (!identity.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params
  const project = await prisma.project.findUnique({ where: { id: projectId } })

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (!(await hasProjectAccess(project, identity))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (!project.canvasJsonPath) {
    return NextResponse.json({ canvas: null })
  }

  const blob = await get(project.canvasJsonPath, { access: "private", useCache: false })

  if (!blob?.stream) {
    return NextResponse.json({ canvas: null })
  }

  const canvas = JSON.parse(
    await new Response(blob.stream).text()
  ) as CanvasPayload

  return NextResponse.json({ canvas })
}
