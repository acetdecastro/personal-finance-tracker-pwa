import { db, APP_SCHEMA_VERSION } from '#/db/dexie'
import { nowStoredAt } from '#/lib/dates'
import {
  exportPayloadSchema,
  importPayloadSchema,
} from './import-export.schemas'
import type { z } from 'zod'

export type ExportPayload = z.infer<typeof exportPayloadSchema>

export async function exportData(): Promise<void> {
  const [
    accounts,
    categories,
    transactions,
    recurringRules,
    budgets,
    goals,
    userSettings,
    users,
  ] = await Promise.all([
    db.accounts.orderBy('createdAt').toArray(),
    db.categories.orderBy('createdAt').toArray(),
    db.transactions.orderBy('transactionDate').toArray(),
    db.recurringRules.orderBy('createdAt').toArray(),
    db.budgets.orderBy('createdAt').toArray(),
    db.goals.orderBy('createdAt').toArray(),
    db.userSettings.toArray(),
    db.users.toArray(),
  ])

  const payload = exportPayloadSchema.parse({
    metadata: {
      appVersion: '1.0.0',
      exportedAt: nowStoredAt(),
      schemaVersion: APP_SCHEMA_VERSION,
    },
    accounts,
    categories,
    transactions,
    recurringRules,
    budgets,
    goals,
    userSettings,
    users,
  })

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `finance-backup-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function parseImportFile(file: File): Promise<ExportPayload> {
  const text = await file.text()
  const json = JSON.parse(text) as unknown
  return importPayloadSchema.parse(json)
}

export async function importData(payload: ExportPayload): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.accounts,
      db.categories,
      db.transactions,
      db.recurringRules,
      db.budgets,
      db.goals,
      db.userSettings,
      db.users,
    ],
    async () => {
      await Promise.all([
        db.accounts.clear(),
        db.categories.clear(),
        db.transactions.clear(),
        db.recurringRules.clear(),
        db.budgets.clear(),
        db.goals.clear(),
        db.userSettings.clear(),
        db.users.clear(),
      ])

      await Promise.all([
        db.accounts.bulkPut(payload.accounts),
        db.categories.bulkPut(payload.categories),
        db.transactions.bulkPut(payload.transactions),
        db.recurringRules.bulkPut(payload.recurringRules),
        db.budgets.bulkPut(payload.budgets),
        db.goals.bulkPut(payload.goals),
        db.userSettings.bulkPut(payload.userSettings),
        db.users.bulkPut(payload.users),
      ])
    },
  )
}
