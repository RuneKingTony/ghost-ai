"use client"

import { UserButton } from "@clerk/nextjs"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

function EditorNavbar({ isSidebarOpen, onToggleSidebar }: EditorNavbarProps) {
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

      <div className="flex flex-1 items-center justify-center" />

      <div className="flex flex-1 items-center justify-end gap-2">
        <UserButton />
      </div>
    </nav>
  )
}

export { EditorNavbar }
