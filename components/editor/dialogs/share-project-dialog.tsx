"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Copy, X } from "lucide-react"

import { AppDialog } from "@/components/editor/app-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Collaborator } from "@/types/collaborator"

interface ShareProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
  isOwner: boolean
}

function ShareProjectDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  isOwner,
}: ShareProjectDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const activeLoadRef = useRef(0)
  const activeControllerRef = useRef<AbortController | null>(null)
  const shouldRefreshAfterLoadRef = useRef(false)
  const copyTimeoutRef = useRef<number | null>(null)

  const fetchCollaborators = useCallback(
    async (requestId: number, controller: AbortController) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/projects/${projectId}/collaborators`,
          { signal: controller.signal }
        )
        if (!response.ok) throw new Error("Failed to load collaborators")

        const data = (await response.json()) as {
          collaborators: Collaborator[]
        }

        if (requestId !== activeLoadRef.current) return

        setCollaborators(data.collaborators)
      } catch (error) {
        if (requestId !== activeLoadRef.current) return
        if (error instanceof Error && error.name === "AbortError") return
        setError("Couldn't load collaborators.")
      } finally {
        const isActive = requestId === activeLoadRef.current
        if (isActive) {
          setIsLoading(false)
        }
      }
    },
    [projectId]
  )

  const loadCollaborators = useCallback(async () => {
    const controller = new AbortController()
    activeControllerRef.current = controller
    const requestId = ++activeLoadRef.current

    await fetchCollaborators(requestId, controller)

    const shouldRefresh = shouldRefreshAfterLoadRef.current
    if (shouldRefresh && activeControllerRef.current === controller) {
      shouldRefreshAfterLoadRef.current = false
      const nextController = new AbortController()
      activeControllerRef.current = nextController
      const nextRequestId = ++activeLoadRef.current
      await fetchCollaborators(nextRequestId, nextController)
    }

    if (activeControllerRef.current === controller) {
      activeControllerRef.current = null
    }
  }, [fetchCollaborators])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current)
        copyTimeoutRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current)
        copyTimeoutRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!open) return

    activeControllerRef.current?.abort()
    loadCollaborators()

    return () => {
      activeControllerRef.current?.abort()
      activeControllerRef.current = null
    }
  }, [open, projectId, loadCollaborators])

  async function handleInvite() {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return

    setIsInviting(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/projects/${projectId}/collaborators`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail }),
        }
      )

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(
          typeof body?.error === "string" ? body.error : "Failed to invite"
        )
      }

      const { collaborator } = (await response.json()) as {
        collaborator: Collaborator
      }
      setCollaborators((current) => [...current, collaborator])
      setEmail("")

      if (activeControllerRef.current) {
        shouldRefreshAfterLoadRef.current = true
      } else {
        await loadCollaborators()
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't invite that email."
      )
    } finally {
      setIsInviting(false)
    }
  }

  async function handleRemove(collaboratorId: string) {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort()
      activeControllerRef.current = null
      activeLoadRef.current += 1
      setIsLoading(false)
    }

    setRemovingId(collaboratorId)
    setError(null)

    try {
      const response = await fetch(
        `/api/projects/${projectId}/collaborators/${collaboratorId}`,
        { method: "DELETE" }
      )

      if (!response.ok) throw new Error("Failed to remove collaborator")

      setCollaborators((current) =>
        current.filter((collaborator) => collaborator.id !== collaboratorId)
      )
    } catch {
      setError("Couldn't remove that collaborator.")
    } finally {
      setRemovingId(null)
    }
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/editor/${projectId}`

    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)

      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current)
      }

      copyTimeoutRef.current = window.setTimeout(() => {
        setIsCopied(false)
        copyTimeoutRef.current = null
      }, 2000)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message || "Could not copy link."
          : "Could not copy link."
      )
    }
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          setEmail("")
          setError(null)
          setIsCopied(false)
        }
      }}
      title="Share project"
      description={projectName}
      footer={
        <Button variant="outline" onClick={handleCopyLink} className="w-full">
          {isCopied ? (
            <>
              <Check data-icon="inline-start" className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy data-icon="inline-start" className="h-4 w-4" />
              Copy link
            </>
          )}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {isOwner && (
          <form
            className="flex flex-col gap-1.5"
            onSubmit={(event) => {
              event.preventDefault()
              handleInvite()
            }}
          >
            <label
              htmlFor="collaborator-email"
              className="text-sm font-medium text-copy-secondary"
            >
              Invite by email
            </label>
            <div className="flex gap-2">
              <Input
                id="collaborator-email"
                type="email"
                placeholder="teammate@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isInviting}
              />
              <Button type="submit" disabled={!email.trim() || isInviting}>
                {isInviting ? "Inviting..." : "Invite"}
              </Button>
            </div>
          </form>
        )}

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-copy-secondary">
            Collaborators
          </span>

          {isLoading ? (
            <p className="text-sm text-copy-muted">Loading...</p>
          ) : collaborators.length === 0 ? (
            <p className="text-sm text-copy-muted">No collaborators yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {collaborators.map((collaborator) => (
                <li
                  key={collaborator.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-subtle px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {collaborator.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={collaborator.avatarUrl}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-medium text-copy-muted">
                        {collaborator.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm text-copy-primary">
                        {collaborator.name ?? collaborator.email}
                      </span>
                      {collaborator.name && (
                        <span className="truncate text-xs text-copy-muted">
                          {collaborator.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemove(collaborator.id)}
                      disabled={removingId === collaborator.id}
                      aria-label={`Remove ${collaborator.email}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppDialog>
  )
}

export { ShareProjectDialog }
