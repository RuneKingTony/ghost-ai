"use client"

import { Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AiSidebarPlaceholderProps {
  isOpen: boolean
  onClose: () => void
}

function AiSidebarPlaceholder({ isOpen, onClose }: AiSidebarPlaceholderProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        inert={!isOpen}
        aria-hidden={!isOpen}
        className={cn(
          "fixed top-14 right-0 bottom-0 z-40 flex w-80 translate-x-full flex-col border-l border-surface-border bg-elevated/95 backdrop-blur-xl transition-transform duration-200 ease-out",
          isOpen && "translate-x-0"
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-surface-border px-4">
          <h2 className="flex items-center gap-1.5 text-sm font-medium text-copy-primary">
            <Sparkles className="h-4 w-4 text-ai-text" />
            AI Chat
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close AI sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-copy-muted">
          AI chat coming soon.
        </div>
      </aside>
    </>
  )
}

export { AiSidebarPlaceholder }
