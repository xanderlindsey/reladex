interface ContactAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const COLORS = [
  'bg-[#E1F5EE] text-[#0F6E56]',
  'bg-[#E6F1FB] text-[#185FA5]',
  'bg-[#FFF3E0] text-[#9E5A1D]',
  'bg-[#F3E6F5] text-[#7A1D9E]',
  'bg-[#FAECE7] text-[#9E3A1D]',
]

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function getColor(name: string): string {
  const idx = name.charCodeAt(0) % COLORS.length
  return COLORS[idx]
}

export default function ContactAvatar({ name, size = 'md' }: ContactAvatarProps) {
  return (
    <div
      className={`${SIZE_CLASSES[size]} ${getColor(name)} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}
    >
      {getInitials(name)}
    </div>
  )
}
