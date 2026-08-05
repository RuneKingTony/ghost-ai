 Clerk is already installed and connected. Wire it into the Next.js app: provider, auth pages, redirects, route protection, and user menu.

 ## Design

 Use Clerk's `dark` theme from `@clerk/ui/themes` as the base.

 Override Clerk appearance variables using the app's existing css variables. Do not hardcode colors.

 ## Sign-in and sign-up pages:

 - Large screens: simple two-panel layout
 - left: compact logo, tagline, short text-only feature list
 - right: centered Clerk form
 - small screens: form only
 - no gradients
 - no oversized hero sections
 - no feature cards
 - no scroll-heavy layouts

 keep the layout minimal and professional.

 ## Implementation 

 Wrap the root layer with `ClerkProvider` using Clerk's `dark` theme.

 Create sign-in and sign-up pages using Clerk components.

 Use `proxy.ts` at the project root, not `middleware.ts`.

 Define public routes using the existing sign-in and sign-up env vars. Protect everything else by default.

 update `/`:

 - authenticated users redirect to `/editor`
 - unauthenticated users redirect to `/sign-in`

 Use existing Clerk env vars. Do not rename or invent new ones.

 ## Dependencies

 install: @clerk/ui.

 ## Check when done

 - `proxy.ts` exists at the root
 - all routes are protected except the public auth paths
 - auth pages use CSS variables with no hardcoded colors
 - `ClerkProvider` wraps the root layout
 = `npm run build` passes