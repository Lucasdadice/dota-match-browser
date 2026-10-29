import { useState } from 'react'
import type { Match } from '../../api/types'
import type { Hero } from '../../api/types'
import { formatTime, isRadiant } from '../../utils/formatters'

interface Props {
  match: Match
  heroMap: Map<number, Hero> | undefined
}

interface Event {
  time: number
  type: 'kill' | 'tower' | 'roshan' | 'barracks' | 'firstblood'
  label: string
  team?: 'radiant' | 'dire' | 'neutral'
}

export function EventTimeline({ match, heroMap }: Props) {
  const [hovered, setHovered] = useState<Event | null>(null)
  const duration = match.duration

  const events: Event[] = []

  for (const player of match.players) {
    if (!player.kills_log) continue
    for (const kill of player.kills_log) {
      const attackerHero = heroMap?.get(player.hero_id)
      events.push({
        time: kill.time,
        type: 'kill',
        label: `${attackerHero?.localized_name ?? 'Unknown'} killed ${kill.key.replace('npc_dota_hero_', '')}`,
        team: isRadiant(player.player_slot) ? 'radiant' : 'dire',
      })
    }
  }

  if (match.objectives) {
    for (const obj of match.objectives) {
      if (obj.time < 0) continue
      if (obj.type === 'building_kill') {
        const isRadiantBuilding = obj.unit?.includes('radiant') ?? false
        const teamKilling = isRadiantBuilding ? 'dire' : 'radiant'
        const isTower = obj.unit?.includes('tower') ?? false
        const isBarracks = obj.unit?.includes('barracks') ?? false
        if (isTower) {
          events.push({
            time: obj.time,
            type: 'tower',
            label: `${teamKilling} destroyed ${obj.unit?.replace('npc_dota_', '') ?? 'building'}`,
            team: teamKilling,
          })
        } else if (isBarracks) {
          events.push({
            time: obj.time,
            type: 'barracks',
            label: `${teamKilling} destroyed barracks`,
            team: teamKilling,
          })
        }
      } else if (obj.type === 'CHAT_MESSAGE_ROSHAN_KILL') {
        events.push({
          time: obj.time,
          type: 'roshan',
          label: `Roshan killed`,
          team: 'neutral',
        })
      } else if (obj.type === 'CHAT_MESSAGE_FIRSTBLOOD') {
        events.push({
          time: obj.time,
          type: 'firstblood',
          label: 'First Blood',
          team: 'neutral',
        })
      }
    }
  }

  events.sort((a, b) => a.time - b.time)

  const killEvents = events.filter((e) => e.type === 'kill')
  const majorEvents = events.filter((e) => e.type !== 'kill')

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Major Events</div>
        <div className="relative h-10 bg-gray-900 rounded overflow-hidden">
          {majorEvents.map((e, i) => {
            const left = Math.min((e.time / duration) * 100, 99.5)
            return (
              <EventMarker
                key={i}
                event={e}
                left={left}
                hovered={hovered === e}
                onHover={setHovered}
              />
            )
          })}
          {hovered && (
            <div className="absolute bottom-full left-0 right-0 text-center text-xs text-white bg-gray-800 rounded px-2 py-1 pointer-events-none mb-1">
              {hovered.label} @ {formatTime(hovered.time)}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Kills</div>
        <div className="relative h-10 bg-gray-900 rounded overflow-hidden">
          {killEvents.map((e, i) => {
            const left = Math.min((e.time / duration) * 100, 99.5)
            return (
              <EventMarker
                key={i}
                event={e}
                left={left}
                hovered={hovered === e}
                onHover={setHovered}
              />
            )
          })}
          {hovered && hovered.type === 'kill' && (
            <div className="absolute bottom-full left-0 right-0 text-center text-xs text-white bg-gray-800 rounded px-2 py-1 pointer-events-none mb-1">
              {hovered.label} @ {formatTime(hovered.time)}
            </div>
          )}
        </div>
      </div>

      <TimeRuler duration={duration} />
    </div>
  )
}

function EventMarker({
  event,
  left,
  hovered,
  onHover,
}: {
  event: Event
  left: number
  hovered: boolean
  onHover: (e: Event | null) => void
}) {
  const color = {
    kill: event.team === 'radiant' ? '#34d399' : '#f87171',
    tower: event.team === 'radiant' ? '#60a5fa' : '#fb923c',
    roshan: '#a78bfa',
    barracks: event.team === 'radiant' ? '#34d399' : '#f87171',
    firstblood: '#fbbf24',
  }[event.type]

  const symbol = {
    kill: '×',
    tower: '▲',
    roshan: '◆',
    barracks: '■',
    firstblood: '★',
  }[event.type]

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer"
      style={{ left: `${left}%` }}
      onMouseEnter={() => onHover(event)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        className={`text-xs font-bold transition-transform ${hovered ? 'scale-150' : ''}`}
        style={{ color }}
      >
        {symbol}
      </div>
    </div>
  )
}

function TimeRuler({ duration }: { duration: number }) {
  const minutes = Math.ceil(duration / 60)
  const ticks = Array.from({ length: minutes + 1 }, (_, i) => i).filter(
    (m) => m % 5 === 0,
  )
  return (
    <div className="relative h-4">
      {ticks.map((m) => {
        const left = Math.min((m * 60 / duration) * 100, 100)
        return (
          <div
            key={m}
            className="absolute text-gray-600 text-xs -translate-x-1/2"
            style={{ left: `${left}%` }}
          >
            {m}m
          </div>
        )
      })}
    </div>
  )
}
