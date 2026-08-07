import { cn } from "@/lib/utils"
import type { NodeShape } from "@/types/canvas"

const STROKE_WIDTH = 1.5

interface NodeShapeVisualProps {
  shape: NodeShape
  width: number
  height: number
  fill: string
  selected?: boolean
}

function diamondPoints(width: number, height: number, p: number) {
  return `${width / 2},${p} ${width - p},${height / 2} ${width / 2},${height - p} ${p},${height / 2}`
}

function hexagonPoints(width: number, height: number, p: number) {
  const indent = width * 0.25
  return `${indent},${p} ${width - indent},${p} ${width - p},${height / 2} ${width - indent},${height - p} ${indent},${height - p} ${p},${height / 2}`
}

interface CylinderGeometryProps {
  width: number
  height: number
  padding: number
  fill: string
}

function CylinderShape({ width, height, padding, fill }: CylinderGeometryProps) {
  const rx = (width - padding * 2) / 2
  const ry = Math.min((height - padding * 2) * 0.2, rx * 0.6)
  const left = padding
  const right = width - padding
  const top = padding + ry
  const bottom = height - padding - ry
  const body = `M ${left} ${top} A ${rx} ${ry} 0 0 1 ${right} ${top} L ${right} ${bottom} A ${rx} ${ry} 0 0 1 ${left} ${bottom} Z`

  return (
    <>
      <path d={body} fill={fill} strokeWidth={STROKE_WIDTH} />
      <ellipse cx={width / 2} cy={top} rx={rx} ry={ry} fill={fill} strokeWidth={STROKE_WIDTH} />
    </>
  )
}

function NodeShapeVisual({ shape, width, height, fill, selected = false }: NodeShapeVisualProps) {
  if (shape === "rectangle" || shape === "pill" || shape === "circle") {
    const borderClass = selected ? "border-brand" : "border-subtle-border"
    const radiusClass = shape === "rectangle" ? "rounded-xl" : "rounded-full"

    return (
      <div
        className={cn("h-full w-full border", borderClass, radiusClass)}
        style={{ backgroundColor: fill }}
      />
    )
  }

  const strokeClass = selected ? "stroke-brand" : "stroke-subtle-border"
  const padding = STROKE_WIDTH

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={strokeClass}
    >
      {shape === "diamond" && (
        <polygon points={diamondPoints(width, height, padding)} fill={fill} strokeWidth={STROKE_WIDTH} />
      )}
      {shape === "hexagon" && (
        <polygon points={hexagonPoints(width, height, padding)} fill={fill} strokeWidth={STROKE_WIDTH} />
      )}
      {shape === "cylinder" && (
        <CylinderShape width={width} height={height} padding={padding} fill={fill} />
      )}
    </svg>
  )
}

export { NodeShapeVisual }
