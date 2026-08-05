import { auth, currentUser } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"

interface WorkspacePageProps {
  params: Promise<{ projectId: string }>
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { projectId } = await params
  const { userId } = await auth()

  if (!userId) {
    notFound()
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } })

  if (!project) {
    notFound()
  }

  const isOwner = project.ownerId === userId

  if (!isOwner) {
    const user = await currentUser()
    const email = user?.primaryEmailAddress?.emailAddress
    const collaborator = email
      ? await prisma.projectCollaborator.findUnique({
          where: { projectId_email: { projectId, email } },
        })
      : null

    if (!collaborator) {
      notFound()
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-1.5 px-4 text-center">
      <h1 className="text-lg font-medium text-copy-primary">{project.name}</h1>
      <p className="text-sm text-copy-muted">Canvas coming soon.</p>
    </div>
  )
}
