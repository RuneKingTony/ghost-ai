# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Editor chrome (complete)

## Current Goal

- Awaiting the next feature unit.

## Completed

- Design system and UI primitives (`context/feature-specs/01-design-system.md`): shadcn/ui installed (Radix UI base, Nova preset) with Button, Card, Dialog, Input, Tabs, Textarea, and ScrollArea added to `components/ui/`; `lucide-react` installed; `lib/utils.ts` `cn()` helper in place; dark-only theme tokens from `ui-context.md` wired into `app/globals.css`.
- Editor chrome (`context/feature-specs/02-editor.md`): `components/editor/editor-navbar.tsx` (fixed-height top navbar with left/center/right sections; left section toggles `PanelLeftOpen`/`PanelLeftClose` based on `isSidebarOpen`, controlled via `isSidebarOpen`/`onToggleSidebar` props), `components/editor/project-sidebar.tsx` (floating, non-pushing overlay that slides in from the left via `isOpen`/`onClose` props; `Projects` header with close button; `My Projects`/`Shared` shadcn `Tabs` with empty placeholder states; full-width `New Project` button with `Plus` icon), and `components/editor/app-dialog.tsx` (app-level wrapper around the untouched `components/ui/dialog.tsx` primitives, applying `rounded-3xl` + app tokens and exposing `title`/`description`/`footer` props — no concrete dialog instances built yet, per spec).

## In Progress

- None yet.

## Next Up

- Wire `EditorNavbar` + `ProjectSidebar` into an actual editor route/layout with real sidebar state (not built yet — the spec only asked for the standalone chrome components).
- Add the next planned feature unit here.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- `app/globals.css` now defines the raw design tokens from `ui-context.md` (`--bg-base`, `--text-primary`, `--accent-primary`, etc.) as the source of truth in `:root`, and maps shadcn's semantic tokens (`--background`, `--primary`, `--border`, `--ring`, `--sidebar*`, ...) onto them so the untouched `components/ui/*` files render the dark theme automatically. `--primary`/`--ring` use `--accent-primary` (cyan); `--secondary`/`--muted`/`--accent` use `--bg-subtle`; `--destructive` uses `--state-error`.
- App-level Tailwind utility names (`bg-base`, `bg-surface`, `bg-elevated`, `bg-subtle`, `border-surface-border`, `border-subtle-border`, `text-copy-primary/secondary/muted/faint`, `text-brand`/`bg-brand`, `bg-accent-dim`, `bg-ai`/`text-ai`, `text-ai-text`, `text-error`/`bg-error`, `text-success`/`bg-success`, `text-warning`/`bg-warning`) are exposed via `@theme inline` in `app/globals.css`. Only `bg-base`, `bg-surface`, `text-copy-primary`, `text-copy-muted`, `border-surface-border`, and `text-brand` were named explicitly in `ui-context.md`; the rest were inferred to follow the same naming convention — flagging here in case a different name is intended.
- This app is dark-only (per `ui-context.md`), so `app/layout.tsx` applies the `dark` class to `<html>` unconditionally instead of building a light/dark toggle.

## Session Notes

- Verified via `tsc --noEmit`, `eslint`, `next build`, and a temporary Playwright screenshot (page.tsx was reverted afterward) that all 7 components render with the dark palette and no default light styling appears.
- Editor chrome: verified via `tsc --noEmit`, `eslint`, and a temporary wiring into `page.tsx` (reverted afterward) screenshotted with `npx playwright screenshot` in both sidebar-open and sidebar-closed states — sidebar floats over the canvas without pushing content, slides fully off-screen when closed, and the navbar icon swaps correctly. Sidebar is positioned `top-14` (matching the navbar's `h-14`) rather than full `inset-y-0` so the navbar and its toggle button stay visible/usable while the sidebar is open — not spelled out in the spec, so flagging the assumption here.
