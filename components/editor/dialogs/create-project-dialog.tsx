"use client"

import { AppDialog } from "@/components/editor/app-dialog"
import { useProjectActionsContext } from "@/components/editor/project-actions-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function CreateProjectDialog() {
  const {
    dialog,
    name,
    roomId,
    isLoading,
    error,
    setName,
    closeDialog,
    confirmCreate,
  } = useProjectActionsContext()

  const isOpen = dialog === "create"

  return (
    <AppDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) closeDialog()
      }}
      title="Create Project"
      footer={
        <>
          <Button variant="outline" onClick={closeDialog} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={confirmCreate} disabled={!name.trim() || isLoading}>
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          confirmCreate()
        }}
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="project-name"
            className="text-sm font-medium text-copy-secondary"
          >
            Project name
          </label>
          <Input
            id="project-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="My new project"
            autoFocus
          />
        </div>

        <p className="text-sm text-copy-muted">
          Room ID: <span className="font-mono text-copy-secondary">{roomId || "—"}</span>
        </p>

        {error && <p className="text-sm text-error">{error}</p>}
      </form>
    </AppDialog>
  )
}

export { CreateProjectDialog }
