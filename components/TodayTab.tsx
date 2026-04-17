'use client'

import { useEffect, useState } from 'react'
import { Contact, getDaysSince, getDaysOverdue, isOverdue, sortByMostOverdue, TIER_THRESHOLDS } from '@/lib/types'
import TierBadge from './TierBadge'
import ContactAvatar from './ContactAvatar'

interface TodayTabProps {
  contacts: Contact[]
  skipped: Set<string>
  nudgeCache: Record<string, string>
  onNudgeCached: (id: string, nudge: string) => void
  onMarkReachedOut: (id: string) => void
  onSkip: (id: string) => void
  onDifferent: (id: string) => void
}

export default function TodayTab({
  contacts,
  skipped,
  nudgeCache,
  onNudgeCached,
  onMarkReachedOut,
  onSkip,
  onDifferent,
}: TodayTabProps) {
  const overdue = sortByMostOverdue(contacts.filter((c) => isOverdue(c) && !skipped.has(c.id)))
  const primary = overdue[0] ?? null
  const alsoOverdue = overdue.slice(1, 4)

  const [nudgeLoading, setNudgeLoading] = useState(false)

  useEffect(() => {
    if (!primary || nudgeCache[primary.id]) return
    fetchNudge(primary)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primary?.id])

  async function fetchNudge(contact: Contact) {
    setNudgeLoading(true)
    try {
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('reladex_anthropic_key') : null
      const res = await fetch('/api/nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          contact: {
            name: contact.name,
            context: contact.context,
            notes: contact.notes,
            daysSince: getDaysSince(contact.last_contact),
            channel: contact.channel,
            offer: contact.offer,
          },
        }),
      })
      const data = await res.json()
      onNudgeCached(contact.id, data.nudge)
    } catch {
      onNudgeCached(contact.id, 'A good time to reconnect.')
    } finally {
      setNudgeLoading(false)
    }
  }

  if (!primary) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-xl font-semibold mb-2">You&apos;re all caught up!</h2>
        <p className="text-[#6b6b66] text-sm">
          No overdue contacts right now. Keep up the great work.
        </p>
      </div>
    )
  }

  const daysSince = getDaysSince(primary.last_contact)
  const daysOverdue = getDaysOverdue(primary)
  const nudge = nudgeCache[primary.id]

  return (
    <div className="space-y-6">
      {/* Primary nudge card */}
      <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
        <p className="text-xs font-medium text-[#6b6b66] uppercase tracking-wide mb-4">
          Reach out today
        </p>
        <div className="flex items-start gap-4 mb-4">
          <ContactAvatar name={primary.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-lg font-semibold">{primary.name}</h2>
              <TierBadge tier={primary.tier} />
              <span className="text-xs bg-[#FAECE7] text-[#D85A30] px-2 py-0.5 rounded-full font-medium">
                {daysOverdue}d overdue
              </span>
            </div>
            <p className="text-sm text-[#6b6b66]">{primary.context}</p>
            <p className="text-xs text-[#6b6b66] mt-1">
              Last contact:{' '}
              {primary.last_contact
                ? `${daysSince} day${daysSince !== 1 ? 's' : ''} ago`
                : 'Never'}
              {' '}· via {primary.channel} · every {TIER_THRESHOLDS[primary.tier]}d
            </p>
          </div>
        </div>

        {/* Nudge reason */}
        <div className="bg-[#E1F5EE] rounded-lg p-4 mb-5 min-h-[64px] flex items-center">
          {nudgeLoading ? (
            <div className="space-y-2 w-full animate-pulse-subtle">
              <div className="h-3 bg-[#1D9E75]/20 rounded w-full" />
              <div className="h-3 bg-[#1D9E75]/20 rounded w-4/5" />
            </div>
          ) : (
            <p className="text-sm text-[#0F6E56]">{nudge ?? 'Loading reason...'}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onMarkReachedOut(primary.id)}
            className="bg-[#1D9E75] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#0F6E56] transition-colors"
          >
            ✓ Mark reached out
          </button>
          <button
            onClick={() => onSkip(primary.id)}
            className="border border-[#e5e5e0] text-[#6b6b66] rounded-lg px-4 py-2 text-sm font-medium hover:border-[#1a1a18] hover:text-[#1a1a18] transition-colors"
          >
            Skip
          </button>
          <button
            onClick={() => onDifferent(primary.id)}
            className="border border-[#e5e5e0] text-[#6b6b66] rounded-lg px-4 py-2 text-sm font-medium hover:border-[#1a1a18] hover:text-[#1a1a18] transition-colors"
          >
            ↻ Different person
          </button>
        </div>
      </div>

      {/* Also overdue */}
      {alsoOverdue.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#6b6b66] uppercase tracking-wide mb-3">
            Also overdue
          </h3>
          <div className="space-y-2">
            {alsoOverdue.map((contact) => {
              const daysOvr = getDaysOverdue(contact)
              return (
                <div
                  key={contact.id}
                  className="bg-white border border-[#e5e5e0] rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <ContactAvatar name={contact.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{contact.name}</span>
                      <TierBadge tier={contact.tier} />
                      <span className="text-xs bg-[#FAECE7] text-[#D85A30] px-2 py-0.5 rounded-full font-medium">
                        {daysOvr}d overdue
                      </span>
                    </div>
                    <p className="text-xs text-[#6b6b66] truncate">{contact.context}</p>
                  </div>
                  <button
                    onClick={() => onMarkReachedOut(contact.id)}
                    className="text-xs bg-[#E1F5EE] text-[#0F6E56] hover:bg-[#1D9E75] hover:text-white rounded-lg px-3 py-1.5 font-medium transition-colors flex-shrink-0"
                  >
                    Done
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
