import { dark } from "@clerk/ui/themes"
import type { Appearance } from "@clerk/ui"

const clerkAppearance: Appearance = {
  theme: dark,
  variables: {
    colorPrimary: "var(--accent-primary)",
    colorPrimaryForeground: "var(--bg-base)",
    colorDanger: "var(--state-error)",
    colorSuccess: "var(--state-success)",
    colorWarning: "var(--state-warning)",
    colorNeutral: "var(--text-primary)",
    colorForeground: "var(--text-primary)",
    colorMuted: "var(--bg-subtle)",
    colorMutedForeground: "var(--text-muted)",
    colorBackground: "var(--bg-surface)",
    colorInputForeground: "var(--text-primary)",
    colorInput: "var(--bg-elevated)",
    colorRing: "var(--accent-primary)",
    colorBorder: "var(--border-default)",
    fontFamily: "var(--font-geist-sans)",
    fontFamilyMono: "var(--font-geist-mono)",
    borderRadius: "var(--radius)",
  },
}

export { clerkAppearance }
