import { nowStoredAt } from '#/lib/dates'

export function createEntityId(): string {
  return crypto.randomUUID()
}

export function createTimestamps() {
  const now = nowStoredAt()

  return {
    createdAt: now,
    updatedAt: now,
  }
}

export function touchUpdatedAt() {
  return {
    updatedAt: nowStoredAt(),
  }
}
