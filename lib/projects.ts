import { currentUser } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"
import type { Project } from "@/types/project"

interface UserProjects {
  owned: Project[]
  shared: Project[]
}

async function getProjectsForUser(userId: string): Promise<UserProjects> {
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress

  const [ownedRows, sharedRows] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    }),
    email
      ? prisma.project.findMany({
          where: { collaborators: { some: { email } } },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ])

  return {
    owned: ownedRows.map((project) => ({
      id: project.id,
      name: project.name,
      isOwner: true,
    })),
    shared: sharedRows.map((project) => ({
      id: project.id,
      name: project.name,
      isOwner: false,
    })),
  }
}

export { getProjectsForUser }
export type { UserProjects }
