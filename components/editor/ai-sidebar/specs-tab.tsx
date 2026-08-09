"use client"

import { Download, FileText, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

function SpecsTab() {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      <Button className="w-full bg-ai text-white hover:bg-ai/90">
        <Sparkles data-icon="inline-start" className="h-4 w-4" />
        Generate Spec
      </Button>

      <div className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-elevated p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-subtle">
            <FileText className="h-4 w-4 text-ai-text" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium text-copy-primary">
              E-commerce Backend Architecture
            </h3>
            <p className="text-xs text-copy-muted">
              REST API gateway, PostgreSQL primary store, Redis cache layer,
              and an async worker queue for order processing.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" disabled className="w-full">
          <Download data-icon="inline-start" className="h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  )
}

export { SpecsTab }
