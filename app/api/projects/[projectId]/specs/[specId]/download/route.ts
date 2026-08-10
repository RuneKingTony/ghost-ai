import { get } from "@vercel/blob"
import { NextResponse } from "next/server"

import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slug"

type RouteParams = { params: Promise<{ projectId: string; specId: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  const identity = await getCurrentIdentity()

  if (!identity.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId, specId } = await params
  const project = await prisma.project.findUnique({ where: { id: projectId } })

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (!(await hasProjectAccess(project, identity))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const spec = await prisma.projectSpec.findUnique({ where: { id: specId } })

  if (!spec || spec.projectId !== projectId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const blob = await get(spec.filePath, { access: "private", useCache: false })

  if (!blob?.stream) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const filename = `${slugify(project.name) || "spec"}-${spec.id}.md`

  return new NextResponse(blob.stream, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
