import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/editor/access-denied"
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

  return (
    <div className="flex h-full flex-col items-center justify-center gap-1.5 px-4 text-center">
      <h1 className="text-lg font-medium text-copy-primary">
        {project.name}
      </h1>
      <p className="text-sm text-copy-muted">Canvas coming soon.</p>
    </div>
  )
}
