import type { ReactNode } from "react"
import { GitBranch, Sparkles, Users } from "lucide-react"

interface AuthLayoutProps {
  children: ReactNode
}

const FEATURES = [
  { icon: Sparkles, label: "Generate architecture from a prompt" },
  { icon: Users, label: "Collaborate on the canvas in real time" },
  { icon: GitBranch, label: "Turn the graph into a technical spec" },
]

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-base">
      <div className="hidden w-1/2 flex-col justify-center gap-8 border-r border-surface-border px-16 lg:flex">
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold tracking-wide text-brand">
            ghost AI
          </span>
          <p className="max-w-sm text-sm text-copy-muted">
            Describe a system in plain English and watch it take shape on a
            shared architecture canvas.
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {FEATURES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 text-sm text-copy-secondary"
            >
              <Icon className="h-4 w-4 shrink-0 text-copy-muted" />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        {children}
      </div>
    </div>
  )
}

export { AuthLayout }
