"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import {
  Circle,
  Database,
  Diamond,
  Hexagon,
  Maximize,
  Pill,
  Plus,
  Redo2,
  Square,
  Undo2,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react";
import {
  Background,
  BackgroundVariant,
  type Connection,
  ConnectionMode,
  ReactFlow,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useCanRedo,
  useCanUndo,
  useErrorListener,
  useRedo,
  useUndo,
} from "@liveblocks/react/suspense";

import {
  CanvasEdgeActionsProvider,
  CanvasEdgeRenderer,
} from "@/components/editor/canvas-edge";
import {
  CanvasNodeActionsProvider,
  CanvasNodeRenderer,
  CanvasShape,
} from "@/components/editor/canvas-node";
import { type CanvasTemplate } from "@/components/editor/starter-templates";
import {
  CANVAS_EDGE_TYPE,
  CANVAS_NODE_TYPE,
  DEFAULT_CANVAS_EDGE_OPTIONS,
  NODE_COLORS,
  NODE_SHAPE_DEFAULT_SIZES,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeColor,
  type CanvasNodeShape,
} from "@/types/canvas";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

interface CollaborativeCanvasProps {
  onStarterTemplateImported?: () => void;
  roomId: string;
  starterTemplateImport?: StarterTemplateImportRequest | null;
}

export interface StarterTemplateImportRequest {
  id: number;
  template: CanvasTemplate;
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

const canvasEdgeTypes = {
  [CANVAS_EDGE_TYPE]: CanvasEdgeRenderer,
};

const VIEWPORT_ANIMATION_DURATION = 180;

interface CanvasControlBarProps {
  canRedo: boolean;
  canUndo: boolean;
  onFitView: () => void;
  onRedo: () => void;
  onUndo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

interface CanvasControlButtonProps {
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

function CanvasControlButton({
  disabled = false,
  icon: Icon,
  label,
  onClick,
}: CanvasControlButtonProps) {
  return (
    <button
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-subtle hover:text-brand disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-copy-secondary"
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}

function CanvasControlBar({
  canRedo,
  canUndo,
  onFitView,
  onRedo,
  onUndo,
  onZoomIn,
  onZoomOut,
}: CanvasControlBarProps) {
  return (
    <div
      aria-label="Canvas controls"
      className="absolute bottom-5 left-5 z-20 flex items-center gap-1 rounded-full border border-surface-border bg-elevated/95 p-1.5 shadow-2xl backdrop-blur-xl"
      role="toolbar"
    >
      <div className="flex items-center gap-1">
        <CanvasControlButton icon={ZoomOut} label="Zoom out" onClick={onZoomOut} />
        <CanvasControlButton icon={Maximize} label="Fit canvas to view" onClick={onFitView} />
        <CanvasControlButton icon={ZoomIn} label="Zoom in" onClick={onZoomIn} />
      </div>
      <div aria-hidden="true" className="mx-1 h-6 w-px bg-surface-border" />
      <div className="flex items-center gap-1">
        <CanvasControlButton disabled={!canUndo} icon={Undo2} label="Undo" onClick={onUndo} />
        <CanvasControlButton disabled={!canRedo} icon={Redo2} label="Redo" onClick={onRedo} />
      </div>
    </div>
  );
}

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
  const size = NODE_SHAPE_DEFAULT_SIZES[shape];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-50"
      style={{
        left: position.x - pointerOffset.x,
        top: position.y - pointerOffset.y,
      }}
    >
      <div className="relative" style={size}>
        <CanvasShape color={NODE_COLORS[0].fill} shape={shape} />
        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-elevated bg-success text-base shadow-sm">
          <Plus className="h-3 w-3 stroke-[3]" />
        </div>
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

function CollaborativeFlow({
  onStarterTemplateImported,
  starterTemplateImport,
}: Omit<CollaborativeCanvasProps, "roomId">) {
  const { nodes, edges, onNodesChange, onEdgesChange, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const nodeCounter = useRef(0);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const importedTemplateRequestRef = useRef<number | null>(null);
  const shapeDragRef = useRef<ShapeDragState | null>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null);
  const [shapeDrag, setShapeDrag] = useState<ShapeDragState | null>(null);

  useEffect(() => {
    if (
      !starterTemplateImport ||
      !reactFlowInstance ||
      importedTemplateRequestRef.current === starterTemplateImport.id
    ) {
      return;
    }

    importedTemplateRequestRef.current = starterTemplateImport.id;

    if (edges.length > 0) {
      onEdgesChange(
        edges.map((edge) => ({ id: edge.id, type: "remove" as const })),
      );
    }

    if (nodes.length > 0) {
      onNodesChange(
        nodes.map((node) => ({ id: node.id, type: "remove" as const })),
      );
    }

    onNodesChange(
      starterTemplateImport.template.nodes.map((node) => ({
        item: {
          ...node,
          data: { ...node.data },
          position: { ...node.position },
          style: node.style ? { ...node.style } : undefined,
        },
        type: "add" as const,
      })),
    );
    onEdgesChange(
      starterTemplateImport.template.edges.map((edge) => ({
        item: {
          ...edge,
          data: { label: edge.data?.label ?? "" },
        },
        type: "add" as const,
      })),
    );

    window.requestAnimationFrame(() => {
      void reactFlowInstance.fitView({
        duration: VIEWPORT_ANIMATION_DURATION,
        padding: 0.2,
      });
      onStarterTemplateImported?.();
    });
  }, [
    edges,
    nodes,
    onEdgesChange,
    onNodesChange,
    onStarterTemplateImported,
    reactFlowInstance,
    starterTemplateImport,
  ]);

  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance) {
      void reactFlowInstance.zoomIn({ duration: VIEWPORT_ANIMATION_DURATION });
    }
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance) {
      void reactFlowInstance.zoomOut({ duration: VIEWPORT_ANIMATION_DURATION });
    }
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      void reactFlowInstance.fitView({ duration: VIEWPORT_ANIMATION_DURATION });
    }
  }, [reactFlowInstance]);

  useKeyboardShortcuts({ reactFlowInstance, redo, undo });

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

  function updateNodeLabel(nodeId: string, label: string) {
    const node = nodes.find((canvasNode) => canvasNode.id === nodeId);

    if (!node || node.data.label === label) {
      return;
    }

    onNodesChange([
      {
        id: nodeId,
        item: {
          ...node,
          data: { ...node.data, label },
        },
        type: "replace",
      },
    ]);
  }

  function updateNodeColor(nodeId: string, color: CanvasNodeColor) {
    const node = nodes.find((canvasNode) => canvasNode.id === nodeId);

    if (!node || node.data.color === color) {
      return;
    }

    onNodesChange([
      {
        id: nodeId,
        item: {
          ...node,
          data: { ...node.data, color },
        },
        type: "replace",
      },
    ]);
  }

  function updateEdgeLabel(edgeId: string, label: string) {
    const edge = edges.find((canvasEdge) => canvasEdge.id === edgeId);

    if (!edge || edge.data?.label === label) {
      return;
    }

    onEdgesChange([
      {
        id: edgeId,
        item: {
          ...edge,
          data: { ...(edge.data ?? {}), label },
        },
        type: "replace",
      },
    ]);
  }

  function handleConnect(connection: Connection) {
    const sourceHandle = connection.sourceHandle ?? "default";
    const targetHandle = connection.targetHandle ?? "default";
    const id = `edge-${connection.source}-${sourceHandle}-${connection.target}-${targetHandle}`;

    if (edges.some((edge) => edge.id === id)) {
      return;
    }

    onEdgesChange([
      {
        item: {
          ...connection,
          ...DEFAULT_CANVAS_EDGE_OPTIONS,
          id,
        },
        type: "add",
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
      <CanvasEdgeActionsProvider updateEdgeLabel={updateEdgeLabel}>
        <CanvasNodeActionsProvider
          updateNodeColor={updateNodeColor}
          updateNodeLabel={updateNodeLabel}
        >
          <ReactFlow<CanvasNode, CanvasEdge>
            className="bg-base"
            colorMode="dark"
            connectionMode={ConnectionMode.Loose}
            defaultEdgeOptions={DEFAULT_CANVAS_EDGE_OPTIONS}
            edgeTypes={canvasEdgeTypes}
            edges={edges}
            fitView
            nodeTypes={canvasNodeTypes}
            nodes={nodes}
            onConnect={handleConnect}
            onDelete={onDelete}
            onEdgesChange={onEdgesChange}
            onInit={setReactFlowInstance}
            onNodesChange={onNodesChange}
          >
            <Background
              color="var(--border-subtle)"
              gap={20}
              size={1}
              variant={BackgroundVariant.Dots}
            />
          </ReactFlow>
        </CanvasNodeActionsProvider>
      </CanvasEdgeActionsProvider>
      <CanvasControlBar
        canRedo={canRedo}
        canUndo={canUndo}
        onFitView={handleFitView}
        onRedo={redo}
        onUndo={undo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
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

export function CollaborativeCanvas({
  onStarterTemplateImported,
  roomId,
  starterTemplateImport,
}: CollaborativeCanvasProps) {
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
              {() => (
                <CollaborativeFlow
                  onStarterTemplateImported={onStarterTemplateImported}
                  starterTemplateImport={starterTemplateImport}
                />
              )}
            </ClientSideSuspense>
          )}
        </RoomProvider>
      </LiveblocksProvider>
    </div>
  );
}
