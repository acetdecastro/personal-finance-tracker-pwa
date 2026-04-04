import { useQuery } from '@tanstack/react-query'
import { categoryRepository } from '../services/category.repository'
import type { CategoryType } from '#/types/domain'

export const CATEGORIES_QUERY_KEY = ['categories'] as const

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => categoryRepository.list(),
  })
}

export function useCategoriesByType(type: CategoryType) {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, type],
    queryFn: () => categoryRepository.listByType(type),
  })
}
