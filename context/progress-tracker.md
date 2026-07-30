# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 01: Design System - Completed
- Feature 02: Editor Chrome - Completed
- Clerk Authentication Setup - Completed
- Feature 03: Authentication - Completed
- Feature 04: Project Dialogs - Completed
- Feature 05: Prisma Project Metadata - Completed
- Feature 06: Project APIs - Completed
- Feature 07: Wire Editor Home - Completed
- Feature 08: Editor Workspace Shell - Completed
- Feature 09: Share Dialog - Completed

## Current Goal

- Feature 09 Share Dialog is complete. Workspace members can inspect the current collaborator list, while owners can invite by email, remove collaborators, and copy the project link.

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
- Feature 06: Project APIs
  Added `GET /api/projects`, `POST /api/projects`, `PATCH /api/projects/[projectId]`, and `DELETE /api/projects/[projectId]`. Project creation uses the authenticated Clerk user ID as `ownerId`, defaults missing or blank names to `Untitled Project`, and relies on the schema's cuid ID strategy. Rename and delete verify the project exists and that the current user is the owner before mutating. Added shared API helpers for project response selection, JSON body parsing, project name validation, and consistent JSON error responses.
- Feature 07: Wire Editor Home
  Replaced mock project state with server-loaded owned/shared project lists and a root-level `useProjectActions` hook for dialog state and persisted create/rename/delete mutations. Added room ID preview generation with a short suffix, optional validated create IDs in `POST /api/projects`, sidebar workspace links, refresh/redirect behavior after mutations, and an initial minimal workspace route so create/open navigation has a real destination.
- Feature 08: Editor Workspace Shell
  Replaced the minimal workspace route with the `/editor/[roomId]` server component. Added shared Clerk identity and project-access helpers, a centered access-denied state for missing or unauthorized projects, and a full-viewport project-aware workspace shell with the existing highlighted project sidebar, project navbar, canvas placeholder, and toggleable AI-sidebar placeholder.
- Feature 09: Share Dialog
  Added a workspace Share action and dialog backed by `GET`, `POST`, and `DELETE /api/projects/[projectId]/collaborators`. Project members can list collaborators; ownership is enforced server-side for invitation and removal. Collaborator records remain email-based in PostgreSQL and are enriched at read time through Clerk's Backend API with display names and avatars when available, falling back to the stored email. Owners can invite, remove, and copy the current workspace URL with temporary confirmation; collaborators receive a read-only dialog.
- Shared-project Clerk email resolution fix
  Updated project-access identity resolution to load the authenticated user’s email addresses through Clerk’s Backend API. This ensures email-based collaborator access and the shared-project sidebar work for sign-in methods whose session claims do not include an email address, including Google sign-in.
- Project dialog UI refinement
  Removed the example placeholder from the Create Project name field so the persistent label carries the field meaning, and changed the generated Room ID preview from an input-like bordered surface into quiet inline key/value metadata.
- Project dialog error announcements
  Added polite live-region announcements to create, rename, and delete project dialog error messages while preserving the existing conditional rendering and error styling.
- Project API Prisma error handling
  Added targeted Prisma known request error handling around project create, rename, and delete mutations. Duplicate project IDs now return `409 PROJECT_ALREADY_EXISTS`, and late missing-row races during rename/delete return the existing `404 PROJECT_NOT_FOUND` response.
- Project sidebar prefetch control
  Disabled automatic Next.js prefetching for project workspace links in the sidebar while preserving the existing client-side navigation and accessible link behavior.
- Prisma client stale-connection cleanup
  When the development Prisma singleton's connection signature changes, the replacement client is created and the prior client is asynchronously disconnected.
- Clerk Backend API timeout and error visibility
  Added a five-second timeout around Clerk user and collaborator-list lookups, and log lookup failures before preserving the existing resilient email-only fallback.
- Shared email normalization
  Centralized trim-and-lowercase email normalization in a shared utility used by project-access and collaborator flows.
- Shared collaborator mutation validation
  Centralized authentication, JSON parsing, email validation, and ownership checks for collaborator invite and removal requests while preserving their response behavior.
- Typed collaborator access results
  Added explicit success/error result unions for collaborator ownership validation so TypeScript reliably narrows error responses before mutations.
- Explicit workspace navbar contract
  Made workspace-only navbar controls an explicit discriminated prop state, requiring their project and callback data whenever they are rendered.

## In Progress

- None.

## Next Up

- Build the collaborative canvas once the next feature unit is specified.

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
- Feature 05 implementation decision: `prisma.config.ts` decodes local `prisma+postgres://` API keys into direct database and shadow database URLs for Prisma CLI migrations.
- Feature 06 implementation decision: project API responses use `{ projects }` for lists, `{ project }` for create/rename, `{ projectId }` for delete, and `{ error: { code, message } }` for errors.
- Feature 06 implementation decision: `/api/projects` routes are excluded from `auth.protect()` in `proxy.ts` so unauthenticated API requests reach the route handlers and return the spec-required JSON `401`; all other non-public routes remain protected by the proxy.
- Feature 07 implementation decision: `POST /api/projects` now accepts an optional validated lowercase `id` so the editor-generated Liveblocks room ID and persisted project ID can stay aligned. Requests that omit `id` still use Prisma's schema default.
- Feature 07 implementation decision: project list data for the editor is loaded server-side through `lib/project-data.ts`; the client hook performs mutations only and then navigates or refreshes via the Next router.
- Feature 07 implementation decision: project workspace links use the persisted project ID as the room ID so project selection and the future Liveblocks room identifier remain aligned.
- Feature 08 implementation decision: `/editor/[roomId]` resolves project access through `lib/project-access.ts`; a missing project and an unauthorized project intentionally share the same `AccessDenied` response to avoid revealing project existence.
- Feature 08 implementation decision: the workspace shell is client-side only for sidebar controls and project dialogs, while its page and access checks remain server-side.
- Feature 09 implementation decision: `ProjectCollaborator` remains the sole source of access-list membership and stores only email addresses; Clerk users are resolved at request time through `clerkClient().users.getUserList()` and a Clerk lookup failure intentionally degrades to email-only list entries.
- Feature 09 implementation decision: collaborator listing permits any current project member, while the invite and removal endpoints independently verify the authenticated requester is the project owner.
- Runtime fix decision: app runtime now also decodes `prisma+postgres://` API keys with embedded direct database URLs and uses `@prisma/adapter-pg` for local Prisma Postgres connections. This avoids the fetch-backed Prisma client path during local development.
- Runtime fix decision: project-access identity resolves email addresses through Clerk’s Backend API using the authenticated user ID, with session-claim email fields retained only as a resilience fallback. The workspace and editor-home project lists share the same resolved identity during a workspace render.
- Runtime fix decision: the cached Prisma singleton now tracks a connection signature and recreates the client when the runtime connection mode changes, preventing a Next dev process from reusing a stale fetch-backed Prisma client after hot reload.
- Runtime fix decision: when a connection-signature mismatch replaces the cached development Prisma client, the old client is asynchronously disconnected after replacement creation so the new client remains immediately available.

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
- Feature 06 verification completed with `.\node_modules\.bin\tsc.cmd --noEmit`, `npm.cmd run lint`, and `npm.cmd run build`.
- Feature 06 runtime smoke test: started `npm.cmd run dev` on `http://localhost:3000` and confirmed unauthenticated `GET /api/projects`, `POST /api/projects`, `PATCH /api/projects/test-project`, and `DELETE /api/projects/test-project` return JSON `401` responses from the route handlers.
- Feature 07 verification completed with `npm.cmd run lint`, `npm.cmd run build`, and `.\node_modules\.bin\tsc.cmd --noEmit`. The first standalone `tsc` run hit stale generated Next route types for `/editor/[projectId]`; rerunning after `next build` regenerated `.next/types` and passed.
- Runtime fix verification: reproduced the project-list failure as Prisma `TypeError fetch failed` on the `prisma+postgres://` runtime path, confirmed the embedded direct URL points at local Prisma Postgres, started the local database with `.\node_modules\.bin\prisma.cmd dev --detach`, verified a direct `Project.findMany` query succeeds, and reran `npm.cmd run build`, `.\node_modules\.bin\tsc.cmd --noEmit`, and `npm.cmd run lint`.
- Runtime follow-up verification: `.\node_modules\.bin\prisma.cmd dev ls` reports the local Prisma Postgres `default` instance running on TCP port `51214`; after the singleton signature fix, `npm.cmd run build`, direct `Project.findMany`, `npm.cmd run lint`, and `.\node_modules\.bin\tsc.cmd --noEmit` all pass.
- Project dialog UI refinement verification completed with `npm.cmd run lint` and `.\node_modules\.bin\tsc.cmd --noEmit`.
- Project dialog error announcement verification completed with `.\node_modules\.bin\tsc.cmd --noEmit` and `npm.cmd run lint`.
- Project API Prisma error handling verification completed with `.\node_modules\.bin\tsc.cmd --noEmit`, `npm.cmd run lint`, and `npm.cmd run build`. The requested `@prisma/client/runtime/library` import path is not available in this Prisma 7 generated-client setup, so the handlers use the generated `Prisma.PrismaClientKnownRequestError` export instead.
- Project sidebar prefetch control verification completed with `npm.cmd run lint`.
- Prisma client stale-connection cleanup verification completed with `.\node_modules\.bin\tsc.cmd --noEmit` and `npm.cmd run lint`.
- Feature 08 verification completed with `npm.cmd run build`, `.\node_modules\.bin\tsc.cmd --noEmit`, `npm.cmd run lint`, and `git diff --check`.
- Feature 09 verification completed with `npm.cmd run lint`, `.\node_modules\.bin\tsc.cmd --noEmit`, `npm.cmd run build`, and `git diff --check`.
- Shared-project Clerk email resolution fix verification completed with `npm.cmd run lint` and `.\node_modules\.bin\tsc.cmd --noEmit`.
- Clerk Backend API timeout and error visibility verification completed with targeted ESLint for the changed `lib/` modules and `git diff --check`. Repository-wide lint and TypeScript checks remain blocked by a pre-existing syntax error at `app/editor/[roomId]/page.tsx:46` in an unrelated user-modified file.
- Shared collaborator mutation validation verification completed with targeted ESLint for the collaborators route and `git diff --check`.
- Explicit workspace navbar contract verification completed with targeted ESLint for the navbar shells and `git diff --check`.
