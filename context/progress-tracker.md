# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Design system and UI primitives (complete)

## Current Goal

- Awaiting the next feature unit.

## Completed

- Design system and UI primitives (`context/feature-specs/01-design-system.md`): shadcn/ui installed (Radix UI base, Nova preset) with Button, Card, Dialog, Input, Tabs, Textarea, and ScrollArea added to `components/ui/`; `lucide-react` installed; `lib/utils.ts` `cn()` helper in place; dark-only theme tokens from `ui-context.md` wired into `app/globals.css`.

## In Progress

- None yet.

## Next Up

- Add the next planned feature unit here.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- `app/globals.css` now defines the raw design tokens from `ui-context.md` (`--bg-base`, `--text-primary`, `--accent-primary`, etc.) as the source of truth in `:root`, and maps shadcn's semantic tokens (`--background`, `--primary`, `--border`, `--ring`, `--sidebar*`, ...) onto them so the untouched `components/ui/*` files render the dark theme automatically. `--primary`/`--ring` use `--accent-primary` (cyan); `--secondary`/`--muted`/`--accent` use `--bg-subtle`; `--destructive` uses `--state-error`.
- App-level Tailwind utility names (`bg-base`, `bg-surface`, `bg-elevated`, `bg-subtle`, `border-surface-border`, `border-subtle-border`, `text-copy-primary/secondary/muted/faint`, `text-brand`/`bg-brand`, `bg-accent-dim`, `bg-ai`/`text-ai`, `text-ai-text`, `text-error`/`bg-error`, `text-success`/`bg-success`, `text-warning`/`bg-warning`) are exposed via `@theme inline` in `app/globals.css`. Only `bg-base`, `bg-surface`, `text-copy-primary`, `text-copy-muted`, `border-surface-border`, and `text-brand` were named explicitly in `ui-context.md`; the rest were inferred to follow the same naming convention — flagging here in case a different name is intended.
- This app is dark-only (per `ui-context.md`), so `app/layout.tsx` applies the `dark` class to `<html>` unconditionally instead of building a light/dark toggle.

## Session Notes

- Verified via `tsc --noEmit`, `eslint`, `next build`, and a temporary Playwright screenshot (page.tsx was reverted afterward) that all 7 components render with the dark palette and no default light styling appears.
