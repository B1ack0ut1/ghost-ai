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

interface EditorNavbarProps {
  isAiSidebarOpen?: boolean;
  isSidebarOpen: boolean;
  onAiSidebarToggle?: () => void;
  onSidebarToggle: () => void;
  projectName?: string;
}

export function EditorNavbar({
  isAiSidebarOpen,
  isSidebarOpen,
  onAiSidebarToggle,
  onSidebarToggle,
  projectName,
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;
  const AiSidebarIcon = isAiSidebarOpen ? PanelRightClose : PanelRightOpen;

  return (
    <header className="grid h-14 grid-cols-[1fr_auto_1fr] items-center border-b border-surface-border bg-surface/95 px-3 backdrop-blur sm:px-4">
      <div className="flex items-center justify-start">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={isSidebarOpen ? "Close project sidebar" : "Open project sidebar"}
          aria-controls="project-sidebar"
          aria-expanded={isSidebarOpen}
          onClick={onSidebarToggle}
        >
          <SidebarIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="min-w-0 truncate px-4 text-center text-sm font-medium text-copy-primary">
        {projectName}
      </div>

      <div className="flex items-center justify-end gap-1">
        {projectName ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled
              aria-label="Share project"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
              aria-controls="ai-sidebar"
              aria-expanded={isAiSidebarOpen}
              onClick={onAiSidebarToggle}
            >
              <AiSidebarIcon className="h-5 w-5" />
            </Button>
          </>
        ) : null}
        <UserButton />
      </div>
    </header>
  );
}
