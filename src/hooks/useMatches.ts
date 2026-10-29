import { useQuery } from '@tanstack/react-query'
import { api } from '../api/opendota'

export function useMatches(accountId: string, limit = 50) {
  return useQuery({
    queryKey: ['matches', accountId, limit],
    queryFn: () => api.matches(accountId, limit),
    enabled: !!accountId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useRecentMatches(accountId: string) {
  return useQuery({
    queryKey: ['recentMatches', accountId],
    queryFn: () => api.recentMatches(accountId),
    enabled: !!accountId,
    staleTime: 1000 * 60 * 5,
  })
}
