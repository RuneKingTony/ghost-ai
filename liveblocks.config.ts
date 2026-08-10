import type { AiChatMessagePayload, AiStatusFeedPayload } from "@/types/tasks"

// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      cursor: { x: number; y: number } | null
      thinking: boolean
    }

    // The Storage tree for the room, for useMutation, useStorage, etc.
    Storage: Record<string, never>
      // Example, a conflict-free list
      // animals: LiveList<string>;

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string
      info: {
        name: string
        avatar: string
        color: string
      }
    }

    // Custom events, for useBroadcastEvent, useEventListener
    RoomEvent: {
      type: "ai-status"
      runId: string
      status: "started" | "processing" | "complete" | "error"
      message: string
    }

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    ThreadMetadata: Record<string, never>
      // Example, attaching coordinates to a thread
      // x: number;
      // y: number;

    // Custom message payload for this app's Liveblocks feeds, for
    // useFeedMessages, useCreateFeedMessage, etc. `FeedMessageData` is a
    // single global type shared by every feed (Liveblocks doesn't type
    // message data per feed id), so it's a union of each feed's payload:
    // `ai-status-feed` (AI progress/presence) and `ai-chat` (sidebar chat).
    FeedMessageData: AiStatusFeedPayload | AiChatMessagePayload

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    RoomInfo: Record<string, never>
      // Example, rooms with a title and url
      // title: string;
      // url: string;
  }
}

export {}
