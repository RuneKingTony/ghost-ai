"use client"

import { UserButton } from "@clerk/nextjs"
import {
  AlertCircle,
  Check,
  LayoutTemplate,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import type { SaveStatus } from "@/hooks/use-canvas-autosave"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  activeProjectName?: string | null
  isAiSidebarOpen?: boolean
  onToggleAiSidebar?: () => void
  onShare?: () => void
  onOpenStarterTemplates?: () => void
  saveStatus?: SaveStatus | null
}

const SAVE_STATUS_CONFIG = {
  saving: { icon: Loader2, label: "Saving…", className: "text-copy-muted" },
  saved: { icon: Check, label: "Saved", className: "text-success" },
  error: { icon: AlertCircle, label: "Save failed", className: "text-error" },
} as const

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null

  const { icon: Icon, label, className } = SAVE_STATUS_CONFIG[status]

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled
      className={`gap-1.5 disabled:opacity-100 ${className}`}
    >
      <Icon className={`h-4 w-4 ${status === "saving" ? "animate-spin" : ""}`} />
      {label}
    </Button>
  )
}

function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  activeProjectName,
  isAiSidebarOpen,
  onToggleAiSidebar,
  onShare,
  onOpenStarterTemplates,
  saveStatus,
}: EditorNavbarProps) {
  return (
    <nav className="flex h-14 w-full shrink-0 items-center justify-between border-b border-surface-border bg-surface px-4">
      <div className="flex flex-1 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden">
        {activeProjectName && (
          <span className="truncate text-sm font-medium text-copy-primary">
            {activeProjectName}
          </span>
        )}
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        {activeProjectName && (
          <>
            {saveStatus && <SaveStatusIndicator status={saveStatus} />}
            <Button variant="ghost" size="sm" onClick={onOpenStarterTemplates}>
              <LayoutTemplate data-icon="inline-start" className="h-4 w-4" />
              Templates
            </Button>
            <Button variant="ghost" size="sm" onClick={onShare}>
              <Share2 data-icon="inline-start" className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleAiSidebar}
              aria-pressed={isAiSidebarOpen}
              aria-label={
                isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"
              }
            >
              <Sparkles className="h-5 w-5" />
            </Button>
          </>
        )}
        <UserButton />
      </div>
    </nav>
  )
}

export { EditorNavbar }
