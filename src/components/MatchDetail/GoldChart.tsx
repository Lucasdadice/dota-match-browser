import { useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Match } from '../../api/types'
import type { Hero } from '../../api/types'
import { formatGold, isRadiant } from '../../utils/formatters'

interface Props {
  match: Match
  heroMap: Map<number, Hero> | undefined
}

type ChartMode = 'gold' | 'xp' | 'advantage'

const RADIANT_COLORS = ['#34d399', '#10b981', '#059669', '#047857', '#065f46']
const DIRE_COLORS = ['#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b']

export function GoldChart({ match, heroMap }: Props) {
  const [mode, setMode] = useState<ChartMode>('gold')
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  if (mode === 'advantage') {
    const adv = mode === 'advantage' ? match.radiant_gold_adv : match.radiant_xp_adv
    if (!adv || adv.length === 0) {
      return (
        <div className="text-gray-500 text-sm text-center py-8">No advantage data available</div>
      )
    }
    const data = adv.map((val, i) => ({ minute: i, value: val }))
    return (
      <div>
        <TabBar mode={mode} setMode={setMode} />
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="minute" stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 11 }} label={{ value: 'min', position: 'insideRight', fill: '#4b5563', fontSize: 11 }} />
            <YAxis stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={formatGold} />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6 }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(v) => [formatGold(Number(v)), 'Gold adv']}
              labelFormatter={(l) => `Minute ${l}`}
            />
            <ReferenceLine y={0} stroke="#374151" />
            <Line type="monotone" dataKey="value" stroke="#a78bfa" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center mt-2 text-xs">
          <span className="text-emerald-400">▲ Radiant ahead</span>
          <span className="text-red-400">▼ Dire ahead</span>
        </div>
      </div>
    )
  }

  const players = match.players.filter((p) => {
    const arr = mode === 'gold' ? p.gold_t : p.xp_t
    return arr && arr.length > 0
  })

  if (players.length === 0) {
    return (
      <div>
        <TabBar mode={mode} setMode={setMode} />
        <div className="text-gray-500 text-sm text-center py-8">No timeline data — match may not be parsed</div>
      </div>
    )
  }

  const minutes = players[0].times ?? players[0].gold_t!.map((_, i) => i * 60)
  const data = minutes.map((t, i) => {
    const row: Record<string, number> = { minute: Math.floor(t / 60) }
    players.forEach((p) => {
      const arr = mode === 'gold' ? p.gold_t : p.xp_t
      row[`p${p.player_slot}`] = arr?.[i] ?? 0
    })
    return row
  })

  let radiantIdx = 0
  let direIdx = 0

  return (
    <div>
      <TabBar mode={mode} setMode={setMode} />
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="minute" stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 11 }} label={{ value: 'min', position: 'insideRight', fill: '#4b5563', fontSize: 11 }} />
          <YAxis stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={formatGold} />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6 }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(v, name) => {
              const slot = parseInt(String(name).replace('p', ''))
              const p = players.find((x) => x.player_slot === slot)
              const hero = p ? heroMap?.get(p.hero_id) : undefined
              return [formatGold(Number(v)), hero?.localized_name ?? String(name)]
            }}
            labelFormatter={(l) => `Minute ${l}`}
          />
          <Legend
            formatter={(value) => {
              const slot = parseInt(value.replace('p', ''))
              const p = players.find((x) => x.player_slot === slot)
              const hero = p ? heroMap?.get(p.hero_id) : undefined
              return hero?.localized_name ?? value
            }}
            onClick={(e) => {
              const key = e.dataKey as string
              setHidden((prev) => {
                const next = new Set(prev)
                next.has(key) ? next.delete(key) : next.add(key)
                return next
              })
            }}
          />
          {players.map((p) => {
            const rad = isRadiant(p.player_slot)
            const color = rad
              ? RADIANT_COLORS[radiantIdx++ % RADIANT_COLORS.length]
              : DIRE_COLORS[direIdx++ % DIRE_COLORS.length]
            const key = `p${p.player_slot}`
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                dot={false}
                strokeWidth={2}
                hide={hidden.has(key)}
                strokeOpacity={hidden.has(key) ? 0.2 : 1}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function TabBar({ mode, setMode }: { mode: ChartMode; setMode: (m: ChartMode) => void }) {
  const tabs: { key: ChartMode; label: string }[] = [
    { key: 'gold', label: 'Gold' },
    { key: 'xp', label: 'XP' },
    { key: 'advantage', label: 'Team Gold Adv' },
  ]
  return (
    <div className="flex gap-1 mb-3">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setMode(key)}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            mode === key
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
