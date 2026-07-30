import { LockKeyhole } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-base px-6 text-copy-primary">
      <section className="max-w-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-border bg-elevated text-copy-muted">
          <LockKeyhole className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">Workspace unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-copy-secondary">
          You do not have access to this project, or it no longer exists.
        </p>
        <Button asChild className="mt-6">
          <Link href="/editor">Back to projects</Link>
        </Button>
      </section>
    </main>
  );
}
