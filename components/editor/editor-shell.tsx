"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { useProjectDialogs } from "@/components/editor/hooks/use-project-dialogs";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { Button } from "@/components/ui/button";

export function EditorShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const projectDialogs = useProjectDialogs();

  return (
    <main className="min-h-screen bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCreateProject={projectDialogs.openCreateDialog}
        onDeleteProject={projectDialogs.openDeleteDialog}
        onRenameProject={projectDialogs.openRenameDialog}
        ownedProjects={projectDialogs.ownedProjects}
        sharedProjects={projectDialogs.sharedProjects}
      />
      <section className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-copy-primary">
            Create a project or open an existing one
          </h1>
          <p className="mt-3 text-sm leading-6 text-copy-secondary">
            Start a new architecture workspace, or choose a project from the
            sidebar.
          </p>
          <Button
            type="button"
            className="mt-6"
            onClick={projectDialogs.openCreateDialog}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </section>
      <ProjectDialogs controller={projectDialogs} />
    </main>
  );
}
