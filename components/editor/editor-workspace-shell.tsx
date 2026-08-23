"use client";

import { useRef, useState } from "react";

import {
  CollaborativeCanvas,
  type StarterTemplateImportRequest,
} from "@/components/editor/collaborative-canvas";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ShareDialog } from "@/components/editor/share-dialog";
import {
  StarterTemplatesModal,
} from "@/components/editor/starter-templates-modal";
import { type CanvasTemplate } from "@/components/editor/starter-templates";
import { useProjectActions } from "@/hooks/use-project-actions";
import { type EditorProjectLists } from "@/types/project";

interface EditorWorkspaceShellProps extends EditorProjectLists {
  canManageAccess: boolean;
  projectId: string;
  projectName: string;
}

export function EditorWorkspaceShell({
  projectId,
  projectName,
  canManageAccess,
  ownedProjects,
  sharedProjects,
}: EditorWorkspaceShellProps) {
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);
  const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isStarterTemplatesOpen, setIsStarterTemplatesOpen] = useState(false);
  const [starterTemplateImport, setStarterTemplateImport] =
    useState<StarterTemplateImportRequest | null>(null);
  const starterTemplateImportCounter = useRef(0);
  const projectActions = useProjectActions({ activeProjectId: projectId });

  function importStarterTemplate(template: CanvasTemplate) {
    starterTemplateImportCounter.current += 1;
    setStarterTemplateImport({
      id: starterTemplateImportCounter.current,
      template,
    });
  }

  return (
    <main className="flex min-h-dvh flex-col overflow-hidden bg-base text-copy-primary">
      <EditorNavbar
        isAiSidebarOpen={isAiSidebarOpen}
        isSidebarOpen={isProjectSidebarOpen}
        onAiSidebarToggle={() => setIsAiSidebarOpen((isOpen) => !isOpen)}
        onShareClick={() => setIsShareDialogOpen(true)}
        onSidebarToggle={() => setIsProjectSidebarOpen((isOpen) => !isOpen)}
        onStarterTemplatesClick={() => setIsStarterTemplatesOpen(true)}
        projectName={projectName}
        showWorkspaceActions
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
          className="min-w-0 flex-1 bg-base"
        >
          <CollaborativeCanvas
            onStarterTemplateImported={() => setStarterTemplateImport(null)}
            roomId={projectId}
            starterTemplateImport={starterTemplateImport}
          />
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
      <ShareDialog
        canManageAccess={canManageAccess}
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        projectId={projectId}
        projectName={projectName}
      />
      <StarterTemplatesModal
        onImport={importStarterTemplate}
        onOpenChange={setIsStarterTemplatesOpen}
        open={isStarterTemplatesOpen}
      />
    </main>
  );
}
