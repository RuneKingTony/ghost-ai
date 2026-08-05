"use client"

import { createContext, useContext } from "react"

import { CreateProjectDialog } from "@/components/editor/dialogs/create-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/dialogs/delete-project-dialog"
import { RenameProjectDialog } from "@/components/editor/dialogs/rename-project-dialog"
import {
  useProjectActions,
  type UseProjectActionsReturn,
} from "@/hooks/use-project-actions"

const ProjectActionsContext = createContext<UseProjectActionsReturn | null>(
  null
)

function ProjectActionsProvider({ children }: { children: React.ReactNode }) {
  const projectActions = useProjectActions()

  return (
    <ProjectActionsContext.Provider value={projectActions}>
      {children}
      <CreateProjectDialog />
      <RenameProjectDialog />
      <DeleteProjectDialog />
    </ProjectActionsContext.Provider>
  )
}

function useProjectActionsContext() {
  const context = useContext(ProjectActionsContext)
  if (!context) {
    throw new Error(
      "useProjectActionsContext must be used within a ProjectActionsProvider"
    )
  }
  return context
}

export { ProjectActionsProvider, useProjectActionsContext }
