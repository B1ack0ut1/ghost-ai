"use client";

import { useRef, useState, type DragEvent } from "react";
import {
  Circle,
  Database,
  Diamond,
  Hexagon,
  Pill,
  Square,
  type LucideIcon,
} from "lucide-react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useErrorListener,
} from "@liveblocks/react/suspense";

import { CanvasNodeRenderer } from "@/components/editor/canvas-node";
import {
  CANVAS_NODE_TYPE,
  CANVAS_SHAPE_DRAG_MIME_TYPE,
  NODE_COLORS,
  NODE_SHAPE_DEFAULT_SIZES,
  NODE_SHAPES,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeShape,
  type CanvasShapeDragPayload,
} from "@/types/canvas";

interface CollaborativeCanvasProps {
  roomId: string;
}

interface LiveblocksConnectionErrorListenerProps {
  onConnectionError: () => void;
}

interface ShapeToolbarItem {
  icon: LucideIcon;
  shape: CanvasNodeShape;
}

const SHAPE_TOOLBAR_ITEMS: readonly ShapeToolbarItem[] = [
  { shape: "rectangle", icon: Square },
  { shape: "diamond", icon: Diamond },
  { shape: "circle", icon: Circle },
  { shape: "pill", icon: Pill },
  { shape: "cylinder", icon: Database },
  { shape: "hexagon", icon: Hexagon },
];

const canvasNodeTypes = {
  [CANVAS_NODE_TYPE]: CanvasNodeRenderer,
};

function isCanvasNodeShape(value: unknown): value is CanvasNodeShape {
  return typeof value === "string" && NODE_SHAPES.includes(value as CanvasNodeShape);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseShapeDragPayload(value: string): CanvasShapeDragPayload | null {
  try {
    const payload: unknown = JSON.parse(value);

    if (
      !isRecord(payload) ||
      !isCanvasNodeShape(payload.shape) ||
      !isRecord(payload.size) ||
      typeof payload.size.width !== "number" ||
      typeof payload.size.height !== "number" ||
      payload.size.width <= 0 ||
      payload.size.height <= 0
    ) {
      return null;
    }

    return {
      shape: payload.shape,
      size: { width: payload.size.width, height: payload.size.height },
    };
  } catch {
    return null;
  }
}

function ShapePanel() {
  function handleDragStart(
    event: DragEvent<HTMLButtonElement>,
    shape: CanvasNodeShape,
  ) {
    const payload: CanvasShapeDragPayload = {
      shape,
      size: NODE_SHAPE_DEFAULT_SIZES[shape],
    };

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      CANVAS_SHAPE_DRAG_MIME_TYPE,
      JSON.stringify(payload),
    );
  }

  return (
    <div
      aria-label="Canvas shapes"
      className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-surface-border bg-elevated/95 p-1.5 shadow-2xl backdrop-blur-xl"
      role="toolbar"
    >
      {SHAPE_TOOLBAR_ITEMS.map(({ icon: Icon, shape }) => (
        <button
          aria-label={`Drag ${shape} onto canvas`}
          className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-subtle hover:text-brand active:cursor-grabbing"
          draggable
          key={shape}
          onDragStart={(event) => handleDragStart(event, shape)}
          title={`Drag ${shape} onto canvas`}
          type="button"
        >
          <Icon aria-hidden="true" className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

function CanvasLoadingState() {
  return (
    <div className="flex h-full items-center justify-center bg-base" role="status">
      <p className="text-sm text-copy-muted">Loading collaborative canvas…</p>
    </div>
  );
}

function CanvasConnectionErrorState() {
  return (
    <div className="flex h-full items-center justify-center bg-base px-6 text-center">
      <div className="max-w-sm">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-error">
          Connection unavailable
        </p>
        <p className="mt-3 text-sm leading-6 text-copy-secondary">
          We couldn’t connect to the collaborative canvas. Refresh the page to
          try again.
        </p>
      </div>
    </div>
  );
}

function LiveblocksConnectionErrorListener({
  onConnectionError,
}: LiveblocksConnectionErrorListenerProps) {
  useErrorListener((error) => {
    if (error.context.type === "ROOM_CONNECTION_ERROR") {
      onConnectionError();
    }
  });

  return null;
}

function CollaborativeFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });
  const nodeCounter = useRef(0);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null);

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    if (!event.dataTransfer.types.includes(CANVAS_SHAPE_DRAG_MIME_TYPE)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const payload = parseShapeDragPayload(
      event.dataTransfer.getData(CANVAS_SHAPE_DRAG_MIME_TYPE),
    );

    if (!payload || !reactFlowInstance) {
      return;
    }

    nodeCounter.current += 1;
    onNodesChange([
      {
        type: "add",
        item: {
          id: `${payload.shape}-${Date.now()}-${nodeCounter.current}`,
          type: CANVAS_NODE_TYPE,
          position: reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          }),
          data: {
            label: "",
            color: NODE_COLORS[0].fill,
            shape: payload.shape,
          },
          style: payload.size,
        },
      },
    ]);
  }

  return (
    <div
      className="relative h-full w-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow<CanvasNode, CanvasEdge>
        className="bg-base"
        colorMode="dark"
        connectionMode={ConnectionMode.Loose}
        edges={edges}
        fitView
        nodeTypes={canvasNodeTypes}
        nodes={nodes}
        onConnect={onConnect}
        onDelete={onDelete}
        onEdgesChange={onEdgesChange}
        onInit={setReactFlowInstance}
        onNodesChange={onNodesChange}
      >
        <MiniMap
          ariaLabel="Canvas overview"
          bgColor="var(--bg-elevated)"
          maskColor="var(--accent-primary-dim)"
          nodeColor="var(--bg-subtle)"
          nodeStrokeColor="var(--border-subtle)"
        />
        <Background
          color="var(--border-subtle)"
          gap={20}
          size={1}
          variant={BackgroundVariant.Dots}
        />
      </ReactFlow>
      <ShapePanel />
    </div>
  );
}

export function CollaborativeCanvas({ roomId }: CollaborativeCanvasProps) {
  const [hasConnectionError, setHasConnectionError] = useState(false);

  return (
    <div className="h-full min-h-0 w-full">
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{ cursor: null, isThinking: false }}
        >
          <LiveblocksConnectionErrorListener
            onConnectionError={() => setHasConnectionError(true)}
          />
          {hasConnectionError ? (
            <CanvasConnectionErrorState />
          ) : (
            <ClientSideSuspense fallback={<CanvasLoadingState />}>
              {() => <CollaborativeFlow />}
            </ClientSideSuspense>
          )}
        </RoomProvider>
      </LiveblocksProvider>
    </div>
  );
}
