import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GoldChart } from '../components/MatchDetail/GoldChart'
import { ItemTimeline } from '../components/MatchDetail/ItemTimeline'
import { EventTimeline } from '../components/MatchDetail/EventTimeline'
import { MapHeatmap } from '../components/MatchDetail/MapHeatmap'
import { Scoreboard } from '../components/MatchDetail/Scoreboard'
import { useMatchDetail } from '../hooks/useMatchDetail'
import { useHeroes, useItems } from '../hooks/useConstants'
import { formatDate, formatDuration } from '../utils/formatters'

type Panel = 'scoreboard' | 'gold' | 'items' | 'events' | 'map'

const PANELS: { key: Panel; label: string }[] = [
  { key: 'scoreboard', label: 'Scoreboard' },
  { key: 'gold', label: 'Gold & XP' },
  { key: 'items', label: 'Items' },
  { key: 'events', label: 'Events' },
  { key: 'map', label: 'Map' },
]

export function MatchPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const { data: match, isLoading, error } = useMatchDetail(matchId)
  const { data: heroMap } = useHeroes()
  const { data: itemMap } = useItems()
  const [panel, setPanel] = useState<Panel>('scoreboard')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <div className="text-4xl mb-3 animate-pulse">⟳</div>
          <div>Loading match {matchId}…</div>
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-2">Failed to load match</div>
          <Link to="/" className="text-indigo-400 hover:text-indigo-300 underline text-sm">
            ← Back to matches
          </Link>
        </div>
      </div>
    )
  }

  const radiantScore = match.radiant_score ?? match.players.filter((p) => p.player_slot < 128 && p.kills > 0).reduce((s, p) => s + p.kills, 0)
  const direScore = match.dire_score ?? match.players.filter((p) => p.player_slot >= 128).reduce((s, p) => s + p.kills, 0)

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
            ← Back
          </Link>
          <div className="flex-1" />
          <div className="text-gray-500 text-sm">{formatDate(match.start_time)} · {formatDuration(match.duration)}</div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 mb-6 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className={`text-2xl font-bold ${match.radiant_win ? 'text-emerald-400' : 'text-gray-500'}`}>
                Radiant {match.radiant_win ? '✓' : '✗'}
              </div>
              <div className="text-3xl font-mono text-white mt-1">{radiantScore}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-600 text-sm">Match #{matchId}</div>
              <div className="text-gray-400 text-xs mt-1">{formatDuration(match.duration)}</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${!match.radiant_win ? 'text-red-400' : 'text-gray-500'}`}>
                Dire {!match.radiant_win ? '✓' : '✗'}
              </div>
              <div className="text-3xl font-mono text-white mt-1">{direScore}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {PANELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPanel(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                panel === key
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 md:p-6">
          {panel === 'scoreboard' && (
            <Scoreboard match={match} heroMap={heroMap} itemMap={itemMap} />
          )}
          {panel === 'gold' && (
            <GoldChart match={match} heroMap={heroMap} />
          )}
          {panel === 'items' && (
            <div>
              <div className="text-xs text-gray-500 mb-4 uppercase tracking-wider">
                Item purchases over time (consumables hidden)
              </div>
              <ItemTimeline match={match} heroMap={heroMap} itemMap={itemMap} />
            </div>
          )}
          {panel === 'events' && (
            <div>
              <div className="text-xs text-gray-500 mb-4 uppercase tracking-wider">
                Match events timeline
              </div>
              <EventTimeline match={match} heroMap={heroMap} />
            </div>
          )}
          {panel === 'map' && (
            <div>
              <div className="text-xs text-gray-500 mb-4 uppercase tracking-wider">
                Hero position heatmap (aggregate across full match)
              </div>
              <MapHeatmap match={match} heroMap={heroMap} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
