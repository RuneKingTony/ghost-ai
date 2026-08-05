"use client"

import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
    inert={!isOpen}
      aria-hidden={!isOpen}
      className={cn(
        "fixed top-14 bottom-0 left-0 z-40 flex w-80 -translate-x-full flex-col border-r border-surface-border bg-elevated/95 backdrop-blur-xl transition-transform duration-200 ease-out",
        isOpen && "translate-x-0"
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-surface-border px-4">
        <h2 className="text-sm font-medium text-copy-primary">Projects</h2>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs
        defaultValue="my-projects"
        className="flex flex-1 flex-col overflow-hidden px-4 pt-4"
      >
        <TabsList className="w-full">
          <TabsTrigger value="my-projects" className="flex-1">
            My Projects
          </TabsTrigger>
          <TabsTrigger value="shared" className="flex-1">
            Shared
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="my-projects"
          className="flex flex-1 items-center justify-center text-center text-sm text-copy-muted"
        >
          No projects yet.
        </TabsContent>

        <TabsContent
          value="shared"
          className="flex flex-1 items-center justify-center text-center text-sm text-copy-muted"
        >
          No shared projects yet.
        </TabsContent>
      </Tabs>

      <div className="shrink-0 border-t border-surface-border p-4">
        <Button size="lg" className="w-full">
          <Plus data-icon="inline-start" className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  )
}

export { ProjectSidebar }
