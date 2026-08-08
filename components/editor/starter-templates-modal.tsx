"use client"

import { AppDialog } from "@/components/editor/app-dialog"
import { CANVAS_TEMPLATES } from "@/components/editor/starter-templates"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { CanvasNode, NodeShape } from "@/types/canvas"

const PREVIEW_WIDTH = 240
const PREVIEW_HEIGHT = 140
const PREVIEW_PADDING = 16

interface StarterTemplatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (template: CanvasTemplate) => void
  templates?: CanvasTemplate[]
}

function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
  templates = CANVAS_TEMPLATES,
}: StarterTemplatesModalProps) {
  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Starter Templates"
      description="Start from a pre-built diagram instead of an empty canvas."
      contentClassName="sm:max-w-2xl"
    >
      <ScrollArea className="max-h-[60vh]">
        <div className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onImport={() => {
                onImport(template)
                onOpenChange(false)
              }}
            />
          ))}
        </div>
      </ScrollArea>
    </AppDialog>
  )
}

interface TemplateCardProps {
  template: CanvasTemplate
  onImport: () => void
}

function TemplateCard({ template, onImport }: TemplateCardProps) {
  return (
    <Card className="border border-subtle-border bg-elevated">
      <CardHeader>
        <CardTitle className="text-copy-primary">{template.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <TemplatePreview template={template} />
        <p className="text-sm text-copy-muted">{template.description}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onImport}>
          Import
        </Button>
      </CardFooter>
    </Card>
  )
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const bounds = computeTemplateBounds(template.nodes)
  const scale = Math.min(
    (PREVIEW_WIDTH - PREVIEW_PADDING * 2) / bounds.width,
    (PREVIEW_HEIGHT - PREVIEW_PADDING * 2) / bounds.height
  )
  const offsetX = (PREVIEW_WIDTH - bounds.width * scale) / 2
  const offsetY = (PREVIEW_HEIGHT - bounds.height * scale) / 2

  const toPreviewX = (x: number) => (x - bounds.minX) * scale + offsetX
  const toPreviewY = (y: number) => (y - bounds.minY) * scale + offsetY

  const nodeCenter = (node: CanvasNode) => ({
    x: toPreviewX(node.position.x + (node.width ?? 0) / 2),
    y: toPreviewY(node.position.y + (node.height ?? 0) / 2),
  })
  const nodeById = new Map(template.nodes.map((node) => [node.id, node]))

  return (
    <svg
      width={PREVIEW_WIDTH}
      height={PREVIEW_HEIGHT}
      viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
      className="w-full rounded-xl border border-subtle-border bg-base"
    >
      {template.edges.map((edge) => {
        const source = nodeById.get(edge.source)
        const target = nodeById.get(edge.target)
        if (!source || !target) return null

        const from = nodeCenter(source)
        const to = nodeCenter(target)

        return (
          <line
            key={edge.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            className="stroke-subtle-border"
            strokeWidth={1}
          />
        )
      })}
      {template.nodes.map((node) => (
        <PreviewNodeShape
          key={node.id}
          shape={node.data.shape}
          fill={node.data.color}
          x={toPreviewX(node.position.x)}
          y={toPreviewY(node.position.y)}
          width={(node.width ?? 0) * scale}
          height={(node.height ?? 0) * scale}
        />
      ))}
    </svg>
  )
}

function computeTemplateBounds(nodes: CanvasNode[]) {
  const minX = Math.min(...nodes.map((node) => node.position.x))
  const minY = Math.min(...nodes.map((node) => node.position.y))
  const maxX = Math.max(...nodes.map((node) => node.position.x + (node.width ?? 0)))
  const maxY = Math.max(...nodes.map((node) => node.position.y + (node.height ?? 0)))

  return { minX, minY, width: maxX - minX, height: maxY - minY }
}

interface PreviewNodeShapeProps {
  shape: NodeShape
  x: number
  y: number
  width: number
  height: number
  fill: string
}

function PreviewNodeShape({ shape, x, y, width, height, fill }: PreviewNodeShapeProps) {
  const className = "stroke-subtle-border"

  if (shape === "rectangle") {
    return <rect x={x} y={y} width={width} height={height} rx={2} fill={fill} strokeWidth={1} className={className} />
  }

  if (shape === "pill") {
    return <rect x={x} y={y} width={width} height={height} rx={height / 2} fill={fill} strokeWidth={1} className={className} />
  }

  if (shape === "circle") {
    return (
      <ellipse
        cx={x + width / 2}
        cy={y + height / 2}
        rx={width / 2}
        ry={height / 2}
        fill={fill}
        strokeWidth={1}
        className={className}
      />
    )
  }

  if (shape === "diamond") {
    const points = `${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}`
    return <polygon points={points} fill={fill} strokeWidth={1} className={className} />
  }

  if (shape === "hexagon") {
    const indent = width * 0.25
    const points = `${x + indent},${y} ${x + width - indent},${y} ${x + width},${y + height / 2} ${x + width - indent},${y + height} ${x + indent},${y + height} ${x},${y + height / 2}`
    return <polygon points={points} fill={fill} strokeWidth={1} className={className} />
  }

  const ry = Math.min(height * 0.2, (width / 2) * 0.6)
  return (
    <g className={className}>
      <rect x={x} y={y + ry} width={width} height={Math.max(height - ry * 2, 0)} fill={fill} strokeWidth={0} />
      <ellipse cx={x + width / 2} cy={y + ry} rx={width / 2} ry={ry} fill={fill} strokeWidth={1} />
      <ellipse cx={x + width / 2} cy={y + height - ry} rx={width / 2} ry={ry} fill={fill} strokeWidth={0} />
    </g>
  )
}

export { StarterTemplatesModal }
