"use client";

import {
  createContext,
  useContext,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";

import type { CanvasEdge } from "@/types/canvas";

interface CanvasEdgeActions {
  updateEdgeLabel: (edgeId: string, label: string) => void;
}

interface CanvasEdgeActionsProviderProps {
  children: ReactNode;
  updateEdgeLabel: CanvasEdgeActions["updateEdgeLabel"];
}

const CanvasEdgeActionsContext = createContext<CanvasEdgeActions>({
  updateEdgeLabel: () => undefined,
});

export function CanvasEdgeActionsProvider({
  children,
  updateEdgeLabel,
}: CanvasEdgeActionsProviderProps) {
  return (
    <CanvasEdgeActionsContext.Provider value={{ updateEdgeLabel }}>
      {children}
    </CanvasEdgeActionsContext.Provider>
  );
}

export function CanvasEdgeRenderer({
  data,
  id,
  markerEnd,
  selected,
  sourcePosition,
  sourceX,
  sourceY,
  style,
  targetPosition,
  targetX,
  targetY,
}: EdgeProps<CanvasEdge>) {
  const { updateEdgeLabel } = useContext(CanvasEdgeActionsContext);
  const edgeLabel = data?.label ?? "";
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [draftLabel, setDraftLabel] = useState(edgeLabel);
  const isActive = isEditing || isHovered || selected;
  const label = edgeLabel.trim();
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourcePosition,
    sourceX,
    sourceY,
    targetPosition,
    targetX,
    targetY,
  });

  function startEditing() {
    setDraftLabel(edgeLabel);
    setIsEditing(true);
  }

  function saveLabel() {
    updateEdgeLabel(id, draftLabel);
    setIsEditing(false);
  }

  function handleLabelKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      saveLabel();
    }
  }

  function handleLabelChange(event: ChangeEvent<HTMLInputElement>) {
    setDraftLabel(event.target.value);
  }

  const labelStyle = {
    pointerEvents: "all",
    transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
  } as CSSProperties;

  return (
    <>
      <BaseEdge
        id={id}
        interactionWidth={0}
        markerEnd={markerEnd}
        path={edgePath}
        style={{
          ...style,
          opacity: isActive ? 1 : 0.58,
          strokeWidth: isActive ? 1.75 : 1.5,
          transition: "opacity 150ms ease, stroke-width 150ms ease",
        }}
      />
      <path
        className="react-flow__edge-interaction"
        d={edgePath}
        fill="none"
        onDoubleClick={startEditing}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        stroke="var(--text-primary)"
        strokeOpacity={0}
        strokeWidth={20}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan nowheel absolute"
          onDoubleClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            startEditing();
          }}
          onPointerDown={(event) => event.stopPropagation()}
          style={labelStyle}
        >
          {isEditing ? (
            <input
              aria-label="Edge label"
              autoFocus
              className="nodrag nopan nowheel rounded-xl border border-surface-border bg-elevated px-2 py-1 text-center text-xs text-copy-primary outline-none transition-colors focus:border-brand"
              onBlur={saveLabel}
              onChange={handleLabelChange}
              onKeyDown={handleLabelKeyDown}
              onPointerDown={(event) => event.stopPropagation()}
              size={Math.max(8, draftLabel.length + 1)}
              value={draftLabel}
            />
          ) : label ? (
            <span className="rounded-xl border border-surface-border bg-elevated px-2 py-1 text-xs text-copy-secondary shadow-sm">
              {label}
            </span>
          ) : isActive ? (
            <span className="rounded-xl border border-dashed border-surface-border bg-elevated/90 px-2 py-1 text-xs text-copy-faint">
              Double-click to label
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
