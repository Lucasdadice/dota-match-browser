import { useMemo, useState } from 'react'
import type { Item, Match, MatchPlayer } from '../../api/types'
import type { Hero } from '../../api/types'
import { HeroIcon } from '../common/HeroIcon'
import { ItemIcon } from '../common/ItemIcon'
import { coordToSvg, lanePostToHeatPoints } from '../../utils/mapCoords'
import { formatGold, formatTime, isRadiant } from '../../utils/formatters'
import { isParserConfigured, useMatchPositions, type Positions } from '../../hooks/useMatchPositions'

function slotToParserPlayerId(slot: number): number {
  return slot < 128 ? slot : slot - 128 + 5
}

function positionAt(positions: Array<[number, number, number]>, second: number): [number, number] | null {
  if (positions.length === 0) return null
  const idx = Math.min(Math.max(0, Math.floor(second)), positions.length - 1)
  const p = positions[idx]
  return [p[1], p[2]]
}

interface Props {
  match: Match
  heroMap: Map<number, Hero> | undefined
  itemMap: Map<string, Item> | undefined
}

const MAP_SIZE = 520

const RADIANT_COLORS = ['#34d399', '#10b981', '#059669', '#047857', '#065f46']
const DIRE_COLORS   = ['#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b']

const CONSUMABLES = new Set([
  'tpscroll', 'clarity', 'flask', 'enchanted_mango', 'faerie_fire',
  'ward_observer', 'ward_sentry', 'smoke_of_deceit', 'dust',
  'blood_grenade', 'tome_of_knowledge',
])

function buildColorMap(match: Match) {
  const map = new Map<number, string>()
  let ri = 0, di = 0
  for (const p of match.players) {
    map.set(p.player_slot, isRadiant(p.player_slot)
      ? RADIANT_COLORS[ri++ % RADIANT_COLORS.length]
      : DIRE_COLORS[di++ % DIRE_COLORS.length])
  }
  return map
}

export function MapHeatmap({ match, heroMap, itemMap }: Props) {
  const [currentSec, setCurrentSec] = useState(match.duration)
  const [visible, setVisible] = useState<Set<number>>(
    () => new Set(match.players.map((p) => p.player_slot)),
  )
  const [liveEnabled, setLiveEnabled] = useState(false)

  const colorMap = useMemo(() => buildColorMap(match), [match])
  const currentMinute = Math.floor(currentSec / 60)
  const playersWithPos = match.players.filter((p) => p.lane_pos)
  const hasTimeData = match.players.some((p) => p.gold_t && p.gold_t.length > 0)

  const positionsQuery = useMatchPositions(String(match.match_id), liveEnabled)
  const positions = positionsQuery.data
  const livePositionsByPlayerId = useMemo(() => {
    if (!positions) return null
    const map = new Map<number, Positions['players'][number]>()
    for (const p of positions.players) map.set(p.playerId, p)
    return map
  }, [positions])
  const showLive = liveEnabled && !!livePositionsByPlayerId
  const parserConfigured = isParserConfigured()

  const radiantPlayers = match.players
    .filter((p) => isRadiant(p.player_slot))
    .sort((a, b) => a.player_slot - b.player_slot)
  const direPlayers = match.players
    .filter((p) => !isRadiant(p.player_slot))
    .sort((a, b) => a.player_slot - b.player_slot)

  return (
    <div className="space-y-5">
      {/* Time Slider */}
      <div className="bg-gray-800/60 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-yellow-400 font-mono text-sm w-14 text-right">{formatTime(currentSec)}</span>
          <input
            type="range"
            min={0}
            max={match.duration}
            step={1}
            value={currentSec}
            onChange={(e) => setCurrentSec(Number(e.target.value))}
            className="flex-1 accent-indigo-500"
          />
          <span className="text-gray-500 font-mono text-sm w-14">{formatTime(match.duration)}</span>
        </div>
        <div className="flex justify-between text-gray-700 text-xs px-14 select-none">
          {Array.from({ length: Math.ceil(match.duration / 60 / 5) + 1 }, (_, i) => i * 5).map((m) => (
            <span key={m}>{m}m</span>
          ))}
        </div>
      </div>

      {/* Map + Stats */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Map */}
        <div className="flex-shrink-0 space-y-3">
          <div
            className="relative rounded-lg overflow-hidden border border-gray-700"
            style={{ width: MAP_SIZE, height: MAP_SIZE }}
          >
            <img
              src="https://www.opendota.com/assets/images/dota2/map/minimap.jpg"
              alt="Dota 2 minimap"
              width={MAP_SIZE}
              height={MAP_SIZE}
              className="block"
            />
            {playersWithPos.length === 0 && !showLive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-gray-400 text-sm text-center px-6">
                No position data.<br />Match may not be parsed by OpenDota.
              </div>
            )}

            {/* Heatmap overlay (aggregate mode) */}
            {!showLive && playersWithPos.length > 0 && (
              <svg
                className="absolute inset-0"
                width={MAP_SIZE}
                height={MAP_SIZE}
                style={{ pointerEvents: 'none' }}
              >
                {match.players
                  .filter((p) => p.lane_pos && visible.has(p.player_slot))
                  .map((player) => (
                    <HeroHeatLayer
                      key={player.player_slot}
                      lanePos={player.lane_pos!}
                      color={colorMap.get(player.player_slot) ?? '#fff'}
                      mapSize={MAP_SIZE}
                    />
                  ))}
              </svg>
            )}

            {/* Live hero icons overlay (live mode) */}
            {showLive && (
              <div className="absolute inset-0 pointer-events-none">
                {match.players
                  .filter((p) => visible.has(p.player_slot))
                  .map((player) => {
                    const data = livePositionsByPlayerId!.get(slotToParserPlayerId(player.player_slot))
                    if (!data) return null
                    const pt = positionAt(data.positions, currentSec)
                    if (!pt) return null
                    const cx = coordToSvg(pt[0], 'x', MAP_SIZE)
                    const cy = coordToSvg(pt[1], 'y', MAP_SIZE)
                    const color = colorMap.get(player.player_slot) ?? '#fff'
                    const hero = heroMap?.get(player.hero_id)
                    const ICON_SIZE = 30
                    return (
                      <div
                        key={player.player_slot}
                        className="absolute transition-[left,top] duration-100 ease-linear"
                        style={{
                          left: cx,
                          top: cy,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <div
                          className="rounded-md overflow-hidden"
                          style={{
                            width: ICON_SIZE,
                            height: ICON_SIZE,
                            boxShadow: `0 0 0 2px ${color}, 0 2px 6px rgba(0,0,0,0.6)`,
                          }}
                        >
                          <HeroIcon hero={hero} size={ICON_SIZE} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}

            {liveEnabled && positionsQuery.isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-gray-200 text-sm text-center px-6">
                <div>
                  <div className="animate-pulse text-2xl mb-2">⟳</div>
                  Fetching replay &amp; parsing positions…<br />
                  <span className="text-xs text-gray-400">First time per match: ~15-20s. Cached after that.</span>
                </div>
              </div>
            )}
            {liveEnabled && positionsQuery.isError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-red-300 text-sm text-center px-6">
                <div>
                  <div className="font-medium mb-1">
                    {(positionsQuery.error as Error & { code?: string }).code === 'replay_unavailable'
                      ? 'Replay no longer on Valve servers'
                      : 'Parser failed'}
                  </div>
                  <div className="text-xs text-red-400/80">
                    {(positionsQuery.error as Error & { code?: string }).code === 'replay_unavailable'
                      ? 'Valve expires replays ~2 weeks after the match. Heatmap is still available.'
                      : String((positionsQuery.error as Error).message)}
                  </div>
                  <button onClick={() => setLiveEnabled(false)} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 underline">
                    Back to heatmap
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mode toggle */}
          {parserConfigured && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLiveEnabled(!liveEnabled)}
                disabled={positionsQuery.isLoading}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
                  showLive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {showLive ? '● Live positions' : 'Enable live positions'}
              </button>
              {showLive && (
                <span className="text-gray-600 text-xs">
                  Parsed from replay · {positions?.players.length ?? 0} heroes
                </span>
              )}
            </div>
          )}

          {/* Hero toggles */}
          <div className="flex flex-wrap gap-1.5">
            {match.players.map((player) => {
              const hero = heroMap?.get(player.hero_id)
              const color = colorMap.get(player.player_slot)!
              const on = visible.has(player.player_slot)
              return (
                <button
                  key={player.player_slot}
                  onClick={() =>
                    setVisible((prev) => {
                      const next = new Set(prev)
                      on ? next.delete(player.player_slot) : next.add(player.player_slot)
                      return next
                    })
                  }
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${
                    on ? 'opacity-100' : 'opacity-30'
                  }`}
                  style={{ borderLeft: `3px solid ${color}` }}
                >
                  <HeroIcon hero={hero} size={16} />
                  <span className="text-gray-300">{hero?.localized_name ?? `Slot ${player.player_slot}`}</span>
                </button>
              )
            })}
          </div>
          {playersWithPos.length > 0 && !showLive && (
            <p className="text-gray-700 text-xs">Heatmap shows full-game movement — not time-specific.</p>
          )}
          {showLive && (
            <p className="text-gray-700 text-xs">Hero positions update in real time as you drag the slider.</p>
          )}
        </div>

        {/* Stats at current time */}
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            Player stats at {formatTime(currentSec)}
            {!hasTimeData && (
              <span className="ml-2 text-red-500/70 normal-case">(match not parsed — showing final stats)</span>
            )}
          </div>
          <PlayerStatsGroup
            players={radiantPlayers}
            label="Radiant"
            labelColor="text-emerald-400"
            currentSec={currentSec}
            currentMinute={currentMinute}
            heroMap={heroMap}
            itemMap={itemMap}
            colorMap={colorMap}
            hasTimeData={hasTimeData}
          />
          <div className="border-t border-gray-800 my-4" />
          <PlayerStatsGroup
            players={direPlayers}
            label="Dire"
            labelColor="text-red-400"
            currentSec={currentSec}
            currentMinute={currentMinute}
            heroMap={heroMap}
            itemMap={itemMap}
            colorMap={colorMap}
            hasTimeData={hasTimeData}
          />
        </div>
      </div>
    </div>
  )
}

function PlayerStatsGroup({
  players,
  label,
  labelColor,
  currentSec,
  currentMinute,
  heroMap,
  itemMap,
  colorMap,
  hasTimeData,
}: {
  players: MatchPlayer[]
  label: string
  labelColor: string
  currentSec: number
  currentMinute: number
  heroMap: Map<number, Hero> | undefined
  itemMap: Map<string, Item> | undefined
  colorMap: Map<number, string>
  hasTimeData: boolean
}) {
  return (
    <div>
      <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>{label}</div>
      <div className="space-y-2">
        {players.map((player) => (
          <PlayerStatRow
            key={player.player_slot}
            player={player}
            currentSec={currentSec}
            currentMinute={currentMinute}
            heroMap={heroMap}
            itemMap={itemMap}
            color={colorMap.get(player.player_slot) ?? '#fff'}
            hasTimeData={hasTimeData}
          />
        ))}
      </div>
    </div>
  )
}

function PlayerStatRow({
  player,
  currentSec,
  currentMinute,
  heroMap,
  itemMap,
  color,
  hasTimeData,
}: {
  player: MatchPlayer
  currentSec: number
  currentMinute: number
  heroMap: Map<number, Hero> | undefined
  itemMap: Map<string, Item> | undefined
  color: string
  hasTimeData: boolean
}) {
  const hero = heroMap?.get(player.hero_id)

  const gold = hasTimeData
    ? (player.gold_t?.[Math.min(currentMinute, (player.gold_t?.length ?? 1) - 1)] ?? null)
    : player.gold
  const xp = hasTimeData
    ? (player.xp_t?.[Math.min(currentMinute, (player.xp_t?.length ?? 1) - 1)] ?? null)
    : null
  const lh = hasTimeData
    ? (player.lh_t?.[Math.min(currentMinute, (player.lh_t?.length ?? 1) - 1)] ?? null)
    : player.last_hits

  const itemsBoughtSoFar = useMemo(() => {
    if (!player.purchase_log) return []
    return player.purchase_log
      .filter((p) => p.time <= currentSec && !CONSUMABLES.has(p.key))
      .slice(-10)
  }, [player.purchase_log, currentSec])

  return (
    <div
      className="bg-gray-800/50 rounded-lg px-3 py-2 flex items-center gap-3"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <HeroIcon hero={hero} size={28} className="flex-shrink-0" />
      <div className="flex-shrink-0 w-20 min-w-0">
        <div className="text-white text-xs font-medium truncate">{hero?.localized_name ?? `Hero ${player.hero_id}`}</div>
        <div className="text-gray-600 text-xs truncate">{player.personaname ?? ''}</div>
      </div>

      <div className="flex gap-3 flex-shrink-0">
        <StatPill label="G" value={gold !== null ? formatGold(gold) : '—'} color="text-yellow-400" />
        {xp !== null && <StatPill label="XP" value={formatGold(xp)} color="text-cyan-400" />}
        <StatPill label="LH" value={lh !== null ? String(lh) : '—'} color="text-gray-300" />
      </div>

      <div className="flex flex-wrap gap-0.5 flex-1 min-w-0">
        {itemsBoughtSoFar.length === 0 ? (
          <span className="text-gray-700 text-xs italic">no items</span>
        ) : (
          itemsBoughtSoFar.map((p, i) => {
            const item = itemMap?.get(p.key)
            return (
              <ItemIcon
                key={`${p.time}-${p.key}-${i}`}
                itemKey={p.key}
                imgPath={item?.img}
                size={22}
                title={`${item?.dname ?? p.key} @ ${formatTime(p.time)}`}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center min-w-[32px]">
      <div className={`font-mono text-xs font-medium ${color}`}>{value}</div>
      <div className="text-gray-600 text-[10px]">{label}</div>
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
        const opacity = Math.max(0.04, Math.min(pt.count / maxCount, 0.85))
        return (
          <circle key={i} cx={cx} cy={cy} r={3.5} fill={color} fillOpacity={opacity} />
        )
      })}
    </g>
  )
}
