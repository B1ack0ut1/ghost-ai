import { redirect } from "next/navigation";

import { getCurrentEditorProjectLists } from "@/app/editor/project-lists";
import { EditorShell } from "@/components/editor/editor-shell";

interface EditorWorkspacePageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function EditorWorkspacePage({
  params,
}: EditorWorkspacePageProps) {
  const { projectId } = await params;
  const projectLists = await getCurrentEditorProjectLists();
  const activeProject = [
    ...projectLists.ownedProjects,
    ...projectLists.sharedProjects,
  ].find((project) => project.id === projectId);

  if (!activeProject) {
    redirect("/editor");
  }

  return (
    <EditorShell
      {...projectLists}
      activeProjectId={projectId}
      activeProjectName={activeProject.name}
    />
  );
}
