"use client"

import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface AppDialogProps extends React.ComponentProps<typeof Dialog> {
  title: string
  description?: string
  footer?: React.ReactNode
  contentClassName?: string
  children?: React.ReactNode
}

function AppDialog({
  title,
  description,
  footer,
  contentClassName,
  children,
  ...props
}: AppDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent
        className={cn(
          "rounded-3xl border border-surface-border bg-elevated text-copy-primary",
          contentClassName
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-copy-primary">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-copy-muted">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children}

        {footer && (
          <DialogFooter className="rounded-b-3xl border-surface-border bg-transparent">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { AppDialog }
