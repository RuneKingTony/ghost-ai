"use client"

import { UserButton } from "@clerk/nextjs"
import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  activeProjectName?: string | null
  isAiSidebarOpen?: boolean
  onToggleAiSidebar?: () => void
  onShare?: () => void
}

function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  activeProjectName,
  isAiSidebarOpen,
  onToggleAiSidebar,
  onShare,
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
