"use client";

import { useState } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectActions } from "@/hooks/use-project-actions";
import { type EditorProjectLists } from "@/types/project";

interface EditorWorkspaceShellProps extends EditorProjectLists {
  projectId: string;
  projectName: string;
}

export function EditorWorkspaceShell({
  projectId,
  projectName,
  ownedProjects,
  sharedProjects,
}: EditorWorkspaceShellProps) {
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);
  const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(false);
  const projectActions = useProjectActions({ activeProjectId: projectId });

  return (
    <main className="flex min-h-dvh flex-col overflow-hidden bg-base text-copy-primary">
      <EditorNavbar
        isAiSidebarOpen={isAiSidebarOpen}
        isSidebarOpen={isProjectSidebarOpen}
        onAiSidebarToggle={() => setIsAiSidebarOpen((isOpen) => !isOpen)}
        onSidebarToggle={() => setIsProjectSidebarOpen((isOpen) => !isOpen)}
        projectName={projectName}
      />
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <ProjectSidebar
          activeProjectId={projectId}
          isOpen={isProjectSidebarOpen}
          onClose={() => setIsProjectSidebarOpen(false)}
          onCreateProject={projectActions.openCreateDialog}
          onDeleteProject={projectActions.openDeleteDialog}
          onRenameProject={projectActions.openRenameDialog}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
        />

        <section
          aria-label="Canvas workspace"
          className="flex min-w-0 flex-1 items-center justify-center bg-base px-6"
        >
          <div className="max-w-sm text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand">
              Workspace ready
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-copy-primary">
              Canvas coming soon
            </h1>
            <p className="mt-3 text-sm leading-6 text-copy-secondary">
              The collaborative design canvas for {projectName} will appear
              here.
            </p>
          </div>
        </section>

        <aside
          id="ai-sidebar"
          aria-hidden={!isAiSidebarOpen}
          aria-label="AI assistant"
          className={`absolute bottom-4 right-3 top-4 z-20 flex w-[min(calc(100vw-1.5rem),24rem)] flex-col rounded-2xl border border-surface-border bg-elevated/95 p-5 shadow-2xl backdrop-blur-xl transition duration-200 ease-out sm:right-4 sm:w-96 ${
            isAiSidebarOpen
              ? "translate-x-0 opacity-100"
              : "pointer-events-none translate-x-[calc(100%+1rem)] opacity-0"
          }`}
        >
          <h2 className="text-base font-semibold text-copy-primary">AI Assistant</h2>
          <div className="flex flex-1 items-center justify-center text-center">
            <p className="max-w-56 text-sm leading-6 text-copy-muted">
              AI chat will be available here in a future workspace update.
            </p>
          </div>
        </aside>
      </div>
      <ProjectDialogs controller={projectActions} />
    </main>
  );
}
