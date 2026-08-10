import { NextResponse } from "next/server"

import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slug"

type RouteParams = { params: Promise<{ projectId: string }> }

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

  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({
    specs: specs.map((spec) => ({
      id: spec.id,
      createdAt: spec.createdAt,
      filename: `${slugify(project.name) || "spec"}-${spec.id}.md`,
    })),
  })
}
