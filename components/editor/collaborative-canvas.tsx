"use client";

import { useRef, useState, type PointerEvent } from "react";
import {
  Circle,
  Database,
  Diamond,
  Hexagon,
  Pill,
  Plus,
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
  NODE_COLORS,
  NODE_SHAPE_DEFAULT_SIZES,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeShape,
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

interface ShapeDragState {
  pointerOffset: { x: number; y: number };
  pointerId: number;
  position: { x: number; y: number };
  shape: CanvasNodeShape;
}

interface ShapePanelProps {
  onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerDown: (
    event: PointerEvent<HTMLButtonElement>,
    shape: CanvasNodeShape,
  ) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLButtonElement>) => void;
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

function ShapePanel({
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: ShapePanelProps) {
  return (
    <div
      aria-label="Canvas shapes"
      className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-surface-border bg-elevated/95 p-1.5 shadow-2xl backdrop-blur-xl"
      role="toolbar"
    >
      {SHAPE_TOOLBAR_ITEMS.map(({ icon: Icon, shape }) => (
        <button
          aria-label={`Drag ${shape} onto canvas`}
          className="flex h-9 w-9 touch-none cursor-grab items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-subtle hover:text-brand active:cursor-grabbing"
          key={shape}
          onPointerCancel={onPointerCancel}
          onPointerDown={(event) => onPointerDown(event, shape)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          title={`Drag ${shape} onto canvas`}
          type="button"
        >
          <Icon aria-hidden="true" className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

function ShapeDragOverlay({
  pointerOffset,
  position,
  shape,
}: Omit<ShapeDragState, "pointerId">) {
  const Icon = SHAPE_TOOLBAR_ITEMS.find((item) => item.shape === shape)?.icon;

  if (!Icon) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-50"
      style={{
        left: position.x - pointerOffset.x,
        top: position.y - pointerOffset.y,
      }}
    >
      <div className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-surface-border bg-elevated shadow-lg">
        <Icon className="h-4 w-4 text-copy-secondary" />
      </div>
      <div
        className="absolute left-6 top-6 flex h-4 w-4 items-center justify-center rounded-full border-2 border-elevated bg-success text-base shadow-sm"
      >
        <Plus className="h-2.5 w-2.5 stroke-[3]" />
      </div>
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
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const shapeDragRef = useRef<ShapeDragState | null>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null);
  const [shapeDrag, setShapeDrag] = useState<ShapeDragState | null>(null);

  function updateShapeDrag(nextShapeDrag: ShapeDragState | null) {
    shapeDragRef.current = nextShapeDrag;
    setShapeDrag(nextShapeDrag);
  }

  function createShapeNode(shape: CanvasNodeShape, screenPosition: { x: number; y: number }) {
    if (!reactFlowInstance) {
      return;
    }

    nodeCounter.current += 1;
    onNodesChange([
      {
        type: "add",
        item: {
          id: `${shape}-${Date.now()}-${nodeCounter.current}`,
          type: CANVAS_NODE_TYPE,
          position: reactFlowInstance.screenToFlowPosition(screenPosition),
          data: {
            label: "",
            color: NODE_COLORS[0].fill,
            shape,
          },
          style: NODE_SHAPE_DEFAULT_SIZES[shape],
        },
      },
    ]);
  }

  function handleShapePointerDown(
    event: PointerEvent<HTMLButtonElement>,
    shape: CanvasNodeShape,
  ) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const buttonBounds = event.currentTarget.getBoundingClientRect();
    updateShapeDrag({
      pointerOffset: {
        x: event.clientX - buttonBounds.left,
        y: event.clientY - buttonBounds.top,
      },
      pointerId: event.pointerId,
      position: { x: event.clientX, y: event.clientY },
      shape,
    });
  }

  function handleShapePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const activeShapeDrag = shapeDragRef.current;

    if (!activeShapeDrag || activeShapeDrag.pointerId !== event.pointerId) {
      return;
    }

    updateShapeDrag({
      ...activeShapeDrag,
      position: { x: event.clientX, y: event.clientY },
    });
  }

  function handleShapePointerUp(event: PointerEvent<HTMLButtonElement>) {
    const activeShapeDrag = shapeDragRef.current;

    if (!activeShapeDrag || activeShapeDrag.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    updateShapeDrag(null);

    const canvasBounds = canvasWrapperRef.current?.getBoundingClientRect();
    const isOverCanvas =
      canvasBounds &&
      event.clientX >= canvasBounds.left &&
      event.clientX <= canvasBounds.right &&
      event.clientY >= canvasBounds.top &&
      event.clientY <= canvasBounds.bottom;

    if (isOverCanvas) {
      createShapeNode(activeShapeDrag.shape, {
        x: event.clientX,
        y: event.clientY,
      });
    }
  }

  function handleShapePointerCancel(event: PointerEvent<HTMLButtonElement>) {
    const activeShapeDrag = shapeDragRef.current;

    if (!activeShapeDrag || activeShapeDrag.pointerId !== event.pointerId) {
      return;
    }

    updateShapeDrag(null);
  }

  return (
    <div className="relative h-full w-full" ref={canvasWrapperRef}>
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
      <ShapePanel
        onPointerCancel={handleShapePointerCancel}
        onPointerDown={handleShapePointerDown}
        onPointerMove={handleShapePointerMove}
        onPointerUp={handleShapePointerUp}
      />
      {shapeDrag ? (
        <ShapeDragOverlay
          pointerOffset={shapeDrag.pointerOffset}
          position={shapeDrag.position}
          shape={shapeDrag.shape}
        />
      ) : null}
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
