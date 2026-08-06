"use client"

import { useMemo, useState } from "react"
import { usePathname } from "next/navigation"

import { AiSidebarPlaceholder } from "@/components/editor/ai-sidebar-placeholder"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectActionsProvider } from "@/components/editor/project-actions-provider"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import type { Project } from "@/types/project"

interface EditorShellProps {
  ownedProjects: Project[]
  sharedProjects: Project[]
  children: React.ReactNode
}

function EditorShell({
  ownedProjects,
  sharedProjects,
  children,
}: EditorShellProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false)

  const activeProject = useMemo(() => {
    const match = pathname.match(/^\/editor\/([^/]+)$/)
    if (!match) return null

    const activeId = match[1]
    return (
      [...ownedProjects, ...sharedProjects].find(
        (project) => project.id === activeId
      ) ?? null
    )
  }, [pathname, ownedProjects, sharedProjects])

  return (
    <ProjectActionsProvider>
      <div className="flex h-dvh flex-col bg-base">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
          activeProjectName={activeProject?.name ?? null}
          isAiSidebarOpen={isAiSidebarOpen}
          onToggleAiSidebar={() => setIsAiSidebarOpen((open) => !open)}
          onShare={() => {}}
        />
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          activeProjectId={activeProject?.id ?? null}
        />
        <main className="flex-1 overflow-hidden bg-base">{children}</main>
        {activeProject && (
          <AiSidebarPlaceholder
            isOpen={isAiSidebarOpen}
            onClose={() => setIsAiSidebarOpen(false)}
          />
        )}
      </div>
    </ProjectActionsProvider>
  )
}

export { EditorShell }
