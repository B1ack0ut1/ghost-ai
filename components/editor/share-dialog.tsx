"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Check, Copy, Mail, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Collaborator {
  avatarUrl: string | null;
  email: string;
  name: string | null;
}

interface ShareDialogProps {
  canManageAccess: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  projectId: string;
  projectName: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getResponseError(body: unknown, fallback: string) {
  if (!isRecord(body) || !isRecord(body.error)) {
    return fallback;
  }

  return typeof body.error.message === "string" ? body.error.message : fallback;
}

function parseCollaborators(body: unknown): Collaborator[] | null {
  if (!isRecord(body) || !Array.isArray(body.collaborators)) {
    return null;
  }

  const collaborators: Collaborator[] = [];

  for (const collaborator of body.collaborators) {
    if (!isRecord(collaborator) || typeof collaborator.email !== "string") {
      return null;
    }

    collaborators.push({
      avatarUrl:
        typeof collaborator.avatarUrl === "string" ? collaborator.avatarUrl : null,
      email: collaborator.email,
      name: typeof collaborator.name === "string" ? collaborator.name : null,
    });
  }

  return collaborators;
}

async function readResponse(response: Response) {
  return (await response.json().catch(() => null)) as unknown;
}

function getInitials(name: string | null, email: string) {
  const source = name || email;
  const initials = source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "?";
}

export function ShareDialog({
  canManageAccess,
  onOpenChange,
  open,
  projectId,
  projectName,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller = new AbortController();

    async function loadCollaborators() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(
          `/api/projects/${encodeURIComponent(projectId)}/collaborators`,
          { signal: controller.signal },
        );
        const body = await readResponse(response);

        if (!response.ok) {
          throw new Error(
            getResponseError(body, "Collaborators could not be loaded."),
          );
        }

        const nextCollaborators = parseCollaborators(body);

        if (!nextCollaborators) {
          throw new Error("Collaborators could not be loaded.");
        }

        setCollaborators(nextCollaborators);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Collaborators could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadCollaborators();

    return () => controller.abort();
  }, [open, projectId]);

  useEffect(() => {
    if (!isCopied) {
      return;
    }

    const timeoutId = window.setTimeout(() => setIsCopied(false), 2_000);

    return () => window.clearTimeout(timeoutId);
  }, [isCopied]);

  async function updateCollaborators(method: "POST" | "DELETE", targetEmail: string) {
    const response = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/collaborators`,
      {
        body: JSON.stringify({ email: targetEmail }),
        headers: { "Content-Type": "application/json" },
        method,
      },
    );
    const body = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        getResponseError(
          body,
          method === "POST"
            ? "Collaborator could not be invited."
            : "Collaborator could not be removed.",
        ),
      );
    }

    const nextCollaborators = parseCollaborators(body);

    if (!nextCollaborators) {
      throw new Error("Collaborator list could not be updated.");
    }

    setCollaborators(nextCollaborators);
  }

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const invitedEmail = email.trim();

    if (!invitedEmail || isLoading || removingEmail !== null || !canManageAccess) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await updateCollaborators("POST", invitedEmail);
      setEmail("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Collaborator could not be invited.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemove(targetEmail: string) {
    if (isLoading || removingEmail || !canManageAccess) {
      return;
    }

    setRemovingEmail(targetEmail);
    setErrorMessage(null);

    try {
      await updateCollaborators("DELETE", targetEmail);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Collaborator could not be removed.",
      );
    } finally {
      setRemovingEmail(null);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
    } catch {
      setErrorMessage("Project link could not be copied.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share {projectName}</DialogTitle>
          <DialogDescription>
            {canManageAccess
              ? "Invite teammates to collaborate on this workspace."
              : "People with access to this workspace."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          {canManageAccess ? (
            <>
              <form onSubmit={handleInvite} className="flex gap-2">
                <label className="sr-only" htmlFor="collaborator-email">
                  Collaborator email address
                </label>
                <Input
                  id="collaborator-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || removingEmail !== null || email.trim().length === 0}
                >
                  <Mail className="h-4 w-4" />
                  Invite
                </Button>
              </form>

              <Button
                type="button"
                variant="secondary"
                onClick={handleCopyLink}
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {isCopied ? "Copied!" : "Copy project link"}
              </Button>
            </>
          ) : null}

          {errorMessage ? (
            <p className="text-sm text-error" aria-live="polite">
              {errorMessage}
            </p>
          ) : null}

          <section aria-labelledby="collaborators-heading" className="grid gap-3">
            <div className="flex items-center justify-between">
              <h3 id="collaborators-heading" className="text-sm font-medium text-copy-primary">
                Collaborators
              </h3>
              {isLoading ? <span className="text-xs text-copy-muted">Loading…</span> : null}
            </div>

            {collaborators.length > 0 ? (
              <ScrollArea className="max-h-60 pr-3">
                <ul className="grid gap-2">
                  {collaborators.map((collaborator) => (
                    <li
                      key={collaborator.email}
                      className="flex items-center gap-3 rounded-2xl border border-surface-border bg-surface px-3 py-2.5"
                    >
                      {collaborator.avatarUrl ? (
                        // Clerk avatar hosts are instance-specific, so a native image
                        // avoids a hard-coded Next image remote-pattern allowlist.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={collaborator.avatarUrl}
                          alt=""
                          className="h-9 w-9 rounded-full border border-surface-border object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-subtle text-xs font-medium text-copy-secondary"
                        >
                          {getInitials(collaborator.name, collaborator.email)}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        {collaborator.name ? (
                          <span className="block truncate text-sm font-medium text-copy-primary">
                            {collaborator.name}
                          </span>
                        ) : null}
                        <span className="block truncate text-sm text-copy-muted">
                          {collaborator.email}
                        </span>
                      </span>
                      {canManageAccess ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${collaborator.email}`}
                          disabled={isLoading || removingEmail !== null}
                          onClick={() => void handleRemove(collaborator.email)}
                        >
                          <Trash2 className="h-4 w-4 text-error" />
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : !isLoading ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-surface-border bg-surface px-4 py-7 text-center">
                <UserRound className="h-5 w-5 text-copy-muted" />
                <p className="text-sm text-copy-muted">
                  {canManageAccess
                    ? "Invite a collaborator to start sharing this project."
                    : "No collaborators have been added yet."}
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
