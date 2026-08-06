import { clerkClient } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"
import type { Collaborator } from "@/types/collaborator"

async function enrichWithClerk(
  rows: { id: string; email: string }[]
): Promise<Collaborator[]> {
  if (rows.length === 0) return []

  const client = await clerkClient()
  const lowercasedEmails = rows.map((row) => row.email.toLowerCase())
  const uniqueEmails = Array.from(new Set(lowercasedEmails))

  const users: Array<Awaited<ReturnType<typeof client.users.getUserList>>["data"][number]> = []

  for (let i = 0; i < uniqueEmails.length; i += 100) {
    const batch = uniqueEmails.slice(i, i + 100)
    const { data } = await client.users.getUserList({
      emailAddress: batch,
      limit: batch.length,
    })
    users.push(...data)
  }

  const userByEmail = new Map<string, (typeof users)[number]>()
  for (const user of users) {
    for (const emailAddress of user.emailAddresses) {
      userByEmail.set(emailAddress.emailAddress.toLowerCase(), user)
    }
  }

  return rows.map((row) => {
    const user = userByEmail.get(row.email.toLowerCase())
    const name = user
      ? [user.firstName, user.lastName].filter(Boolean).join(" ") || null
      : null

    return {
      id: row.id,
      email: row.email,
      name,
      avatarUrl: user?.imageUrl ?? null,
    }
  })
}

async function listCollaborators(projectId: string): Promise<Collaborator[]> {
  const rows = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  })

  return enrichWithClerk(rows)
}

export { enrichWithClerk, listCollaborators }
