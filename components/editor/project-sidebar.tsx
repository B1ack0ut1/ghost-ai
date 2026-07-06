"use client";

import { FolderOpen, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EmptyProjectsStateProps {
  title: string;
  description: string;
}

function EmptyProjectsState({ title, description }: EmptyProjectsStateProps) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-surface-border-subtle bg-surface/70 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-surface-border bg-elevated text-copy-muted">
        <FolderOpen className="h-8 w-8" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-copy-primary">{title}</p>
        <p className="text-sm leading-6 text-copy-muted">{description}</p>
      </div>
    </div>
  );
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      id="project-sidebar"
      aria-label="Projects"
      aria-hidden={!isOpen}
      inert={isOpen ? undefined : true}
      className={cn(
        "fixed bottom-4 left-3 top-16 z-40 flex w-[min(calc(100vw-1.5rem),22rem)] flex-col rounded-2xl border border-surface-border bg-elevated/95 p-4 shadow-2xl backdrop-blur-xl transition duration-200 ease-out sm:left-4 sm:w-80",
        isOpen
          ? "translate-x-0 opacity-100"
          : "pointer-events-none -translate-x-[calc(100%+1rem)] opacity-0"
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-surface-border pb-4">
        <h2 className="text-base font-semibold text-copy-primary">Projects</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close project sidebar"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Tabs defaultValue="my-projects" className="flex min-h-0 flex-1 flex-col pt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
        <TabsContent value="my-projects" className="min-h-0 flex-1">
          <EmptyProjectsState
            title="No projects yet"
            description="Create a project when the project flow is available."
          />
        </TabsContent>
        <TabsContent value="shared" className="min-h-0 flex-1">
          <EmptyProjectsState
            title="No shared projects"
            description="Shared workspaces will appear here."
          />
        </TabsContent>
      </Tabs>

      <div className="border-t border-surface-border pt-4">
        <Button type="button" className="w-full">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  );
}
