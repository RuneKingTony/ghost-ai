"use client"

import { useMemo } from "react"
import { Bot, Loader2, X } from "lucide-react"
import { useFeedMessages } from "@liveblocks/react"

import { AiArchitectTab } from "@/components/editor/ai-sidebar/ai-architect-tab"
import { SpecsTab } from "@/components/editor/ai-sidebar/specs-tab"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  AI_STATUS_FEED_ID,
  isAiStatusFeedPayload,
  type AiStatusFeedPayload,
} from "@/types/tasks"

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const TAB_TRIGGER_CLASSES =
  "text-copy-muted data-[state=active]:bg-ai/15 data-[state=active]:text-ai-text"

// The feed hook returns a page of messages, not guaranteed to be sorted —
// pick the true latest by `createdAt` rather than assuming array order, and
// validate before trusting the payload shape (per `code-standards.md`'s
// "validate unknown external input" rule).
function useLatestAiStatus(): AiStatusFeedPayload | null {
  const { messages } = useFeedMessages(AI_STATUS_FEED_ID)

  return useMemo(() => {
    let latest: { createdAt: number; data: AiStatusFeedPayload } | null = null

    for (const message of messages ?? []) {
      if (!isAiStatusFeedPayload(message.data)) continue
      if (!latest || message.createdAt > latest.createdAt) {
        latest = { createdAt: message.createdAt, data: message.data }
      }
    }

    return latest?.data ?? null
  }, [messages])
}

function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const latestStatus = useLatestAiStatus()
  const isGenerating = latestStatus?.status === "thinking"

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
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 shrink-0 text-ai-text" />
            <div className="flex flex-col leading-tight">
              <h2 className="text-sm font-medium text-copy-primary">
                AI Workspace
              </h2>
              <p className="text-xs text-copy-muted">
                Collaborate with Ghost AI
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close AI sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isGenerating && (
          <div className="flex shrink-0 items-center gap-2 border-b border-surface-border bg-ai/10 px-4 py-2 text-xs text-ai-text">
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
            <span className="truncate">
              {latestStatus?.text ?? "Ghost AI is working…"}
            </span>
          </div>
        )}

        <Tabs defaultValue="architect" className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-4 mt-4 w-fit self-start">
            <TabsTrigger value="architect" className={TAB_TRIGGER_CLASSES}>
              AI Architect
            </TabsTrigger>
            <TabsTrigger value="specs" className={TAB_TRIGGER_CLASSES}>
              Specs
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="architect"
            className="flex flex-1 flex-col overflow-hidden"
          >
            <AiArchitectTab isGenerating={isGenerating} />
          </TabsContent>

          <TabsContent
            value="specs"
            className="flex flex-1 flex-col overflow-y-auto"
          >
            <SpecsTab />
          </TabsContent>
        </Tabs>
      </aside>
    </>
  )
}

export { AiSidebar }
