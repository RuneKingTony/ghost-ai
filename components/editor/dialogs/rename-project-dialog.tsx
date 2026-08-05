"use client"

import { AppDialog } from "@/components/editor/app-dialog"
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function RenameProjectDialog() {
  const {
    dialog,
    activeProject,
    name,
    isLoading,
    setName,
    closeDialog,
    confirmRename,
  } = useProjectDialogsContext()

  const isOpen = dialog === "rename" && activeProject !== null

  return (
    <AppDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) closeDialog()
      }}
      title="Rename Project"
      description={
        activeProject
          ? `Current name: "${activeProject.name}"`
          : undefined
      }
      footer={
        <>
          <Button variant="outline" onClick={closeDialog} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={confirmRename} disabled={!name.trim() || isLoading}>
            {isLoading ? "Renaming..." : "Rename"}
          </Button>
        </>
      }
    >
      <form
        className="flex flex-col gap-1.5"
        onSubmit={(event) => {
          event.preventDefault()
          confirmRename()
        }}
      >
        <label
          htmlFor="project-rename"
          className="text-sm font-medium text-copy-secondary"
        >
          Project name
        </label>
        <Input
          id="project-rename"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
      </form>
    </AppDialog>
  )
}

export { RenameProjectDialog }
