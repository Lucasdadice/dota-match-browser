const CDN = 'https://cdn.cloudflare.steamstatic.com'

interface Props {
  itemKey: string
  imgPath?: string  // /apps/dota2/... path from OpenDota constants — preferred over key
  size?: number
  title?: string
  className?: string
}

export function ItemIcon({ itemKey, imgPath, size = 28, title, className = '' }: Props) {
  if (!itemKey || itemKey === '0') {
    return (
      <div
        className={`bg-gray-800 border border-gray-700 rounded ${className}`}
        style={{ width: size, height: Math.round(size * 0.75) }}
      />
    )
  }

  const src = imgPath
    ? `${CDN}${imgPath}`
    : `${CDN}/apps/dota2/images/dota_react/items/${itemKey}.png`

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
