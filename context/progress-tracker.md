# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 01: Design System - Completed
- Feature 02: Editor Chrome - Completed
- Clerk Authentication Setup - Completed
- Feature 03: Authentication - Completed
- Feature 04: Project Dialogs - Completed
- Feature 05: Prisma Project Metadata - Completed

## Current Goal

- Feature 05 Prisma project metadata is complete. The project/collaborator schema, cached Prisma client, migration, generated client, and build verification are in place.

## Completed

- Feature 01: Design System
  Added the initial design-system foundation with dark-theme token wiring, shared `cn()` utilities, and the following shadcn-style UI primitives: button, card, dialog, input, tabs, textarea, and scroll area. The homepage showcase was also added to verify the components render consistently.
- Feature 02: Editor Chrome
  Added `EditorNavbar` with fixed-height top chrome, left sidebar toggle controls using `PanelLeftOpen` / `PanelLeftClose`, structural center/right sections, and token-based dark styling. Added `ProjectSidebar` as a floating, fixed-position slide-in shell with project tabs, empty states, close control, and a bottom `New Project` action. Confirmed the existing dialog primitive already supports title, description, and footer actions, and updated its overlay to use the shared `bg-base` token.
- Clerk Authentication Setup
  Installed the Clerk CLI, authenticated it locally, linked the repository to Clerk application `app_3GBFPjkToo3pAgSxqjoaJCu3Uqn`, installed `@clerk/nextjs`, pulled development environment variables into `.env.local`, added the initial `ClerkProvider`, generated sign-in/sign-up routes, and added a Next.js `proxy.ts` auth boundary.
- Feature 03: Authentication
  Added Clerk's `dark` theme from `@clerk/ui/themes` as the provider base with app CSS-variable overrides. Reworked sign-in and sign-up into minimal responsive auth pages with a two-panel large-screen layout and form-only mobile layout, then refined the left auth panel to match the requested brand/tagline/feature-list reference. Updated `proxy.ts` to use the existing Clerk sign-in/sign-up env vars for public auth routes, redirect `/` to `/sign-in` or `/editor`, and protect all other routes by default. Added Clerk `UserButton` to the editor navbar and created a minimal protected `/editor` shell so authenticated redirects have a real destination.
- Feature 04: Project Dialogs
  Restored `context/feature-specs/04-project-dialogs.md` after the workspace clean removed the untracked feature spec. Added the `/editor` home screen with the specified heading, description, and `New Project` action. Added a dedicated `useProjectDialogs` hook under `components/editor/hooks/` to manage dialog state, form state, loading state, mock project data, and local create/rename/delete mutations. Added create, rename, and delete project dialogs with live slug preview, rename autofocus/Enter submit, destructive delete styling, and no persistence. Updated the project sidebar with mock owned/shared project lists, owner-only rename/delete actions, wired create action, and a mobile backdrop scrim that closes the sidebar when tapped.
- Feature 05: Prisma Project Metadata
  Added `ProjectStatus`, `Project`, and `ProjectCollaborator` in `prisma/models/project.prisma` with owner/collaborator metadata, cascade deletion, unique project/email collaborators, and requested indexes. Added the cached server-only Prisma client in `lib/prisma.ts`, branching between `prisma+postgres://` Accelerate URLs and direct `@prisma/adapter-pg` connections. Added and applied migration `20260718010322_add_project_metadata`, generated the Prisma client, and verified the app build.

## In Progress

- None.

## Next Up

- Build the persisted project list/create flow once the next feature unit is specified.

## Open Questions

- Should future feature specs follow the same tracker format: feature status, implementation summary, architecture decisions, and package/install notes?

## Architecture Decisions

- Feature 01 spec decision: the project uses `shadcn/ui` as the component library base, with primitives living in `components/ui/`.
- Feature 01 spec decision: generated third-party foundation components in `components/ui/*` should remain reusable and should not be modified after installation unless a future task explicitly requires it.
- Feature 01 spec decision: the design system must align to the existing dark token system in `app/globals.css`, with no default light styling.
- Implementation decision: Geist and Geist Mono are sourced from bundled local assets via `next/font/local` so the app builds offline in this workspace while preserving the intended typography variables and dark visual language.
- Implementation decision: `lib/utils.ts` provides the shared `cn()` helper using `clsx` plus `tailwind-merge` for Tailwind-safe class composition.
- Implementation decision: the installed primitive set for Feature 01 is button, card, dialog, input, tabs, textarea, and scroll area.
- Implementation decision: public auth routes are derived from the existing Clerk sign-in/sign-up env vars in `proxy.ts`; all other routes are protected by default.
- Implementation decision: the root route (`/`) is a redirect boundary handled in `proxy.ts` and mirrored in `app/page.tsx`: signed-out users go to sign-in, signed-in users go to `/editor`.
- Implementation decision: Clerk appearance is configured with Clerk's `dark` theme plus CSS custom-property overrides in `ClerkProvider` to keep hosted auth UI aligned with the app's dark token system.
- Feature 04 implementation decision: project create/rename/delete behavior is local-only mock state in `useProjectDialogs`; no API routes, database persistence, or artifact storage were added.
- Feature 04 implementation decision: editor-specific hooks live under `components/editor/hooks/` so feature-local state stays close to the editor UI without becoming app-wide shared infrastructure.
- Feature 05 implementation decision: `ProjectCollaborator` uses the required project/email fields plus timestamps and a composite unique constraint, without a surrogate ID.
- Feature 05 implementation decision: `prisma.config.ts` decodes local `prisma+postgres://` API keys into direct database and shadow database URLs for Prisma CLI migrations, while app runtime code keeps using `DATABASE_URL` for the Accelerate/direct-client branch.

## Session Notes

- Framework baseline: Next.js `16.2.6`, React `19.2.4`, React DOM `19.2.4`, TypeScript `^5`, Tailwind CSS `^4`.
- Feature 01 installs added: `@radix-ui/react-dialog@^1.1.13`, `@radix-ui/react-scroll-area@^1.2.8`, `@radix-ui/react-slot@^1.2.3`, `@radix-ui/react-tabs@^1.1.11`, `class-variance-authority@^0.7.1`, `clsx@^2.1.1`, `lucide-react@^0.539.0`, and `tailwind-merge@^3.3.1`.
- Clerk setup installs added: `@clerk/nextjs@^7.5.13`. The global Clerk CLI is installed and `clerk doctor` verifies the development instance environment variables are present.
- Feature 03 installs added: `@clerk/ui`.
- Verification completed for Feature 01 with `npm.cmd run lint` and `npm.cmd run build`.
- The root route now redirects users based on auth state; the old design-system showcase component remains available in `components/design-system-showcase.tsx` but is no longer mounted at `/`.
- Feature 02 verification completed with `.\node_modules\.bin\tsc.cmd --noEmit`, `npm.cmd run lint`, and `npm.cmd run build`.
- Clerk setup verification completed with `clerk doctor`, `.\node_modules\.bin\tsc.cmd --noEmit`, `npm.cmd run lint`, `npm.cmd run build`, and local HTTP checks against `http://localhost:3000`, `/sign-in`, and `/sign-up`.
- Feature 03 verification completed with `.\node_modules\.bin\tsc.cmd --noEmit`, `npm.cmd run lint`, `npm.cmd run build`, and local HTTP checks for `/`, `/sign-in`, `/sign-up`, and protected `/editor` browser-style navigation.
- Feature 03 sign-in visual refinement verification completed with `.\node_modules\.bin\tsc.cmd --noEmit`, `npm.cmd run lint`, and `npm.cmd run build`.
- Feature 04 verification completed with `.\node_modules\.bin\tsc.cmd --noEmit`, `npm.cmd run lint`, and `npm.cmd run build`.
- Feature 05 setup note: corrected the local ignored `.env` and `.env.local` `DATABASE_URL==` typo to `DATABASE_URL=` so Prisma can parse the configured URL.
- Feature 05 migration note: started the local Prisma Postgres instance with `.\node_modules\.bin\prisma.cmd dev --detach`, applied `20260718010322_add_project_metadata` with `.\node_modules\.bin\prisma.cmd migrate deploy`, and confirmed `.\node_modules\.bin\prisma.cmd migrate status` reports the database schema is up to date.
- Feature 05 verification completed with `.\node_modules\.bin\prisma.cmd validate`, `.\node_modules\.bin\prisma.cmd generate`, `.\node_modules\.bin\tsc.cmd --noEmit`, `npm.cmd run lint`, and `npm.cmd run build`.
