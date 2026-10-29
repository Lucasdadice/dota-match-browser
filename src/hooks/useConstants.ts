import { useQuery } from '@tanstack/react-query'
import { api } from '../api/opendota'
import type { Hero, Item } from '../api/types'

export function useHeroes() {
  return useQuery({
    queryKey: ['constants', 'heroes'],
    queryFn: api.heroes,
    staleTime: Infinity,
    gcTime: Infinity,
    select: (data): Map<number, Hero> => {
      const map = new Map<number, Hero>()
      for (const hero of Object.values(data)) {
        map.set(hero.id, hero)
      }
      return map
    },
  })
}

export function useItems() {
  return useQuery({
    queryKey: ['constants', 'items'],
    queryFn: api.items,
    staleTime: Infinity,
    gcTime: Infinity,
    select: (data): Map<string, Item> => {
      const map = new Map<string, Item>()
      for (const [key, item] of Object.entries(data)) {
        map.set(key, item)
        if (item.id) map.set(String(item.id), item)
      }
      return map
    },
  })
}
