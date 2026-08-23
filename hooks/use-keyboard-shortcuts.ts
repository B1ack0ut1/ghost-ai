"use client";

import { useEffect } from "react";
import type { Edge, Node, ReactFlowInstance } from "@xyflow/react";

interface UseKeyboardShortcutsOptions<
  NodeType extends Node = Node,
  EdgeType extends Edge = Edge,
> {
  reactFlowInstance: ReactFlowInstance<NodeType, EdgeType> | null;
  redo: () => void;
  undo: () => void;
}

const VIEWPORT_ANIMATION_DURATION = 180;

function isEditableElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest("input, textarea, select, [contenteditable='true']"),
  );
}

export function useKeyboardShortcuts<
  NodeType extends Node = Node,
  EdgeType extends Edge = Edge,
>({
  reactFlowInstance,
  redo,
  undo,
}: UseKeyboardShortcutsOptions<NodeType, EdgeType>) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableElement(event.target)) {
        return;
      }

      const hasCommandModifier = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (hasCommandModifier && key === "z") {
        event.preventDefault();

        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }

        return;
      }

      if (hasCommandModifier && key === "y") {
        event.preventDefault();
        redo();
        return;
      }

      if (hasCommandModifier || event.altKey || !reactFlowInstance) {
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        void reactFlowInstance.zoomIn({ duration: VIEWPORT_ANIMATION_DURATION });
        return;
      }

      if (event.key === "-") {
        event.preventDefault();
        void reactFlowInstance.zoomOut({ duration: VIEWPORT_ANIMATION_DURATION });
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reactFlowInstance, redo, undo]);
}
