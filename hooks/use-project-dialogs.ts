"use client"

import { useCallback, useMemo, useState } from "react"

import { MOCK_PROJECTS } from "@/lib/mock-projects"
import { slugify } from "@/lib/slug"
import type { Project } from "@/types/project"

type ProjectDialogType = "create" | "rename" | "delete" | null

const MOCK_ACTION_DELAY_MS = 500

function useProjectDialogs() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
  const [dialog, setDialog] = useState<ProjectDialogType>(null)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const slug = useMemo(() => slugify(name), [name])

  const openCreateDialog = useCallback(() => {
    setActiveProject(null)
    setName("")
    setDialog("create")
  }, [])

  const openRenameDialog = useCallback((project: Project) => {
    setActiveProject(project)
    setName(project.name)
    setDialog("rename")
  }, [])

  const openDeleteDialog = useCallback((project: Project) => {
    setActiveProject(project)
    setDialog("delete")
  }, [])

  const closeDialog = useCallback(() => {
    setDialog(null)
    setActiveProject(null)
    setName("")
  }, [])

  const confirmCreate = useCallback(() => {
    const trimmedName = name.trim()
    if (!trimmedName) return

    const newSlug = slugify(trimmedName)
    if (!newSlug) return

    setIsLoading(true)
    setTimeout(() => {
      const newProject: Project = {
        id: crypto.randomUUID(),
        name: trimmedName,
        slug: newSlug,
        isOwner: true,
      }
      setProjects((prev) => [...prev, newProject])
      setIsLoading(false)
      setDialog(null)
      setActiveProject(null)
      setName("")
    }, MOCK_ACTION_DELAY_MS)
  }, [name])

  const confirmRename = useCallback(() => {
    const trimmedName = name.trim()
    if (!trimmedName || !activeProject) return

    const newSlug = slugify(trimmedName)
    if (!newSlug) return

    setIsLoading(true)
    setTimeout(() => {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === activeProject.id
            ? { ...project, name: trimmedName, slug: newSlug }
            : project
        )
      )
      setIsLoading(false)
      setDialog(null)
      setActiveProject(null)
      setName("")
    }, MOCK_ACTION_DELAY_MS)
  }, [name, activeProject])

  const confirmDelete = useCallback(() => {
    if (!activeProject) return

    setIsLoading(true)
    setTimeout(() => {
      setProjects((prev) =>
        prev.filter((project) => project.id !== activeProject.id)
      )
      setIsLoading(false)
      setDialog(null)
      setActiveProject(null)
    }, MOCK_ACTION_DELAY_MS)
  }, [activeProject])

  return {
    projects,
    dialog,
    activeProject,
    name,
    slug,
    isLoading,
    setName,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    confirmCreate,
    confirmRename,
    confirmDelete,
  }
}

type UseProjectDialogsReturn = ReturnType<typeof useProjectDialogs>

export { useProjectDialogs }
export type { UseProjectDialogsReturn }
