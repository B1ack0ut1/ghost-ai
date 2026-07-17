"use client";

import { type FormEvent } from "react";

import { type useProjectDialogs } from "@/components/editor/hooks/use-project-dialogs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ProjectDialogsProps {
  controller: ReturnType<typeof useProjectDialogs>;
}

function getSlugPreview(slug: string) {
  return slug || "project-slug";
}

export function ProjectDialogs({ controller }: ProjectDialogsProps) {
  const {
    activeProject,
    closeDialog,
    dialogType,
    formState,
    isLoading,
    submitCreateDialog,
    submitDeleteDialog,
    submitRenameDialog,
    updateProjectName,
  } = controller;

  const isCreateOpen = dialogType === "create";
  const isRenameOpen = dialogType === "rename";
  const isDeleteOpen = dialogType === "delete";
  const canSubmitName = formState.name.trim().length > 0;

  function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitCreateDialog();
  }

  function handleRenameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitRenameDialog();
  }

  function handleDeleteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitDeleteDialog();
  }

  return (
    <>
      <Dialog open={isCreateOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <form onSubmit={handleCreateSubmit} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>
                Name the architecture workspace you want to create.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2">
              <label
                htmlFor="create-project-name"
                className="text-sm font-medium text-copy-primary"
              >
                Project name
              </label>
              <Input
                id="create-project-name"
                value={formState.name}
                onChange={(event) => updateProjectName(event.target.value)}
                placeholder="Payments Platform"
                disabled={isLoading}
              />
              <p className="rounded-xl border border-surface-border bg-surface px-3 py-2 font-mono text-xs text-copy-muted">
                {getSlugPreview(formState.slug)}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={closeDialog}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmitName || isLoading}>
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <form onSubmit={handleRenameSubmit} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>Rename Project</DialogTitle>
              <DialogDescription>
                Current project: {activeProject?.name ?? "Unknown project"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2">
              <label
                htmlFor="rename-project-name"
                className="text-sm font-medium text-copy-primary"
              >
                Project name
              </label>
              <Input
                id="rename-project-name"
                value={formState.name}
                onChange={(event) => updateProjectName(event.target.value)}
                disabled={isLoading}
                autoFocus
              />
              <p className="rounded-xl border border-surface-border bg-surface px-3 py-2 font-mono text-xs text-copy-muted">
                {getSlugPreview(formState.slug)}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={closeDialog}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmitName || isLoading}>
                Rename Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <form onSubmit={handleDeleteSubmit} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>
                Delete {activeProject?.name ?? "this project"}? This project
                will be removed from your project list.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={closeDialog}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!activeProject || isLoading}
              >
                Delete Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
