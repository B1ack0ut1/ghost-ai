import { EditorShell } from "@/components/editor/editor-shell";
import { getCurrentEditorProjectLists } from "@/app/editor/project-lists";

export default async function EditorPage() {
  const projectLists = await getCurrentEditorProjectLists();

  return <EditorShell {...projectLists} />;
}
