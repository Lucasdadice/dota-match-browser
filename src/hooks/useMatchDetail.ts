import { useQuery } from '@tanstack/react-query'
import { api } from '../api/opendota'

export function useMatchDetail(matchId: string | undefined) {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: () => api.matchDetail(matchId!),
    enabled: !!matchId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  })
}
