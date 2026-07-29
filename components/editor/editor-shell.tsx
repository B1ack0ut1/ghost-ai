"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { Button } from "@/components/ui/button";
import { useProjectActions } from "@/hooks/use-project-actions";
import { type EditorProjectLists } from "@/types/project";

interface EditorShellProps extends EditorProjectLists {
  activeProjectId?: string;
  activeProjectName?: string;
}

export function EditorShell({
  activeProjectId,
  activeProjectName,
  ownedProjects,
  sharedProjects,
}: EditorShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const projectActions = useProjectActions({ activeProjectId });

  return (
    <main className="min-h-screen bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <ProjectSidebar
        activeProjectId={activeProjectId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCreateProject={projectActions.openCreateDialog}
        onDeleteProject={projectActions.openDeleteDialog}
        onRenameProject={projectActions.openRenameDialog}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
      />
      <section className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-copy-primary">
            {activeProjectName ?? "Create a project or open an existing one"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-copy-secondary">
            {activeProjectName
              ? "The collaborative canvas for this project will appear here."
              : "Start a new architecture workspace, or choose a project from the sidebar."}
          </p>
          <Button
            type="button"
            className="mt-6"
            onClick={projectActions.openCreateDialog}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </section>
      <ProjectDialogs controller={projectActions} />
    </main>
  );
}
