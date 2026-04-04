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
  it('returns the first goal as the primary goal snapshot', async () => {
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

    const snapshot = await goalQueryService.getPrimaryGoalSnapshot()

    expect(snapshot?.name).toBe('Emergency Fund')
    expect(snapshot?.percentComplete).toBe(25)
  })
})
