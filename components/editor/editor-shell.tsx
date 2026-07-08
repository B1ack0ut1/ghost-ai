"use client";

import { useState } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";

export function EditorShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <section className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="text-sm uppercase text-copy-muted">
            Editor
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-copy-primary">
            Your system design workspace is protected.
          </h1>
          <p className="mt-3 text-sm leading-6 text-copy-secondary">
            Project creation and collaborative canvas work will build on this
            authenticated editor shell.
          </p>
        </div>
      </section>
    </main>
  );
}
