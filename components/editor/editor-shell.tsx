"use client"

import { useMemo, useState } from "react"
import { usePathname } from "next/navigation"

import { AiSidebar } from "@/components/editor/ai-sidebar/ai-sidebar"
import { CanvasSaveContext } from "@/components/editor/canvas/canvas-save-context"
import { StarterTemplateContext } from "@/components/editor/canvas/starter-template-context"
import { ShareProjectDialog } from "@/components/editor/dialogs/share-project-dialog"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectActionsProvider } from "@/components/editor/project-actions-provider"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import type { SaveStatus } from "@/hooks/use-canvas-autosave"
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
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [pendingTemplate, setPendingTemplate] = useState<CanvasTemplate | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [saveStatusProjectId, setSaveStatusProjectId] = useState<string | null>(null)

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

  if ((activeProject?.id ?? null) !== saveStatusProjectId) {
    setSaveStatusProjectId(activeProject?.id ?? null)
    setSaveStatus("idle")
  }

  return (
    <ProjectActionsProvider>
      <div className="flex h-dvh flex-col bg-base">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
          activeProjectName={activeProject?.name ?? null}
          isAiSidebarOpen={isAiSidebarOpen}
          onToggleAiSidebar={() => setIsAiSidebarOpen((open) => !open)}
          onShare={() => setIsShareDialogOpen(true)}
          onOpenStarterTemplates={() => setIsTemplatesModalOpen(true)}
          saveStatus={activeProject ? saveStatus : null}
        />
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          activeProjectId={activeProject?.id ?? null}
        />
        <StarterTemplateContext.Provider
          value={{
            pendingTemplate,
            clearPendingTemplate: () => setPendingTemplate(null),
          }}
        >
          <CanvasSaveContext.Provider value={{ setSaveStatus }}>
            <main className="flex-1 overflow-hidden bg-base">{children}</main>
          </CanvasSaveContext.Provider>
        </StarterTemplateContext.Provider>
        {activeProject && (
          <AiSidebar
            isOpen={isAiSidebarOpen}
            onClose={() => setIsAiSidebarOpen(false)}
          />
        )}
      </div>
      <StarterTemplatesModal
        open={isTemplatesModalOpen}
        onOpenChange={setIsTemplatesModalOpen}
        onImport={setPendingTemplate}
      />
      {activeProject && (
        <ShareProjectDialog
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          projectId={activeProject.id}
          projectName={activeProject.name}
          isOwner={activeProject.isOwner}
        />
      )}
    </ProjectActionsProvider>
  )
}

export { EditorShell }
