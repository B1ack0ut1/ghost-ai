"use client";

import {
  createContext,
  useContext,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  Handle,
  NodeToolbar,
  NodeResizeControl,
  Position,
  ResizeControlVariant,
  type NodeProps,
} from "@xyflow/react";

import {
  CANVAS_NODE_MINIMUM_SIZE,
  NODE_COLORS,
  type CanvasNode,
  type CanvasNodeColor,
  type CanvasNodeShape,
} from "@/types/canvas";
import { cn } from "@/lib/utils";

interface CanvasNodeActions {
  updateNodeColor: (nodeId: string, color: CanvasNodeColor) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
}

interface CanvasNodeActionsProviderProps {
  children: ReactNode;
  updateNodeColor: CanvasNodeActions["updateNodeColor"];
  updateNodeLabel: CanvasNodeActions["updateNodeLabel"];
}

const CanvasNodeActionsContext = createContext<CanvasNodeActions>({
  updateNodeColor: () => undefined,
  updateNodeLabel: () => undefined,
});

interface SideResizeControl {
  position: Position;
  resizeDirection: "horizontal" | "vertical";
}

const SIDE_RESIZE_CONTROLS: readonly SideResizeControl[] = [
  { position: Position.Top, resizeDirection: "vertical" },
  { position: Position.Right, resizeDirection: "horizontal" },
  { position: Position.Bottom, resizeDirection: "vertical" },
  { position: Position.Left, resizeDirection: "horizontal" },
];

const CONNECTION_HANDLE_POSITIONS = [
  Position.Top,
  Position.Right,
  Position.Bottom,
  Position.Left,
] as const;

export function CanvasNodeActionsProvider({
  children,
  updateNodeColor,
  updateNodeLabel,
}: CanvasNodeActionsProviderProps) {
  return (
    <CanvasNodeActionsContext.Provider
      value={{ updateNodeColor, updateNodeLabel }}
    >
      {children}
    </CanvasNodeActionsContext.Provider>
  );
}

interface CanvasShapeProps {
  children?: ReactNode;
  color: CanvasNodeColor;
  contentClassName?: string;
  selected?: boolean;
  shape: CanvasNodeShape;
}

function ShapeSvg({
  color,
  selected,
  shape,
}: Omit<CanvasShapeProps, "children">) {
  const stroke = selected
    ? "var(--accent-primary)"
    : "var(--border-subtle)";
  const strokeWidth = selected ? 2.5 : 1.25;

  if (shape === "diamond") {
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <polygon
          fill={color}
          points="50,1 99,50 50,99 1,50"
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  }

  if (shape === "hexagon") {
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <polygon
          fill={color}
          points="25,1 75,1 99,50 75,99 25,99 1,50"
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <path
        d="M5 16C5 7 95 7 95 16V84C95 93 5 93 5 84Z"
        fill={color}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <ellipse
        cx="50"
        cy="16"
        fill={color}
        rx="45"
        ry="10"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

export function CanvasShape({
  children,
  color,
  contentClassName,
  selected = false,
  shape,
}: CanvasShapeProps) {
  const borderColor = selected
    ? "var(--accent-primary)"
    : "var(--border-subtle)";
  const isSvgShape =
    shape === "diamond" || shape === "hexagon" || shape === "cylinder";

  return (
    <div className="relative h-full w-full">
      {isSvgShape ? (
        <ShapeSvg color={color} selected={selected} shape={shape} />
      ) : (
        <div
          aria-hidden="true"
          className={
            shape === "rectangle"
              ? "absolute inset-0 rounded-xl border"
              : "absolute inset-0 rounded-full border"
          }
          style={{ backgroundColor: color, borderColor }}
        />
      )}
      {children ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4 text-center text-sm font-medium",
            contentClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function CanvasNodeRenderer({
  data,
  id,
  selected,
}: NodeProps<CanvasNode>) {
  const { updateNodeColor, updateNodeLabel } = useContext(
    CanvasNodeActionsContext,
  );
  const [isEditing, setIsEditing] = useState(false);
  const textColor =
    NODE_COLORS.find((nodeColor) => nodeColor.fill === data.color)?.text ??
    NODE_COLORS[0].text;

  function startEditing(event: MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsEditing(true);
  }

  function handleLabelChange(event: ChangeEvent<HTMLTextAreaElement>) {
    updateNodeLabel(id, event.target.value);
  }

  function handleColorChange(color: CanvasNodeColor) {
    updateNodeColor(id, color);
  }

  function stopEditing() {
    setIsEditing(false);
  }

  function handleLabelKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      stopEditing();
    }
  }

  return (
    <div
      aria-label={data.label || "Untitled node"}
      className="group h-full w-full"
      style={{ color: textColor }}
    >
      <NodeToolbar
        className="nodrag nopan nowheel flex items-center gap-1 rounded-xl border border-surface-border bg-elevated/95 p-1.5 shadow-lg backdrop-blur-xl"
        isVisible={selected}
        nodeId={id}
        offset={14}
        onPointerDown={(event) => event.stopPropagation()}
        position={Position.Top}
      >
        {NODE_COLORS.map((nodeColor) => {
          const isActive = nodeColor.fill === data.color;

          return (
            <button
              aria-label={`Set node color to ${nodeColor.name}`}
              aria-pressed={isActive}
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border transition-[box-shadow,transform] duration-150 hover:scale-110 hover:shadow-[0_0_8px_var(--swatch-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-elevated",
                isActive && "scale-110",
              )}
              key={nodeColor.fill}
              onClick={() => handleColorChange(nodeColor.fill)}
              onPointerDown={(event) => event.stopPropagation()}
              style={{
                "--swatch-text": nodeColor.text,
                backgroundColor: nodeColor.fill,
                borderColor: isActive ? nodeColor.text : "var(--border-subtle)",
                boxShadow: isActive
                  ? `0 0 0 2px var(--bg-elevated), 0 0 0 3px ${nodeColor.text}`
                  : undefined,
              } as CSSProperties & { "--swatch-text": string }}
              title={nodeColor.name}
              type="button"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-opacity",
                  isActive ? "opacity-100" : "opacity-0",
                )}
                style={{ backgroundColor: nodeColor.text }}
              />
            </button>
          );
        })}
      </NodeToolbar>
      <CanvasShape
        color={data.color}
        contentClassName="pointer-events-auto"
        selected={selected}
        shape={data.shape}
      >
        <div
          className={cn(
            "flex h-full w-full items-center justify-center",
            isEditing && "nodrag",
          )}
          onDoubleClick={startEditing}
        >
          {isEditing ? (
            <textarea
              aria-label="Node label"
              autoFocus
              className="nodrag nopan nowheel absolute inset-x-4 top-1/2 h-10 -translate-y-1/2 resize-none bg-transparent px-0 py-2 text-center text-sm font-medium leading-5 outline-none placeholder:text-copy-muted"
              onBlur={stopEditing}
              onChange={handleLabelChange}
              onKeyDown={handleLabelKeyDown}
              onPointerDown={(event) => event.stopPropagation()}
              placeholder="Untitled node"
              value={data.label}
            />
          ) : (
            <span className={data.label ? undefined : "text-copy-muted"}>
              {data.label || "Untitled node"}
            </span>
          )}
        </div>
      </CanvasShape>
      {selected
        ? SIDE_RESIZE_CONTROLS.map(({ position, resizeDirection }) => (
            <NodeResizeControl
              key={position}
              minHeight={CANVAS_NODE_MINIMUM_SIZE.height}
              minWidth={CANVAS_NODE_MINIMUM_SIZE.width}
              position={position}
              resizeDirection={resizeDirection}
              style={{
                borderColor: "var(--accent-primary)",
                zIndex: 20,
              }}
              variant={ResizeControlVariant.Line}
            />
          ))
        : null}
      {CONNECTION_HANDLE_POSITIONS.map((position) => (
        <Handle
          aria-label={`Connect from node ${position} side`}
          className="opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          id={`connect-${position}`}
          key={position}
          position={position}
          style={{
            backgroundColor: "var(--text-primary)",
            borderColor: "var(--bg-elevated)",
            borderWidth: 2,
            height: 10,
            width: 10,
            zIndex: 30,
          }}
          type="source"
        />
      ))}
    </div>
  );
}
