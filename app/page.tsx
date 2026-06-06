import { DesignSystemShowcase } from "@/components/design-system-showcase";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col justify-center gap-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-copy-muted">
            Ghost AI
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-copy-primary sm:text-5xl">
            A dark workspace foundation for design-system driven product work.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-copy-secondary">
            The initial shadcn/ui primitives are installed and themed to the
            shared Ghost AI palette so future canvas and workspace screens can
            build on one consistent visual language.
          </p>
        </div>

        <DesignSystemShowcase />
      </div>
    </main>
  );
}
