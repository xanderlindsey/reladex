'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Contact,
  InteractionLog,
  getDaysSince,
  getDaysOverdue,
  getThreshold,
  isOverdue,
  sortByMostOverdue,
} from '@/lib/types'
import TierBadge from './TierBadge'
import ContactAvatar from './ContactAvatar'

interface ContactsTabProps {
  contacts: Contact[]
  userId: string
  onLog: (contactId: string, note?: string) => void
  onDelete: (id: string) => void
}

export default function ContactsTab({ contacts, userId, onLog, onDelete }: ContactsTabProps) {
  const [tierFilter, setTierFilter] = useState<0 | 1 | 2 | 3>(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [logs, setLogs] = useState<Record<string, InteractionLog[]>>({})
  const [logNote, setLogNote] = useState<Record<string, string>>({})
  const [logLoading, setLogLoading] = useState<Record<string, boolean>>({})
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = sortByMostOverdue(
    tierFilter === 0 ? contacts : contacts.filter((c) => c.tier === tierFilter)
  )

  const supabase = createClient()

  async function expand(contact: Contact) {
    if (expandedId === contact.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(contact.id)
    if (!logs[contact.id]) {
      const { data } = await supabase
        .from('interaction_log')
        .select('*')
        .eq('contact_id', contact.id)
        .order('date', { ascending: false })
        .limit(5)
      setLogs((prev) => ({ ...prev, [contact.id]: data ?? [] }))
    }
  }

  async function handleLog(contactId: string) {
    setLogLoading((prev) => ({ ...prev, [contactId]: true }))
    const note = logNote[contactId] ?? ''
    await onLog(contactId, note)
    const today = new Date().toISOString().split('T')[0]
    const newEntry: InteractionLog = {
      id: crypto.randomUUID(),
      contact_id: contactId,
      user_id: userId,
      date: today,
      note: note || undefined,
      created_at: new Date().toISOString(),
    }
    setLogs((prev) => ({ ...prev, [contactId]: [newEntry, ...(prev[contactId] ?? [])].slice(0, 5) }))
    setLogNote((prev) => ({ ...prev, [contactId]: '' }))
    setLogLoading((prev) => ({ ...prev, [contactId]: false }))
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[#6b6b66] mb-4">No contacts yet.</p>
        <p className="text-sm text-[#6b6b66]">Switch to the Add tab to add your first contact.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#6b6b66]">{filtered.length} contact{filtered.length !== 1 ? 's' : ''}</p>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(Number(e.target.value) as 0 | 1 | 2 | 3)}
          className="border border-[#e5e5e0] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] bg-white"
        >
          <option value={0}>All tiers</option>
          <option value={1}>Tier 1</option>
          <option value={2}>Tier 2</option>
          <option value={3}>Tier 3</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-[#6b6b66] text-sm py-8">No contacts in this tier.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((contact) => {
            const overdue = isOverdue(contact)
            const daysOvr = getDaysOverdue(contact)
            const daysSince = getDaysSince(contact.last_contact)
            const isExpanded = expandedId === contact.id
            const contactLogs = logs[contact.id] ?? []

            return (
              <div key={contact.id} className="bg-white border border-[#e5e5e0] rounded-xl overflow-hidden">
                <button
                  onClick={() => expand(contact)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[#f9f9f7] transition-colors"
                >
                  <ContactAvatar name={contact.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{contact.name}</span>
                      <TierBadge tier={contact.tier} />
                      {overdue && (
                        <span className="text-xs bg-[#FAECE7] text-[#D85A30] px-2 py-0.5 rounded-full font-medium">
                          {daysOvr}d overdue
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6b6b66] truncate">{contact.context}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#6b6b66]">
                      {contact.last_contact
                        ? `${daysSince}d ago`
                        : 'Never'}
                    </p>
                    <p className="text-xs text-[#6b6b66]">{contact.channel}</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-[#6b6b66] flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-[#e5e5e0]">
                    {/* Detail grid */}
                    <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
                      <div>
                        <p className="text-xs text-[#6b6b66] mb-0.5">Last contact</p>
                        <p className="text-sm font-medium">
                          {contact.last_contact
                            ? new Date(contact.last_contact).toLocaleDateString()
                            : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6b6b66] mb-0.5">Channel</p>
                        <p className="text-sm font-medium">{contact.channel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6b6b66] mb-0.5">Cadence target</p>
                        <p className="text-sm font-medium">
                          Every {getThreshold(contact)} days
                        </p>
                      </div>
                      {contact.offer && (
                        <div>
                          <p className="text-xs text-[#6b6b66] mb-0.5">What I can offer</p>
                          <p className="text-sm font-medium">{contact.offer}</p>
                        </div>
                      )}
                    </div>

                    {contact.notes && (
                      <div className="mb-4">
                        <p className="text-xs text-[#6b6b66] mb-1">Notes</p>
                        <p className="text-sm text-[#1a1a18] bg-[#f9f9f7] rounded-lg p-3">{contact.notes}</p>
                      </div>
                    )}

                    {/* Interaction log */}
                    <div className="mb-4">
                      <p className="text-xs text-[#6b6b66] mb-2 font-medium uppercase tracking-wide">
                        Recent interactions
                      </p>
                      {contactLogs.length === 0 ? (
                        <p className="text-xs text-[#6b6b66]">No interactions logged yet.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {contactLogs.map((log) => (
                            <div key={log.id} className="flex gap-2 text-sm">
                              <span className="text-xs text-[#6b6b66] flex-shrink-0 mt-0.5">
                                {new Date(log.date).toLocaleDateString()}
                              </span>
                              <span className="text-[#1a1a18]">{log.note ?? 'Reached out'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Log form */}
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={logNote[contact.id] ?? ''}
                        onChange={(e) => setLogNote((prev) => ({ ...prev, [contact.id]: e.target.value }))}
                        placeholder="Optional note..."
                        className="flex-1 border border-[#e5e5e0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                      />
                      <button
                        onClick={() => handleLog(contact.id)}
                        disabled={logLoading[contact.id]}
                        className="bg-[#1D9E75] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#0F6E56] transition-colors disabled:opacity-60 whitespace-nowrap"
                      >
                        {logLoading[contact.id] ? '...' : 'Log today'}
                      </button>
                    </div>

                    {/* Delete */}
                    {confirmDelete === contact.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#D85A30]">Delete this contact?</span>
                        <button
                          onClick={() => { onDelete(contact.id); setConfirmDelete(null) }}
                          className="text-sm text-white bg-[#D85A30] rounded-lg px-3 py-1.5 hover:bg-[#b84a25] transition-colors"
                        >
                          Yes, delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-sm text-[#6b6b66] hover:text-[#1a1a18]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(contact.id)}
                        className="text-xs text-[#6b6b66] hover:text-[#D85A30] transition-colors"
                      >
                        Delete contact
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
