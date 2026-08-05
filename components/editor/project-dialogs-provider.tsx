"use client"

import { createContext, useContext } from "react"

import { CreateProjectDialog } from "@/components/editor/dialogs/create-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/dialogs/delete-project-dialog"
import { RenameProjectDialog } from "@/components/editor/dialogs/rename-project-dialog"
import {
  useProjectDialogs,
  type UseProjectDialogsReturn,
} from "@/hooks/use-project-dialogs"

const ProjectDialogsContext = createContext<UseProjectDialogsReturn | null>(
  null
)

function ProjectDialogsProvider({ children }: { children: React.ReactNode }) {
  const projectDialogs = useProjectDialogs()

  return (
    <ProjectDialogsContext.Provider value={projectDialogs}>
      {children}
      <CreateProjectDialog />
      <RenameProjectDialog />
      <DeleteProjectDialog />
    </ProjectDialogsContext.Provider>
  )
}

function useProjectDialogsContext() {
  const context = useContext(ProjectDialogsContext)
  if (!context) {
    throw new Error(
      "useProjectDialogsContext must be used within a ProjectDialogsProvider"
    )
  }
  return context
}

export { ProjectDialogsProvider, useProjectDialogsContext }
