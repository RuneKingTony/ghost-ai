function generateRoomSuffix(): string {
  return crypto.randomUUID().slice(0, 6)
}

export { generateRoomSuffix }
