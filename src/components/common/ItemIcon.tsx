interface Props {
  itemKey: string
  size?: number
  title?: string
  className?: string
}

export function ItemIcon({ itemKey, size = 28, title, className = '' }: Props) {
  if (!itemKey || itemKey === '0') {
    return (
      <div
        className={`bg-gray-800 border border-gray-700 rounded ${className}`}
        style={{ width: size, height: Math.round(size * 0.75) }}
      />
    )
  }

  const src = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${itemKey}.png`

  return (
    <img
      src={src}
      alt={title || itemKey}
      title={title || itemKey}
      width={size}
      height={Math.round(size * 0.75)}
      className={`rounded object-cover ${className}`}
      onError={(e) => {
        ;(e.target as HTMLImageElement).style.opacity = '0.2'
      }}
    />
  )
}
