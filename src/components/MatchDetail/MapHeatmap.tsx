import { useMemo, useState } from 'react'
import type { Match } from '../../api/types'
import type { Hero } from '../../api/types'
import { coordToSvg, lanePostToHeatPoints } from '../../utils/mapCoords'
import { isRadiant } from '../../utils/formatters'

interface Props {
  match: Match
  heroMap: Map<number, Hero> | undefined
}

const MAP_SIZE = 400

const RADIANT_COLORS = ['#34d399', '#10b981', '#059669', '#047857', '#065f46']
const DIRE_COLORS = ['#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b']

export function MapHeatmap({ match, heroMap }: Props) {
  const [visible, setVisible] = useState<Set<number>>(
    () => new Set(match.players.map((p) => p.player_slot)),
  )

  const playersWithPos = match.players.filter((p) => p.lane_pos)

  if (playersWithPos.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-8">
        No position data — match may not be parsed by OpenDota
      </div>
    )
  }

  const colorMap = new Map<number, string>()
  let radiantIdx = 0
  let direIdx = 0
  for (const p of match.players) {
    const rad = isRadiant(p.player_slot)
    colorMap.set(
      p.player_slot,
      rad
        ? RADIANT_COLORS[radiantIdx++ % RADIANT_COLORS.length]
        : DIRE_COLORS[direIdx++ % DIRE_COLORS.length],
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="relative flex-shrink-0" style={{ width: MAP_SIZE, height: MAP_SIZE }}>
        <img
          src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/maps/dota2_minimap_transparent.png"
          alt="Dota 2 minimap"
          width={MAP_SIZE}
          height={MAP_SIZE}
          className="rounded"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/map/map_partial_foreground.png'
          }}
        />
        <svg
          className="absolute inset-0"
          width={MAP_SIZE}
          height={MAP_SIZE}
          style={{ pointerEvents: 'none' }}
        >
          {playersWithPos
            .filter((p) => visible.has(p.player_slot))
            .map((player) => (
              <HeroHeatLayer
                key={player.player_slot}
                lanePos={player.lane_pos!}
                color={colorMap.get(player.player_slot) ?? '#fff'}
                mapSize={MAP_SIZE}
              />
            ))}
        </svg>
      </div>

      <div className="flex flex-wrap lg:flex-col gap-2 content-start">
        <div className="text-xs text-gray-500 uppercase tracking-wider w-full">Toggle Heroes</div>
        {match.players.map((player) => {
          const hero = heroMap?.get(player.hero_id)
          const color = colorMap.get(player.player_slot)!
          const on = visible.has(player.player_slot)
          return (
            <button
              key={player.player_slot}
              onClick={() => {
                setVisible((prev) => {
                  const next = new Set(prev)
                  on ? next.delete(player.player_slot) : next.add(player.player_slot)
                  return next
                })
              }}
              className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-opacity ${
                on ? 'opacity-100' : 'opacity-40'
              }`}
              style={{ borderLeft: `3px solid ${color}` }}
            >
              <span className={isRadiant(player.player_slot) ? 'text-emerald-400' : 'text-red-400'}>
                {isRadiant(player.player_slot) ? 'R' : 'D'}
              </span>
              <span className="text-gray-300">{hero?.localized_name ?? `Slot ${player.player_slot}`}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function HeroHeatLayer({
  lanePos,
  color,
  mapSize,
}: {
  lanePos: Record<string, Record<string, number>>
  color: string
  mapSize: number
}) {
  const points = useMemo(() => lanePostToHeatPoints(lanePos), [lanePos])
  const maxCount = useMemo(() => Math.max(...points.map((p) => p.count), 1), [points])

  return (
    <g>
      {points.map((pt, i) => {
        const cx = coordToSvg(pt.x, 'x', mapSize)
        const cy = coordToSvg(pt.y, 'y', mapSize)
        const opacity = Math.max(0.05, Math.min(pt.count / maxCount, 0.9))
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={3}
            fill={color}
            fillOpacity={opacity}
          />
        )
      })}
    </g>
  )
}
