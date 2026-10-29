export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatGold(gold: number): string {
  if (gold >= 1000) return `${(gold / 1000).toFixed(1)}k`
  return String(gold)
}

export function formatDate(unixTs: number): string {
  return new Date(unixTs * 1000).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function isRadiant(playerSlot: number): boolean {
  return playerSlot < 128
}

export function slotToPosition(playerSlot: number): number {
  return playerSlot < 128 ? playerSlot : playerSlot - 128
}
