"use client"

import { useUser } from "@clerk/nextjs"
import { UserButton } from "@clerk/nextjs"
import { useOthers } from "@liveblocks/react"

const MAX_VISIBLE_AVATARS = 5
const AVATAR_SIZE_CLASS = "h-8 w-8"

function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "?"

  const parts = trimmed.split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""

  return (first + last).toUpperCase()
}

function PresenceAvatars() {
  const { user } = useUser()
  const others = useOthers()

  const collaborators = others.filter((other) => other.id !== user?.id)
  const visible = collaborators.slice(0, MAX_VISIBLE_AVATARS)
  const overflowCount = collaborators.length - visible.length

  return (
    <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-subtle-border bg-surface/90 py-1.5 pl-1.5 pr-1.5 backdrop-blur">
      {collaborators.length > 0 && (
        <>
          <div className="flex -space-x-2">
            {visible.map((other) => (
              <CollaboratorAvatar
                key={other.connectionId}
                name={other.info?.name}
                avatar={other.info?.avatar}
                color={other.info?.color}
              />
            ))}
            {overflowCount > 0 && (
              <div
                className={`${AVATAR_SIZE_CLASS} flex shrink-0 items-center justify-center rounded-full border-2 border-surface bg-elevated text-xs font-medium text-copy-secondary ring-1 ring-subtle-border`}
              >
                +{overflowCount}
              </div>
            )}
          </div>
          <div className="h-6 w-px bg-subtle-border" />
        </>
      )}
      <UserButton
        appearance={{ elements: { userButtonAvatarBox: AVATAR_SIZE_CLASS } }}
      />
    </div>
  )
}

interface CollaboratorAvatarProps {
  name?: string
  avatar?: string
  color?: string
}

function CollaboratorAvatar({ name, avatar, color }: CollaboratorAvatarProps) {
  const displayName = name ?? "Collaborator"
  const fillColor = color ?? "var(--color-subtle-border)"

  return (
    <div
      className={`${AVATAR_SIZE_CLASS} flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-surface text-xs font-medium text-white ring-1 ring-subtle-border`}
      style={{ backgroundColor: avatar ? undefined : fillColor }}
      title={displayName}
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="" className="h-full w-full object-cover" />
      ) : (
        getInitials(displayName)
      )}
    </div>
  )
}

export { PresenceAvatars }
