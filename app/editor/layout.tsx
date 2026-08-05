import { auth } from "@clerk/nextjs/server"

import { EditorShell } from "@/components/editor/editor-shell"
import { getProjectsForUser } from "@/lib/projects"

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  const { owned, shared } = userId
    ? await getProjectsForUser(userId)
    : { owned: [], shared: [] }

  return (
    <EditorShell ownedProjects={owned} sharedProjects={shared}>
      {children}
    </EditorShell>
  )
}
