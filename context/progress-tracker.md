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
- Feature 10: Liveblocks Setup - Completed
- Feature 11: Base Canvas - Completed
- Feature 12: Shape Panel - Completed
- Feature 13: Node Shape - Completed
- Feature 14: Note Editing - Completed
- Feature 15: Node Color Toolbar - Completed
- Feature 16: Edge Behavior - Completed
- Feature 17: Canvas Ergonomics - Completed
- Feature 18: Starter Templates - Completed

## Current Goal

- Feature 18 Starter Templates is complete. The collaborative canvas can replace its current graph with a pre-built microservices, CI/CD, or event-driven system template.

## Completed

- Feature 18: Starter Templates
  Added a typed static template library for microservices, CI/CD, and event-driven system diagrams using the shared canvas schema and palette. Added a navbar entry point and a dialog with scrollable template cards and lightweight SVG previews that calculate fitted bounds from node positions. Importing a template removes the current Liveblocks nodes and edges, adds the selected graph through the existing change handlers, and fits the resulting view.
- Shared button cursor affordance
  Added `cursor-pointer` to the reusable enabled button base style so template import actions and every standard button visibly communicate clickability.
- Starter template card refinement
  Made template previews full-bleed card headers, clipped by the card border, while keeping the description and import action in a padded card body.
- Starter template import action refinement
  Updated the import action to use the card-surface outline treatment from the approved reference, matching the description section background.
- Starter template import hover refinement
  Added a subtle elevated-surface hover fill to the outline import action.
- Feature 17: Canvas Ergonomics
  Added a bottom-left floating control bar with animated React Flow zoom-out, fit-view, and zoom-in actions, plus Liveblocks history undo and redo actions that dim when unavailable. Added `hooks/use-keyboard-shortcuts.ts` to provide zoom and history shortcuts outside editable fields, and removed the canvas minimap.
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
- Feature 10: Liveblocks Setup
  Added typed Liveblocks presence and user metadata, a cached server-only Liveblocks client with deterministic cursor colors, and `POST /api/liveblocks-auth`. The auth route verifies Clerk authentication and project membership, creates the project-ID room only when absent, then issues a room-scoped write session token with the Clerk user’s display name, avatar, and color.
- Feature 11: Base Canvas
  Replaced the workspace canvas placeholder with a Liveblocks-backed React Flow canvas. Added room-scoped `LiveblocksProvider`/`RoomProvider` setup, suspense loading and Liveblocks connection-error states, and `useLiveblocksFlow`-managed empty initial nodes and edges. The base canvas uses loose connections, fit-to-view, and a dot background. Added shared canvas node/edge contracts, supported node colors, and supported shapes in `types/canvas.ts`.
- Feature 12: Shape Panel
  Added a floating bottom-center shape toolbar with rectangle, diamond, circle, pill, cylinder, and hexagon controls. Pointer-drag state carries the selected shape and its default dimensions. A local pointer-following overlay preserves the pointer’s original grab point on the shape and places the green plus badge overlapping the preview’s lower-right edge, then a release over the canvas is converted to React Flow coordinates and added through the Liveblocks flow change handler with timestamp-and-counter IDs, default node color, an empty label, and the custom canvas node type. This avoids native browser drag ghosts while leaving existing React Flow node dragging unchanged. Added the initial custom renderer, which intentionally displays every shape as a bordered rectangle until shape-specific rendering is introduced.
- Feature 13: Node Shape
  Replaced the placeholder node renderer with a shared shape surface. Rectangle, pill, and circle use CSS geometry; diamond, hexagon, and cylinder use scalable inline SVGs. Shape borders use the subtle canvas border at rest and the brand accent when selected. The existing pointer-drag overlay now reuses the same shape surface at the exact default node dimensions and retains the overlapping green plus badge. Nodes continue to be created and synchronized through the existing `useLiveblocksFlow` change handler.
- Feature 14: Note Editing
  Added React Flow resize controls that appear only for selected nodes, use subtle dark-canvas styling, and enforce an 80 by 48 pixel minimum size. Added centered inline label editing: double-clicking the label opens a same-position textarea with an `Untitled node` placeholder, updates the node through the existing Liveblocks flow handler as text changes, and closes on blur or Escape. Text editing uses React Flow's `nodrag`, `nopan`, and `nowheel` interaction guards.
- Feature 15: Node Color Toolbar
  Added a floating selected-node toolbar using the existing eight predefined fill/text color pairs. Each swatch shows its paired theme, has an accessible color name, uses a tightly controlled text-color glow on hover, and has a clear active ring. Selecting a swatch replaces the node through the existing Liveblocks flow state, so its fill updates immediately and the renderer automatically applies the matching text color. Toolbar interactions use React Flow interaction guards and stop pointer propagation, preventing node dragging and canvas panning.
- Feature 16: Edge Behavior
  Added a custom smooth-step edge renderer with rounded light strokes, end arrowheads, dimmed resting state, active hover/selection treatment, and a wider invisible interaction area. New connections are created through the existing collaborative edge change handler with the custom type, style, marker, and empty label data. Double-clicking an edge opens an auto-sizing inline input in React Flow's `EdgeLabelRenderer` at the midpoint returned by `getSmoothStepPath`; labels save on blur, Enter, or Escape, render as pill badges, and use the same collaborative replacement flow as all other edge updates. Active unlabeled edges display a faint editing hint, and all label interactions are protected from canvas panning and dragging.
- Canvas resize and connection controls
  Replaced visible side resize dots with selected-only edge resize zones, so dragging a node's top or bottom edge changes height and dragging its left or right edge changes width. Added four small white source handles, revealed on node hover at the top, right, bottom, and left midpoints. The canvas remains in React Flow loose connection mode, so these same handles can start or receive connections, with existing `onConnect` synchronization retained.
- Canvas node dragging fix
  Limited React Flow's `nodrag` class to the active inline-editing state. The centered label area is draggable again when not editing, while the textarea remains protected from node dragging and canvas panning.
- Canvas label editing alignment fix
  Positioned the inline editing textarea at the vertical center of its node, matching the resting label position so the caret and typed text do not jump to the top edge.
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
- Share dialog collaborator-load cancellation
  Clears the previous project’s collaborator rows when a new load begins and prevents cleaned-up or superseded requests from updating loading, error, or collaborator state.

## In Progress

- None.

## Next Up

- Implement the next specified feature on the collaborative canvas foundation.

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
- Feature 10 implementation decision: Liveblocks uses server-issued room-scoped session tokens and private default room access. Existing application-level project membership remains the source of authorization, and the persisted project ID is the Liveblocks room ID.
- Feature 11 implementation decision: React Flow state is synchronized directly through `useLiveblocksFlow` under each project’s existing Liveblocks room. This unit intentionally initializes an empty diagram and does not add a separate canvas-snapshot persistence path.
- Feature 12 implementation decision: shape drops create nodes by passing an add change to `useLiveblocksFlow`’s `onNodesChange` handler, so newly dropped nodes share the same synchronized state path as all other canvas node changes.
- Runtime fix decision: app runtime now also decodes `prisma+postgres://` API keys with embedded direct database URLs and uses `@prisma/adapter-pg` for local Prisma Postgres connections. This avoids the fetch-backed Prisma client path during local development.
- Runtime fix decision: project-access identity resolves email addresses through Clerk’s Backend API using the authenticated user ID, with session-claim email fields retained only as a resilience fallback. The workspace and editor-home project lists share the same resolved identity during a workspace render.
- Runtime fix decision: the cached Prisma singleton now tracks a connection signature and recreates the client when the runtime connection mode changes, preventing a Next dev process from reusing a stale fetch-backed Prisma client after hot reload.
- Runtime fix decision: when a connection-signature mismatch replaces the cached development Prisma client, the old client is asynchronously disconnected after replacement creation so the new client remains immediately available.
- Feature 16 implementation decision: custom connections are added as `CanvasEdge` change items instead of the Liveblocks helper's plain `onConnect` callback, so every new persisted edge includes the required custom edge type, marker, style, and label data while continuing to synchronize through `onEdgesChange`.
- Feature 17 implementation decision: canvas zoom uses the React Flow instance with a 180 ms transition; Liveblocks history remains the source of truth for undo and redo availability and actions.
- Feature 18 implementation decision: starter templates are static codebase data and are applied through the existing Liveblocks node and edge change handlers, preserving the shared canvas as the only source of graph state.

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
- Clerk Backend API timeout and error visibility verification completed with targeted ESLint for the changed `lib/` modules and `git diff --check`. Repository-wide `npm.cmd run lint` and `.\node_modules\.bin\tsc.cmd --noEmit` now pass; the previously reported syntax error at `app/editor/[roomId]/page.tsx:46` is no longer present.
- Shared collaborator mutation validation verification completed with targeted ESLint for the collaborators route and `git diff --check`.
- Explicit workspace navbar contract verification completed with targeted ESLint for the navbar shells and `git diff --check`.
- Share dialog collaborator-load cancellation verification completed with targeted ESLint and `git diff --check`.
- Feature 10 installs added: `@liveblocks/node@^3.23.0`, the server SDK required to create rooms and issue room-scoped session tokens.
- Feature 10 verification completed with `.\\node_modules\\.bin\\tsc.cmd --noEmit`, `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check`.
- Feature 11 verification completed with `.\\node_modules\\.bin\\tsc.cmd --noEmit`, `npm.cmd run lint`, and `npm.cmd run build`.
- Feature 12 verification completed with `.\\node_modules\\.bin\\tsc.cmd --noEmit`, `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check`.
- Feature 13 verification completed with `.\\node_modules\\.bin\\tsc.cmd --noEmit`, `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check`.
- Feature 14 verification completed with `.\\node_modules\\.bin\\tsc.cmd --noEmit`, `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check`.
- Feature 15 verification completed with targeted `npm.cmd run lint`, `.\\node_modules\\.bin\\tsc.cmd --noEmit`, and `npm.cmd run build`.
- Canvas resize and connection controls verification completed with `.\\node_modules\\.bin\\tsc.cmd --noEmit`, `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check`.
- Canvas node dragging fix verification completed with `.\\node_modules\\.bin\\tsc.cmd --noEmit`, `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check`.
- Canvas label editing alignment fix verification completed with `.\\node_modules\\.bin\\tsc.cmd --noEmit`, `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check`.
- Feature 16 verification completed with `.\\node_modules\\.bin\\tsc.cmd --noEmit`, focused `npm.cmd run lint -- components/editor/canvas-edge.tsx components/editor/collaborative-canvas.tsx types/canvas.ts`, `npm.cmd run build`, and `git diff --check`.
- Feature 17 verification completed with `.\\node_modules\\.bin\\tsc.cmd --noEmit`, focused `npm.cmd run lint -- components/editor/collaborative-canvas.tsx hooks/use-keyboard-shortcuts.ts`, `npm.cmd run build`, and `git diff --check`.
- Feature 18 verification completed with `.\\node_modules\\.bin\\tsc.cmd --noEmit`, focused `npm.cmd run lint -- components/editor/starter-templates.ts components/editor/starter-templates-modal.tsx components/editor/collaborative-canvas.tsx components/editor/editor-navbar.tsx components/editor/editor-workspace-shell.tsx`, `npm.cmd run build`, and `git diff --check`.
- Shared button cursor affordance verification completed with focused ESLint and `git diff --check`.
- Starter template card refinement verification completed with focused ESLint and `git diff --check`.
- Starter template import action refinement verification completed with focused ESLint and `git diff --check`.
- Starter template import hover refinement verification completed with focused ESLint and `git diff --check`.
