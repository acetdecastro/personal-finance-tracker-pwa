import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import { seedCoreData } from '#/services/seed/seed.service'

export async function resetAllAppData(database: FinanceTrackerDatabase = db) {
  await database.transaction(
    'rw',
    [
      database.transactions,
      database.recurringRules,
      database.budgets,
      database.goals,
      database.accounts,
      database.categories,
      database.userSettings,
      database.users,
    ],
    async () => {
      await Promise.all([
        database.transactions.clear(),
        database.recurringRules.clear(),
        database.budgets.clear(),
        database.goals.clear(),
        database.accounts.clear(),
        database.categories.clear(),
        database.userSettings.clear(),
        database.users.clear(),
      ])
    },
  )

  await seedCoreData(database)
}
