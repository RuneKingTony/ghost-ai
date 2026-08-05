"use client"

import { AppDialog } from "@/components/editor/app-dialog"
import { useProjectActionsContext } from "@/components/editor/project-actions-provider"
import { Button } from "@/components/ui/button"

function DeleteProjectDialog() {
  const { dialog, activeProject, isLoading, error, closeDialog, confirmDelete } =
    useProjectActionsContext()

  const isOpen = dialog === "delete" && activeProject !== null

  return (
    <AppDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) closeDialog()
      }}
      title="Delete Project"
      description={
        activeProject
          ? `This will permanently delete "${activeProject.name}". This action cannot be undone.`
          : undefined
      }
      footer={
        <>
          <Button variant="outline" onClick={closeDialog} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </>
      }
    >
      {error && <p className="text-sm text-error">{error}</p>}
    </AppDialog>
  )
}

export { DeleteProjectDialog }
