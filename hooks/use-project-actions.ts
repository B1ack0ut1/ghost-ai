"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { type EditorProject } from "@/types/project";

export type ProjectDialogType = "create" | "rename" | "delete";

interface UseProjectActionsInput {
  activeProjectId?: string;
}

interface ProjectFormState {
  name: string;
  roomId: string;
}

interface ProjectDialogState {
  project: EditorProject | null;
  type: ProjectDialogType | null;
}

interface ProjectResponseBody {
  project: {
    id: string;
    name: string;
  };
}

const emptyFormState: ProjectFormState = {
  name: "",
  roomId: "",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createShortSuffix() {
  if (globalThis.crypto) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0].toString(36).slice(0, 6).padStart(6, "0");
  }

  return Date.now().toString(36).slice(-6);
}

function createRoomId(name: string, suffix: string) {
  const slug = toSlug(name) || "untitled-project";

  return `${slug}-${suffix}`;
}

async function readResponseJson(response: Response) {
  const body: unknown = await response.json().catch(() => null);

  return body;
}

function getResponseError(body: unknown, fallback: string) {
  if (!isRecord(body) || !isRecord(body.error)) {
    return fallback;
  }

  const message = body.error.message;

  return typeof message === "string" ? message : fallback;
}

function parseProjectResponse(body: unknown): ProjectResponseBody | null {
  if (!isRecord(body) || !isRecord(body.project)) {
    return null;
  }

  const { id, name } = body.project;

  if (typeof id !== "string" || typeof name !== "string") {
    return null;
  }

  return {
    project: {
      id,
      name,
    },
  };
}

export function useProjectActions({ activeProjectId }: UseProjectActionsInput) {
  const router = useRouter();
  const [createSuffix, setCreateSuffix] = useState("");
  const [dialogState, setDialogState] = useState<ProjectDialogState>({
    project: null,
    type: null,
  });
  const [formState, setFormState] = useState<ProjectFormState>(emptyFormState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeProject = dialogState.project;
  const dialogType = dialogState.type;

  const canSubmitName = useMemo(
    () => formState.name.trim().length > 0,
    [formState.name],
  );

  function resetDialog() {
    setDialogState({ project: null, type: null });
    setFormState(emptyFormState);
    setErrorMessage(null);
  }

  function updateProjectName(name: string) {
    setFormState({
      name,
      roomId:
        dialogState.type === "create"
          ? createRoomId(name, createSuffix)
          : formState.roomId,
    });
  }

  function openCreateDialog() {
    const suffix = createShortSuffix();

    setCreateSuffix(suffix);
    setFormState({
      name: "",
      roomId: createRoomId("", suffix),
    });
    setErrorMessage(null);
    setDialogState({ project: null, type: "create" });
  }

  function openRenameDialog(project: EditorProject) {
    if (project.role !== "owner") {
      return;
    }

    setFormState({
      name: project.name,
      roomId: project.id,
    });
    setErrorMessage(null);
    setDialogState({ project, type: "rename" });
  }

  function openDeleteDialog(project: EditorProject) {
    if (project.role !== "owner") {
      return;
    }

    setErrorMessage(null);
    setDialogState({ project, type: "delete" });
  }

  function closeDialog() {
    if (isLoading) {
      return;
    }

    resetDialog();
  }

  async function submitCreateDialog() {
    const name = formState.name.trim();

    if (!name || isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/projects", {
        body: JSON.stringify({
          id: formState.roomId,
          name,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const body = await readResponseJson(response);

      if (!response.ok) {
        throw new Error(
          getResponseError(body, "Project could not be created."),
        );
      }

      const parsedBody = parseProjectResponse(body);

      if (!parsedBody) {
        throw new Error("Project could not be created.");
      }

      resetDialog();
      router.push(`/editor/${encodeURIComponent(parsedBody.project.id)}`);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Project could not be created.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function submitRenameDialog() {
    const name = formState.name.trim();

    if (!activeProject || activeProject.role !== "owner" || !name || isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/projects/${activeProject.id}`, {
        body: JSON.stringify({ name }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });
      const body = await readResponseJson(response);

      if (!response.ok) {
        throw new Error(
          getResponseError(body, "Project could not be renamed."),
        );
      }

      resetDialog();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Project could not be renamed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function submitDeleteDialog() {
    if (!activeProject || activeProject.role !== "owner" || isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/projects/${activeProject.id}`, {
        method: "DELETE",
      });
      const body = await readResponseJson(response);

      if (!response.ok) {
        throw new Error(
          getResponseError(body, "Project could not be deleted."),
        );
      }

      resetDialog();

      if (activeProject.id === activeProjectId) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Project could not be deleted.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return {
    activeProject,
    canSubmitName,
    dialogType,
    errorMessage,
    formState,
    isLoading,
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
