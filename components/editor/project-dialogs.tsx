"use client";

import { type FormEvent } from "react";

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
import { type useProjectActions } from "@/hooks/use-project-actions";

interface ProjectDialogsProps {
  controller: ReturnType<typeof useProjectActions>;
}

function getRoomIdPreview(roomId: string) {
  return roomId || "untitled-project";
}

export function ProjectDialogs({ controller }: ProjectDialogsProps) {
  const {
    activeProject,
    canSubmitName,
    closeDialog,
    dialogType,
    errorMessage,
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
                disabled={isLoading}
              />
              <p
                className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-copy-muted"
                aria-live="polite"
              >
                <span>Room ID:</span>
                <code className="font-mono text-xs text-copy-secondary">
                  {getRoomIdPreview(formState.roomId)}
                </code>
              </p>
              {errorMessage ? (
                <p className="text-sm text-error" aria-live="polite">
                  {errorMessage}
                </p>
              ) : null}
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
              {errorMessage ? (
                <p className="text-sm text-error" aria-live="polite">
                  {errorMessage}
                </p>
              ) : null}
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
            {errorMessage ? (
              <p className="text-sm text-error" aria-live="polite">
                {errorMessage}
              </p>
            ) : null}

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
