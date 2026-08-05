# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Editor route fix (complete)

## Current Goal

- Awaiting the next feature unit.

## Completed

- Design system and UI primitives (`context/feature-specs/01-design-system.md`): shadcn/ui installed (Radix UI base, Nova preset) with Button, Card, Dialog, Input, Tabs, Textarea, and ScrollArea added to `components/ui/`; `lucide-react` installed; `lib/utils.ts` `cn()` helper in place; dark-only theme tokens from `ui-context.md` wired into `app/globals.css`.
- Editor chrome (`context/feature-specs/02-editor.md`): `components/editor/editor-navbar.tsx` (fixed-height top navbar with left/center/right sections; left section toggles `PanelLeftOpen`/`PanelLeftClose` based on `isSidebarOpen`, controlled via `isSidebarOpen`/`onToggleSidebar` props), `components/editor/project-sidebar.tsx` (floating, non-pushing overlay that slides in from the left via `isOpen`/`onClose` props; `Projects` header with close button; `My Projects`/`Shared` shadcn `Tabs` with empty placeholder states; full-width `New Project` button with `Plus` icon), and `components/editor/app-dialog.tsx` (app-level wrapper around the untouched `components/ui/dialog.tsx` primitives, applying `rounded-3xl` + app tokens and exposing `title`/`description`/`footer` props — no concrete dialog instances built yet, per spec).
- Authentication (`context/feature-specs/03-auth.md`): `@clerk/ui` installed. `app/layout.tsx` wraps the tree in `ClerkProvider` using `appearance` from `lib/clerk-appearance.ts` (Clerk's `dark` theme from `@clerk/ui/themes`, with `variables` mapped onto the app's existing CSS custom properties — no hardcoded colors). `proxy.ts` at the project root uses `clerkMiddleware` + `createRouteMatcher` to treat `NEXT_PUBLIC_CLERK_SIGN_IN_URL`/`NEXT_PUBLIC_CLERK_SIGN_UP_URL` (and their sub-paths) as the only public routes, calling `auth.protect()` on everything else. `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx` render Clerk's `<SignIn/>`/`<SignUp/>` inside the new `components/auth/auth-layout.tsx` (two-panel on `lg:`, form-only below that, no gradients/hero/cards per spec). `app/page.tsx` (`/`) is now a server component that redirects to `/editor` if signed in, `/sign-in` otherwise. `components/editor/editor-navbar.tsx` gained a `<UserButton/>` in its previously-empty right slot for the "user menu" the spec's opening line calls for.
- Editor route fix (`context/current issues.md` — logged-in users were getting a 404 on `/editor` since only the chrome components existed, no route): added `app/editor/layout.tsx` (`"use client"`, owns `isSidebarOpen` state via `useState`, renders `EditorNavbar` + `ProjectSidebar` + `{children}`) and `app/editor/page.tsx` (server component, centered `"Canvas coming soon."` placeholder using the same empty-state convention as `ProjectSidebar`'s tab content). No canvas, Liveblocks, or AI sidebar behavior was added — those still have no feature spec. `/editor` now resolves and stays behind the proxy's auth check like every other protected route.

## In Progress

- None yet.

## Next Up

- Write a feature spec for the actual editor canvas (React Flow + Liveblocks per `architecture-context.md`) to replace the `/editor` placeholder — node/edge schema, room setup, snapshot persistence to Vercel Blob.
- Write a feature spec for the slide-over AI sidebar mentioned in `ui-context.md`'s layout patterns — not built anywhere yet.
- Add the next planned feature unit here.

## Open Questions

- `createRouteMatcher` (used in `proxy.ts` to define public routes) logs a Clerk deprecation warning on this installed version (`@clerk/nextjs@7.6.5`) — Clerk's own guidance is to move to resource-based auth checks in each page/route instead of path-matching middleware. `AGENTS.md` says to heed deprecation notices, but `03-auth.md` explicitly specifies this exact proxy.ts + public-routes pattern ("protect everything else by default"), and no per-page DAL exists yet to do resource-based checks. Implemented as specified; flagging for a future revisit once more routes/data-access exist.
- `@clerk/ui@1.28.0`'s published `package.json` requires `@clerk/localizations@^4.14.0`, but no non-prerelease `4.14.0` was available on the registry at install time (latest stable was `4.13.10`). Worked around with a `"overrides"` entry in `package.json` pinning `@clerk/localizations` to `4.13.10`. Revisit this override once a real `4.14.x` (or later) `@clerk/localizations` is published — it may no longer be necessary.

## Architecture Decisions

- `app/globals.css` now defines the raw design tokens from `ui-context.md` (`--bg-base`, `--text-primary`, `--accent-primary`, etc.) as the source of truth in `:root`, and maps shadcn's semantic tokens (`--background`, `--primary`, `--border`, `--ring`, `--sidebar*`, ...) onto them so the untouched `components/ui/*` files render the dark theme automatically. `--primary`/`--ring` use `--accent-primary` (cyan); `--secondary`/`--muted`/`--accent` use `--bg-subtle`; `--destructive` uses `--state-error`.
- App-level Tailwind utility names (`bg-base`, `bg-surface`, `bg-elevated`, `bg-subtle`, `border-surface-border`, `border-subtle-border`, `text-copy-primary/secondary/muted/faint`, `text-brand`/`bg-brand`, `bg-accent-dim`, `bg-ai`/`text-ai`, `text-ai-text`, `text-error`/`bg-error`, `text-success`/`bg-success`, `text-warning`/`bg-warning`) are exposed via `@theme inline` in `app/globals.css`. Only `bg-base`, `bg-surface`, `text-copy-primary`, `text-copy-muted`, `border-surface-border`, and `text-brand` were named explicitly in `ui-context.md`; the rest were inferred to follow the same naming convention — flagging here in case a different name is intended.
- This app is dark-only (per `ui-context.md`), so `app/layout.tsx` applies the `dark` class to `<html>` unconditionally instead of building a light/dark toggle.
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up` were added to `.env.local`. `03-auth.md` says to "use existing Clerk env vars, do not invent new ones" — these are Clerk's own standard SDK-recognized env var names (confirmed by reading `@clerk/nextjs`'s source), just not yet present in this project's `.env.local`; they were not renamed or replaced with anything custom.
- `lib/clerk-appearance.ts` holds the single `Appearance` config (theme + `variables`) passed to `ClerkProvider`, so every Clerk component (sign-in/up forms, the navbar `UserButton`) inherits the same token mapping from one place rather than each usage repeating `appearance` props.

## Session Notes

- Verified via `tsc --noEmit`, `eslint`, `next build`, and a temporary Playwright screenshot (page.tsx was reverted afterward) that all 7 components render with the dark palette and no default light styling appears.
- Editor chrome: verified via `tsc --noEmit`, `eslint`, and a temporary wiring into `page.tsx` (reverted afterward) screenshotted with `npx playwright screenshot` in both sidebar-open and sidebar-closed states — sidebar floats over the canvas without pushing content, slides fully off-screen when closed, and the navbar icon swaps correctly. Sidebar is positioned `top-14` (matching the navbar's `h-14`) rather than full `inset-y-0` so the navbar and its toggle button stay visible/usable while the sidebar is open — not spelled out in the spec, so flagging the assumption here.
- Authentication: verified via `next build` (proxy compiled and listed as `ƒ Proxy (Middleware)`), `eslint`, and `npx playwright screenshot` against the project's own running dev server at desktop (1440×900) and mobile (390×844) viewports for both `/sign-in` and `/sign-up` — two-panel layout on desktop, form-only on mobile, dark theme and cyan accent applied with no hardcoded colors, no gradients/hero/cards. Also verified with `curl` that an unauthenticated request to `/` gets a 307 to `/sign-in?redirect_url=...` from the proxy before `page.tsx` ever runs.
- Editor route fix: verified via `eslint`, `next build` (`/editor` now lists as `○ /editor` static route instead of being absent/404), and `curl` confirming an unauthenticated request to `/editor` still 307s to `/sign-in` (route protection unaffected). Did not re-screenshot the chrome itself since `EditorNavbar`/`ProjectSidebar` are unchanged from their earlier verified screenshots — only the route wiring is new.
