import type { FinanceTrackerDatabase } from '#/db/dexie'
import { createFinanceTrackerDatabase } from '#/db/dexie'

export function createTestDatabase(name = `test-db-${crypto.randomUUID()}`) {
  return createFinanceTrackerDatabase(name)
}

export async function destroyTestDatabase(database: FinanceTrackerDatabase) {
  database.close()
  await database.delete()
}
