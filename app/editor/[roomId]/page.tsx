import { redirect } from "next/navigation";

import { getCurrentEditorProjectLists } from "@/app/editor/project-lists";
import { AccessDenied } from "@/components/editor/access-denied";
import { EditorWorkspaceShell } from "@/components/editor/editor-workspace-shell";
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
    redirect(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in");
  }

  const [project, projectLists] = await Promise.all([
    getAccessibleProject(roomId, identity),
    getCurrentEditorProjectLists(),
  ]);

  if (!project) {
    return <AccessDenied />;
  }

  return (
    <EditorWorkspaceShell
      {...projectLists}
      projectId={project.id}
      projectName={project.name}
    />
  );
}
