import { redirect } from "next/navigation";

import { getCurrentEditorProjectLists } from "@/app/editor/project-lists";
import { AccessDenied } from "@/components/editor/access-denied";
import { EditorWorkspaceShell } from "@/components/editor/editor-workspace-shell";
import { getSignInUrl } from "@/lib/clerk-api";
import {
  getAccessibleProject,
  getCurrentProjectIdentity,
} from "@/lib/project-access";

interface EditorWorkspacePageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function EditorWorkspacePage({
  params,
}: EditorWorkspacePageProps) {
  const { roomId } = await params;
  const identity = await getCurrentProjectIdentity();

  if (!identity) {
    redirect(`${getSignInUrl()}?redirect_url=${encodeURIComponent(`/editor/${roomId}`)}`);
  }

  const [project, projectLists] = await Promise.all([
    getAccessibleProject(roomId, identity),
    getCurrentEditorProjectLists(identity),
  ]);

  if (!project) {
    return <AccessDenied />;
  }

  return (
    <EditorWorkspaceShell
      {...projectLists}
      canManageAccess={project.canManageAccess}
      projectId={project.id}
      projectName={project.name}
    />
  );
}
