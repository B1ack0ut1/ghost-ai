Add a bottom shape panel so users can drag shapes onto the canvas and create new nodes.

## Implementation

1. Add a floating pill-shaped toolbar at the bottom-center of the canvas.

2. Add draggable icon buttons for these shapes:
   - rectangle
   - diamond
   - circle
   - pill
   - cylinder
   - hexagon

3. When dragging a shape, keep the shape name and default size in the active pointer-drag state.

   Use sensible default sizes:
   - rectangles should be wider than tall
   - circles should be square
   - diamonds should be slightly larger so labels have room

4. Render a pointer-following shape preview with a small green plus badge at the mouse cursor. Do not use native HTML drag-and-drop for these shape-panel controls.

5. On pointer release over the canvas:
   - read the active shape-drag state
   - convert the screen position to canvas coordinates using React Flow
   - create a new node at that position
   - use an empty label
   - use the default node color
   - use the dragged shape value

6. Generate each node ID using the shape name, timestamp, and a counter.

7. Add a basic renderer for the custom canvas node type so new nodes are visible.

   For this unit, render every shape as a simple bordered rectangle with the label centered. Shape-specific visuals will be added later.

## Check When Done

- Active shape-drag state includes the correct shape and size data.
- Pointer-release logic creates new canvas nodes with the expected shape data.
- New nodes use the custom canvas node type.
- `npm run build` passes without type errors.
