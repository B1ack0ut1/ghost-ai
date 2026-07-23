"use client";

import { FolderOpen, Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { type EditorProject } from "@/types/project";

interface ProjectSidebarProps {
  activeProjectId?: string;
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: () => void;
  onDeleteProject: (project: EditorProject) => void;
  onRenameProject: (project: EditorProject) => void;
  ownedProjects: EditorProject[];
  sharedProjects: EditorProject[];
}

interface EmptyProjectsStateProps {
  title: string;
  description: string;
}

interface ProjectListProps {
  activeProjectId?: string;
  emptyDescription: string;
  emptyTitle: string;
  onDeleteProject: (project: EditorProject) => void;
  onRenameProject: (project: EditorProject) => void;
  projects: EditorProject[];
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

function ProjectList({
  activeProjectId,
  emptyDescription,
  emptyTitle,
  onDeleteProject,
  onRenameProject,
  projects,
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <EmptyProjectsState title={emptyTitle} description={emptyDescription} />
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto pr-1">
      {projects.map((project) => {
        const canManage = project.role === "owner";
        const isActive = project.id === activeProjectId;

        return (
          <div
            key={project.id}
            className={cn(
              "group grid min-h-20 grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-surface-border bg-surface px-3 py-3 transition-colors hover:bg-subtle",
              isActive && "border-brand bg-brand-dim"
            )}
          >
            <Link
              href={`/editor/${project.id}`}
              aria-current={isActive ? "page" : undefined}
              className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-base"
              aria-label={`Open ${project.name}`}
            >
              <span className="block truncate text-sm font-medium text-copy-primary">
                {project.name}
              </span>
              <span className="mt-1 block truncate font-mono text-xs text-copy-muted">
                {project.id}
              </span>
              <span className="mt-2 block text-xs text-copy-faint">
                {project.updatedAt}
              </span>
            </Link>

            {canManage ? (
              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Rename ${project.name}`}
                  onClick={() => onRenameProject(project)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${project.name}`}
                  onClick={() => onDeleteProject(project)}
                  className="text-error hover:text-error"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ProjectSidebar({
  activeProjectId,
  isOpen,
  onClose,
  onCreateProject,
  onDeleteProject,
  onRenameProject,
  ownedProjects,
  sharedProjects,
}: ProjectSidebarProps) {
  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close project sidebar"
          className="fixed inset-0 z-30 bg-base/70 backdrop-blur-sm sm:hidden"
          onClick={onClose}
        />
      ) : null}

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
            <ProjectList
              activeProjectId={activeProjectId}
              emptyTitle="No projects yet"
              emptyDescription="Create a project to start a workspace."
              onDeleteProject={onDeleteProject}
              onRenameProject={onRenameProject}
              projects={ownedProjects}
            />
          </TabsContent>
          <TabsContent value="shared" className="min-h-0 flex-1">
            <ProjectList
              activeProjectId={activeProjectId}
              emptyTitle="No shared projects"
              emptyDescription="Shared workspaces will appear here."
              onDeleteProject={onDeleteProject}
              onRenameProject={onRenameProject}
              projects={sharedProjects}
            />
          </TabsContent>
        </Tabs>

        <div className="border-t border-surface-border pt-4">
          <Button type="button" className="w-full" onClick={onCreateProject}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
