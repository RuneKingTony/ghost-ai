import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import { getCursorColorForUser, liveblocks } from "@/lib/liveblocks"
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const identity = await getCurrentIdentity()

  if (!identity.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const roomId = typeof body?.room === "string" ? body.room : ""

  if (roomId.length === 0) {
    return NextResponse.json({ error: "Room is required" }, { status: 400 })
  }

  const project = await prisma.project.findUnique({ where: { id: roomId } })

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (!(await hasProjectAccess(project, identity))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await liveblocks.getOrCreateRoom(roomId, {
    defaultAccesses: ["room:write"],
  })

  const user = await currentUser()
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.primaryEmailAddress?.emailAddress ||
    "Anonymous"
  const avatar = user?.imageUrl ?? ""
  const color = getCursorColorForUser(identity.userId)

  const { status, body: authResponseBody } = await liveblocks.identifyUser(
    identity.userId,
    { userInfo: { name, avatar, color } }
  )

  return new NextResponse(authResponseBody, {
    status,
    headers: { "Content-Type": "application/json" },
  })
}
