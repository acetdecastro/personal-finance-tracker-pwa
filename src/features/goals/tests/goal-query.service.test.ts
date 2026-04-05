import { afterEach, describe, expect, it } from 'vitest'
import { createGoalRepository } from '../services/goal.repository'
import { createGoalQueryService } from '../services/goal-query.service'
import { createTestDatabase, destroyTestDatabase } from '#/test/test-db'

const databases: ReturnType<typeof createTestDatabase>[] = []

afterEach(async () => {
  await Promise.all(
    databases.splice(0).map((database) => destroyTestDatabase(database)),
  )
})

describe('goalQueryService', () => {
  it('returns goal snapshots for all saved goals', async () => {
    const database = createTestDatabase()
    databases.push(database)

    const goalRepository = createGoalRepository(database)
    const goalQueryService = createGoalQueryService(database)

    await goalRepository.create({
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 2500,
      targetDate: null,
    })

    await goalRepository.create({
      name: 'Travel Fund',
      targetAmount: 5000,
      currentAmount: 1000,
      targetDate: null,
    })

    const snapshots = await goalQueryService.listGoalSnapshots()

    expect(snapshots).toHaveLength(2)
    expect(
      snapshots.some(
        (snapshot) =>
          snapshot.name === 'Emergency Fund' && snapshot.percentComplete === 25,
      ),
    ).toBe(true)
  })
})
