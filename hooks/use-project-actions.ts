"use client"

import { useCallback, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { generateRoomSuffix } from "@/lib/room-id"
import { slugify } from "@/lib/slug"
import type { Project } from "@/types/project"

type ProjectDialogType = "create" | "rename" | "delete" | null

function useProjectActions() {
  const router = useRouter()
  const pathname = usePathname()

  const [dialog, setDialog] = useState<ProjectDialogType>(null)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [name, setName] = useState("")
  const [roomSuffix, setRoomSuffix] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const roomId = useMemo(() => {
    const slug = slugify(name)
    return slug ? `${slug}-${roomSuffix}` : ""
  }, [name, roomSuffix])

  const openCreateDialog = useCallback(() => {
    setActiveProject(null)
    setName("")
    setRoomSuffix(generateRoomSuffix())
    setError(null)
    setDialog("create")
  }, [])

  const openRenameDialog = useCallback((project: Project) => {
    setActiveProject(project)
    setName(project.name)
    setError(null)
    setDialog("rename")
  }, [])

  const openDeleteDialog = useCallback((project: Project) => {
    setActiveProject(project)
    setError(null)
    setDialog("delete")
  }, [])

  const closeDialog = useCallback(() => {
    setDialog(null)
    setActiveProject(null)
    setName("")
    setError(null)
  }, [])

  const confirmCreate = useCallback(async () => {
    const trimmedName = name.trim()
    if (!trimmedName) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      })

      if (!response.ok) {
        throw new Error("Failed to create project")
      }

      const { project } = (await response.json()) as { project: Project }

      setDialog(null)
      setActiveProject(null)
      setName("")
      router.push(`/editor/${project.id}`)
    } catch {
      setError("Couldn't create the project. Try again.")
    } finally {
      setIsLoading(false)
    }
  }, [name, router])

  const confirmRename = useCallback(async () => {
    const trimmedName = name.trim()
    if (!trimmedName || !activeProject) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${activeProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      })

      if (!response.ok) {
        throw new Error("Failed to rename project")
      }

      setDialog(null)
      setActiveProject(null)
      setName("")
      router.refresh()
    } catch {
      setError("Couldn't rename the project. Try again.")
    } finally {
      setIsLoading(false)
    }
  }, [name, activeProject, router])

  const confirmDelete = useCallback(async () => {
    if (!activeProject) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${activeProject.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete project")
      }

      const wasActiveWorkspace = pathname === `/editor/${activeProject.id}`

      setDialog(null)
      setActiveProject(null)

      if (wasActiveWorkspace) {
        router.push("/editor")
      } else {
        router.refresh()
      }
    } catch {
      setError("Couldn't delete the project. Try again.")
    } finally {
      setIsLoading(false)
    }
  }, [activeProject, pathname, router])

  return {
    dialog,
    activeProject,
    name,
    roomId,
    isLoading,
    error,
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

type UseProjectActionsReturn = ReturnType<typeof useProjectActions>

export { useProjectActions }
export type { UseProjectActionsReturn }
