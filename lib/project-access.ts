import { auth, currentUser } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

interface CurrentIdentity {
  userId: string | null
  email: string | null
}

async function getCurrentIdentity(): Promise<CurrentIdentity> {
  const { userId } = await auth()

  if (!userId) {
    return { userId: null, email: null }
  }

  const user = await currentUser()
  const email =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? null

  return { userId, email }
}

async function hasProjectAccess(
  project: { id: string; ownerId: string },
  identity: CurrentIdentity
): Promise<boolean> {
  if (!identity.userId) return false
  if (project.ownerId === identity.userId) return true
  if (!identity.email) return false

  const collaborator = await prisma.projectCollaborator.findUnique({
    where: {
      projectId_email: { projectId: project.id, email: identity.email },
    },
  })

  return collaborator !== null
}

export { getCurrentIdentity, hasProjectAccess }
export type { CurrentIdentity }
