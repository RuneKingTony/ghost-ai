Add resizing, inline label editing, and connection handles to canvas nodes.

## Implementation

1. Add resizing.
   - selected nodes should show resize handles
   - prevent nodes from being resized below a minimum size
   - keep resize handles subtle and consistent with the dark canvas UI

2. Add inline label editing.
   - keep the node label centered inside the node
   - double-click the center/label area of a node to edit its label
   - show placeholder text in the same centered position when the label is empty
   - keep editing smooth without causing layout shifts
   - show a textarea directly over the label while editing
   - update the label as users type
   - close editing on blur or `Escape`
   - prevent text editing interactions from dragging or panning the canvas

3. Add connection handles.
   - small white circular handles
   - hidden by default, revealed on node hover
   - appear at all four sides of a node (top, right, bottom, left)
   - each side acts as both a source and a target, matching the canvas's loose connection mode
   - style new edges per the canvas design: smooth-step path, arrow marker at the end, default edge color `#f8fafc`, thin stroke so edges stay visually secondary to nodes

4. Keep all node and edge updates connected to the existing collaborative canvas state.

## Scope Limits

- don't change shape rendering from the previous unit
- don't change the shape panel or drag preview
- don't change how dropped nodes are created
- don't add edge labels, edge selection styling, or edge deletion UI beyond what already exists
- keep this focused on resize, label editing, and connection handles only

## Check When Done

- Selected nodes show resize handles.
- Resizing updates node dimensions through the existing node state flow.
- Double-clicking a node opens inline label editing.
- Label editing updates node labels through the existing sync flow.
- Editing closes on blur or Escape.
- Text interactions do not trigger canvas drag or pan.
- Hovering a node reveals its four connection handles; they're hidden otherwise.
- Dragging from a handle to another node's handle creates an edge.
- New edges render as a smooth-step path with an arrow marker and the specified color.
- Edge creation updates canvas state through the existing sync flow.
- `npm run build` passes without type errors.