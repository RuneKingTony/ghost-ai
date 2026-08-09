"use client"

import { Bot, X } from "lucide-react"

import { AiArchitectTab } from "@/components/editor/ai-sidebar/ai-architect-tab"
import { SpecsTab } from "@/components/editor/ai-sidebar/specs-tab"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const TAB_TRIGGER_CLASSES =
  "text-copy-muted data-[state=active]:bg-ai/15 data-[state=active]:text-ai-text"

function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
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
            <AiArchitectTab />
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
