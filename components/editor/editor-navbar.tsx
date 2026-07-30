"use client";

import { UserButton } from "@clerk/nextjs";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface EditorNavbarBaseProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
}

interface WorkspaceEditorNavbarProps extends EditorNavbarBaseProps {
  isAiSidebarOpen: boolean;
  onAiSidebarToggle: () => void;
  onShareClick: () => void;
  projectName: string;
  showWorkspaceActions: true;
}

interface ProjectListEditorNavbarProps extends EditorNavbarBaseProps {
  isAiSidebarOpen?: never;
  onAiSidebarToggle?: never;
  onShareClick?: never;
  projectName?: undefined;
  showWorkspaceActions?: false;
}

type EditorNavbarProps =
  | WorkspaceEditorNavbarProps
  | ProjectListEditorNavbarProps;

export function EditorNavbar(props: EditorNavbarProps) {
  const SidebarIcon = props.isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <header className="grid h-14 grid-cols-[1fr_auto_1fr] items-center border-b border-surface-border bg-surface/95 px-3 backdrop-blur sm:px-4">
      <div className="flex items-center justify-start">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={
            props.isSidebarOpen ? "Close project sidebar" : "Open project sidebar"
          }
          aria-controls="project-sidebar"
          aria-expanded={props.isSidebarOpen}
          onClick={props.onSidebarToggle}
        >
          <SidebarIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="min-w-0 truncate px-4 text-center text-sm font-medium text-copy-primary">
        {props.projectName}
      </div>

      <div className="flex items-center justify-end gap-1">
        {props.showWorkspaceActions ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Share project"
              onClick={props.onShareClick}
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={
                props.isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"
              }
              aria-controls="ai-sidebar"
              aria-expanded={props.isAiSidebarOpen}
              onClick={props.onAiSidebarToggle}
            >
              {props.isAiSidebarOpen ? (
                <PanelRightClose className="h-5 w-5" />
              ) : (
                <PanelRightOpen className="h-5 w-5" />
              )}
            </Button>
          </>
        ) : null}
        <UserButton />
      </div>
    </header>
  );
}
