import { type NodeProps } from "@xyflow/react";

import { NODE_COLORS, type CanvasNode } from "@/types/canvas";

export function CanvasNodeRenderer({ data }: NodeProps<CanvasNode>) {
  const textColor =
    NODE_COLORS.find((nodeColor) => nodeColor.fill === data.color)?.text ??
    NODE_COLORS[0].text;

  return (
    <div
      aria-label={data.label || "Untitled node"}
      className="flex h-full w-full items-center justify-center rounded-xl border border-surface-border px-3 text-center text-sm font-medium"
      style={{ backgroundColor: data.color, color: textColor }}
    >
      {data.label}
    </div>
  );
}
