export type ProjectRole = "owner" | "collaborator";

export interface EditorProject {
  id: string;
  name: string;
  role: ProjectRole;
  updatedAt: string;
}

export interface EditorProjectLists {
  ownedProjects: EditorProject[];
  sharedProjects: EditorProject[];
}
