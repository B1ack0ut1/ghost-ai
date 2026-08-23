"use client";

import { type CSSProperties } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CANVAS_TEMPLATES,
  type CanvasTemplate,
} from "@/components/editor/starter-templates";
import {
  NODE_SHAPE_DEFAULT_SIZES,
  type CanvasNode,
} from "@/types/canvas";

interface StarterTemplatesModalProps {
  onImport: (template: CanvasTemplate) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

interface PreviewNode {
  height: number;
  node: CanvasNode;
  width: number;
  x: number;
  y: number;
}

const PREVIEW_SIZE = { height: 156, width: 288 };
const PREVIEW_PADDING = 20;

function getDimension(
  node: CanvasNode,
  dimension: "height" | "width",
): number {
  const value = node.style?.[dimension];

  return typeof value === "number"
    ? value
    : NODE_SHAPE_DEFAULT_SIZES[node.data.shape][dimension];
}

function getPreviewNodes(nodes: CanvasNode[]): PreviewNode[] {
  const rawNodes = nodes.map((node) => ({
    height: getDimension(node, "height"),
    node,
    width: getDimension(node, "width"),
    x: node.position.x,
    y: node.position.y,
  }));

  const minX = Math.min(...rawNodes.map((node) => node.x));
  const minY = Math.min(...rawNodes.map((node) => node.y));
  const maxX = Math.max(...rawNodes.map((node) => node.x + node.width));
  const maxY = Math.max(...rawNodes.map((node) => node.y + node.height));
  const diagramWidth = Math.max(maxX - minX, 1);
  const diagramHeight = Math.max(maxY - minY, 1);
  const scale = Math.min(
    (PREVIEW_SIZE.width - PREVIEW_PADDING * 2) / diagramWidth,
    (PREVIEW_SIZE.height - PREVIEW_PADDING * 2) / diagramHeight,
  );
  const offsetX =
    (PREVIEW_SIZE.width - diagramWidth * scale) / 2 - minX * scale;
  const offsetY =
    (PREVIEW_SIZE.height - diagramHeight * scale) / 2 - minY * scale;

  return rawNodes.map((node) => ({
    ...node,
    height: node.height * scale,
    width: node.width * scale,
    x: node.x * scale + offsetX,
    y: node.y * scale + offsetY,
  }));
}

function TemplatePreviewShape({ previewNode }: { previewNode: PreviewNode }) {
  const { height, node, width, x, y } = previewNode;
  const { color, shape } = node.data;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const stroke = "var(--border-subtle)";

  if (shape === "diamond") {
    return (
      <polygon
        fill={color}
        points={`${centerX},${y} ${x + width},${centerY} ${centerX},${y + height} ${x},${centerY}`}
        stroke={stroke}
        strokeWidth={1}
      />
    );
  }

  if (shape === "hexagon") {
    return (
      <polygon
        fill={color}
        points={`${x + width * 0.24},${y} ${x + width * 0.76},${y} ${x + width},${centerY} ${x + width * 0.76},${y + height} ${x + width * 0.24},${y + height} ${x},${centerY}`}
        stroke={stroke}
        strokeWidth={1}
      />
    );
  }

  if (shape === "circle") {
    return (
      <ellipse
        cx={centerX}
        cy={centerY}
        fill={color}
        rx={width / 2}
        ry={height / 2}
        stroke={stroke}
        strokeWidth={1}
      />
    );
  }

  if (shape === "cylinder") {
    const ellipseHeight = Math.min(height * 0.22, 10);

    return (
      <>
        <path
          d={`M ${x} ${y + ellipseHeight / 2} V ${y + height - ellipseHeight / 2} C ${x} ${y + height + ellipseHeight / 2}, ${x + width} ${y + height + ellipseHeight / 2}, ${x + width} ${y + height - ellipseHeight / 2} V ${y + ellipseHeight / 2}`}
          fill={color}
          stroke={stroke}
          strokeWidth={1}
        />
        <ellipse
          cx={centerX}
          cy={y + ellipseHeight / 2}
          fill={color}
          rx={width / 2}
          ry={ellipseHeight / 2}
          stroke={stroke}
          strokeWidth={1}
        />
      </>
    );
  }

  return (
    <rect
      fill={color}
      height={height}
      rx={shape === "pill" ? height / 2 : Math.min(height * 0.14, 8)}
      stroke={stroke}
      strokeWidth={1}
      width={width}
      x={x}
      y={y}
    />
  );
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const previewNodes = getPreviewNodes(template.nodes);
  const nodeById = new Map(
    previewNodes.map((previewNode) => [previewNode.node.id, previewNode]),
  );

  return (
    <svg
      aria-hidden="true"
      className="h-auto w-full border-b border-surface-border bg-base"
      role="img"
      style={
        {
          "--preview-edge": "var(--text-secondary)",
        } as CSSProperties
      }
      viewBox={`0 0 ${PREVIEW_SIZE.width} ${PREVIEW_SIZE.height}`}
    >
      {template.edges.map((edge) => {
        const source = nodeById.get(edge.source);
        const target = nodeById.get(edge.target);

        if (!source || !target) {
          return null;
        }

        return (
          <line
            key={edge.id}
            stroke="var(--preview-edge)"
            strokeLinecap="round"
            strokeWidth={1.5}
            x1={source.x + source.width / 2}
            x2={target.x + target.width / 2}
            y1={source.y + source.height / 2}
            y2={target.y + target.height / 2}
          />
        );
      })}
      {previewNodes.map((previewNode) => (
        <TemplatePreviewShape
          key={previewNode.node.id}
          previewNode={previewNode}
        />
      ))}
    </svg>
  );
}

export function StarterTemplatesModal({
  onImport,
  onOpenChange,
  open,
}: StarterTemplatesModalProps) {
  function handleImport(template: CanvasTemplate) {
    onImport(template);
    onOpenChange(false);
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-4xl p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle>Start from a template</DialogTitle>
          <DialogDescription>
            Replace this canvas with a pre-built system design, then make it
            your own.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mr-3 h-[min(31rem,calc(100vh-14rem))] pr-3">
          <div className="grid gap-4 pb-1 sm:grid-cols-2 lg:grid-cols-3">
            {CANVAS_TEMPLATES.map((template) => (
              <article
                className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface"
                key={template.id}
              >
                <TemplatePreview template={template} />
                <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-copy-primary">
                      {template.name}
                    </h3>
                    <p className="mt-2 text-sm leading-5 text-copy-muted">
                      {template.description}
                    </p>
                  </div>
                  <Button
                    className="w-full hover:bg-elevated"
                    onClick={() => handleImport(template)}
                    type="button"
                    variant="outline"
                  >
                    Import template
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
