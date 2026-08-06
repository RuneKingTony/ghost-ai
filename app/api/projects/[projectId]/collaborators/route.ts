import { Prisma } from "@prisma/client"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import { enrichWithClerk, listCollaborators } from "@/lib/collaborators"
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ projectId: string }> }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

  const collaborators = await listCollaborators(projectId)

  return NextResponse.json({ collaborators })
}

export async function POST(request: Request, { params }: RouteParams) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email" },
      { status: 400 }
    )
  }

  const { projectId } = await params
  const project = await prisma.project.findUnique({ where: { id: projectId } })

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const existing = await prisma.projectCollaborator.findUnique({
    where: { projectId_email: { projectId, email } },
  })

  if (existing) {
    return NextResponse.json(
      { error: "Already a collaborator" },
      { status: 409 }
    )
  }

  try {
    const created = await prisma.projectCollaborator.create({
      data: { projectId, email },
    })

    const [collaborator] = await enrichWithClerk([created])

    return NextResponse.json({ collaborator }, { status: 201 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Already a collaborator" },
        { status: 409 }
      )
    }

    throw error
  }
}
