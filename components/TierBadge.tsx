interface TierBadgeProps {
  tier: 1 | 2 | 3
}

const STYLES: Record<number, string> = {
  1: 'bg-[#E1F5EE] text-[#0F6E56]',
  2: 'bg-[#E6F1FB] text-[#185FA5]',
  3: 'bg-[#f0f0ee] text-[#6b6b66]',
}

export default function TierBadge({ tier }: TierBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STYLES[tier]}`}>
      T{tier}
    </span>
  )
}
