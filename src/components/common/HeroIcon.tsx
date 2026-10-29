import type { Hero } from '../../api/types'

interface Props {
  hero: Hero | undefined
  size?: number
  className?: string
}

export function HeroIcon({ hero, size = 32, className = '' }: Props) {
  if (!hero) {
    return (
      <div
        className={`bg-gray-700 rounded ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  const src = `https://cdn.cloudflare.steamstatic.com${hero.icon}`

  return (
    <img
      src={src}
      alt={hero.localized_name}
      title={hero.localized_name}
      width={size}
      height={size}
      className={`rounded object-cover ${className}`}
      onError={(e) => {
        ;(e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}
