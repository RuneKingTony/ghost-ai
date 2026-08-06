import { Liveblocks } from "@liveblocks/node"

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined
}

function createLiveblocksClient() {
  return new Liveblocks({ secret: process.env.LIVEBLOCKS_SECRET_KEY! })
}

export const liveblocks =
  globalForLiveblocks.liveblocks ?? createLiveblocksClient()

if (process.env.NODE_ENV !== "production") {
  globalForLiveblocks.liveblocks = liveblocks
}

// Same 8 hues as the canvas node text-color set in `ui-context.md` — already
// tuned for contrast against the dark canvas, so cursors read consistently
// with node labels.
const CURSOR_COLORS = [
  "#52A8FF",
  "#BF7AF0",
  "#FF990A",
  "#FF6166",
  "#F75F8F",
  "#62C073",
  "#0AC7B4",
  "#EDEDED",
] as const

function getCursorColorForUser(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0
  }

  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length]
}

export { getCursorColorForUser }
