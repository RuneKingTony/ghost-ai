import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/editor/access-denied"
import { CanvasRoom } from "@/components/editor/canvas/canvas-room"
import { prisma } from "@/lib/prisma"
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access"

interface WorkspacePageProps {
  params: Promise<{ roomId: string }>
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { roomId } = await params
  const identity = await getCurrentIdentity()

  if (!identity.userId) {
    redirect("/sign-in")
  }

  const project = await prisma.project.findUnique({ where: { id: roomId } })

  if (!project || !(await hasProjectAccess(project, identity))) {
    return <AccessDenied />
  }

  return <CanvasRoom roomId={project.id} />
}
