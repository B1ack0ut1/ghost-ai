"use client";

import { useMemo, useState } from "react";

export type ProjectRole = "owner" | "collaborator";

export interface MockProject {
  id: string;
  name: string;
  slug: string;
  role: ProjectRole;
  updatedAt: string;
}

export type ProjectDialogType = "create" | "rename" | "delete";

interface ProjectFormState {
  name: string;
  slug: string;
}

interface ProjectDialogState {
  type: ProjectDialogType | null;
  projectId: string | null;
}

const MOCK_PROJECTS: MockProject[] = [
  {
    id: "proj-api-gateway",
    name: "API Gateway Redesign",
    slug: "api-gateway-redesign",
    role: "owner",
    updatedAt: "Updated today",
  },
  {
    id: "proj-notification-system",
    name: "Notification System",
    slug: "notification-system",
    role: "owner",
    updatedAt: "Updated yesterday",
  },
  {
    id: "proj-observability",
    name: "Observability Platform",
    slug: "observability-platform",
    role: "collaborator",
    updatedAt: "Shared 2 days ago",
  },
];

const emptyFormState: ProjectFormState = {
  name: "",
  slug: "",
};

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeProjectId(slug: string) {
  return `proj-${slug || "untitled"}-${Date.now().toString(36)}`;
}

export function useProjectDialogs() {
  const [projects, setProjects] = useState<MockProject[]>(MOCK_PROJECTS);
  const [dialogState, setDialogState] = useState<ProjectDialogState>({
    type: null,
    projectId: null,
  });
  const [formState, setFormState] = useState<ProjectFormState>(emptyFormState);
  const [isLoading, setIsLoading] = useState(false);

  const activeProject = useMemo(
    () =>
      projects.find((project) => project.id === dialogState.projectId) ?? null,
    [dialogState.projectId, projects]
  );

  const ownedProjects = useMemo(
    () => projects.filter((project) => project.role === "owner"),
    [projects]
  );

  const sharedProjects = useMemo(
    () => projects.filter((project) => project.role === "collaborator"),
    [projects]
  );

  function updateProjectName(name: string) {
    setFormState({
      name,
      slug: toSlug(name),
    });
  }

  function openCreateDialog() {
    setFormState(emptyFormState);
    setDialogState({ type: "create", projectId: null });
  }

  function openRenameDialog(project: MockProject) {
    if (project.role !== "owner") {
      return;
    }

    setFormState({
      name: project.name,
      slug: project.slug,
    });
    setDialogState({ type: "rename", projectId: project.id });
  }

  function openDeleteDialog(project: MockProject) {
    if (project.role !== "owner") {
      return;
    }

    setDialogState({ type: "delete", projectId: project.id });
  }

  function closeDialog() {
    if (isLoading) {
      return;
    }

    setDialogState({ type: null, projectId: null });
    setFormState(emptyFormState);
  }

  function submitCreateDialog() {
    const name = formState.name.trim();
    const slug = formState.slug || "untitled-project";

    if (!name) {
      return;
    }

    setIsLoading(true);
    setProjects((currentProjects) => [
      {
        id: makeProjectId(slug),
        name,
        slug,
        role: "owner",
        updatedAt: "Updated just now",
      },
      ...currentProjects,
    ]);
    setIsLoading(false);
    closeDialog();
  }

  function submitRenameDialog() {
    const name = formState.name.trim();

    if (!activeProject || activeProject.role !== "owner" || !name) {
      return;
    }

    setIsLoading(true);
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === activeProject.id
          ? {
              ...project,
              name,
              slug: formState.slug || project.slug,
              updatedAt: "Updated just now",
            }
          : project
      )
    );
    setIsLoading(false);
    closeDialog();
  }

  function submitDeleteDialog() {
    if (!activeProject || activeProject.role !== "owner") {
      return;
    }

    setIsLoading(true);
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== activeProject.id)
    );
    setIsLoading(false);
    closeDialog();
  }

  return {
    activeProject,
    dialogType: dialogState.type,
    formState,
    isLoading,
    ownedProjects,
    projects,
    sharedProjects,
    closeDialog,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    submitCreateDialog,
    submitDeleteDialog,
    submitRenameDialog,
    updateProjectName,
  };
}
