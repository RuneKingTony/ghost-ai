import Link from "next/link"
import { Lock } from "lucide-react"

function AccessDenied() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
      <Lock className="h-8 w-8 text-copy-muted" />
      <div className="flex flex-col gap-1.5">
        <h1 className="text-lg font-medium text-copy-primary">
          Access denied
        </h1>
        <p className="text-sm text-copy-muted">
          You don&apos;t have access to this project, or it doesn&apos;t
          exist.
        </p>
      </div>
      <Link href="/editor" className="text-sm text-brand hover:underline">
        Back to projects
      </Link>
    </div>
  )
}

export { AccessDenied }
