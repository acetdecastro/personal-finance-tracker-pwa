import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import { seedCoreData } from '#/services/seed/seed.service'
import type { CategoryOptionDto } from '#/types/dto'
import type { CategoryType } from '#/types/domain'
import { createCategoryRepository } from './category.repository'

function toCategoryOption(category: {
  id: string
  name: string
  type: CategoryOptionDto['type']
  isSystem: boolean
}): CategoryOptionDto {
  return {
    value: category.id,
    label: category.name,
    type: category.type,
    isSystem: category.isSystem,
  }
}

export function createCategoryQueryService(
  database: FinanceTrackerDatabase = db,
) {
  const categoryRepository = createCategoryRepository(database)

  return {
    async listByType(type: CategoryType) {
      await seedCoreData(database)
      return categoryRepository.listByType(type)
    },

    async listOptionsByType(type: CategoryType): Promise<CategoryOptionDto[]> {
      const categories = await this.listByType(type)
      return categories.map(toCategoryOption)
    },

    async getSystemCategoryById(id: string) {
      await seedCoreData(database)
      const category = await categoryRepository.getById(id)
      if (!category || !category.isSystem) {
        return undefined
      }

      return category
    },

    async getCategoryById(id: string) {
      await seedCoreData(database)
      return categoryRepository.getById(id)
    },

    async getSalaryCategory() {
      const incomeCategories = await this.listByType('income')
      return incomeCategories.find((category) => category.name === 'Salary')
    },

    async getTransferCategory() {
      const transferCategories = await this.listByType('transfer')
      return transferCategories.find((category) => category.name === 'Transfer')
    },
  }
}

export const categoryQueryService = createCategoryQueryService()
