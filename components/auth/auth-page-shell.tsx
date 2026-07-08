import type { LucideIcon } from "lucide-react";

interface AuthFeature {
  description: string;
  icon: LucideIcon;
  title: string;
}

interface AuthPageShellProps {
  children: React.ReactNode;
  description: string;
  features: AuthFeature[];
  tagline: string;
}

export function AuthPageShell({
  children,
  description,
  features,
  tagline,
}: AuthPageShellProps) {
  return (
    <main className="grid min-h-screen bg-base lg:grid-cols-2">
      <section className="hidden min-h-screen flex-col justify-between border-r border-surface-border bg-surface px-12 py-14 lg:flex xl:px-16">
        <div className="flex items-center gap-3">
          <span
            className="h-7 w-7 rounded-md bg-brand"
            aria-hidden="true"
          />
          <span className="text-base font-semibold text-copy-primary">
            Ghost AI
          </span>
        </div>

        <div className="mb-6 max-w-2xl space-y-10">
          <div className="max-w-xl space-y-5">
            <h1 className="text-4xl font-semibold leading-tight text-copy-primary xl:text-5xl">
              {tagline}
            </h1>
            <p className="text-lg leading-8 text-copy-muted">
              {description}
            </p>
          </div>

          <ul className="space-y-7">
            {features.map((feature) => (
              <li
                key={feature.title}
                className="grid grid-cols-[2rem_1fr] gap-4"
              >
                <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-lg border border-brand/30 bg-brand-dim text-brand">
                  <feature.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="space-y-1">
                  <span className="block text-base font-medium text-copy-secondary">
                    {feature.title}
                  </span>
                  <span className="block text-sm leading-6 text-copy-muted">
                    {feature.description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div aria-hidden="true" />
      </section>

      <section className="flex min-h-screen items-center justify-center bg-base px-4 py-6 lg:px-10">
        {children}
      </section>
    </main>
  );
}
