'use client'

import { useState } from 'react'
import { Contact } from '@/lib/types'

type NewContact = Omit<Contact, 'id' | 'user_id' | 'created_at'>

const TIER_DEFAULT_DAYS: Record<number, number> = { 1: 30, 2: 90, 3: 180 }

const FREQUENCY_OPTIONS = [
  { label: 'Weekly', days: 7 },
  { label: 'Monthly', days: 30 },
  { label: 'Quarterly', days: 90 },
  { label: 'Bi-annual', days: 180 },
]

interface AddTabProps {
  onAdd: (contact: NewContact) => Promise<void>
}

const CHANNELS = ['Text', 'Email', 'LinkedIn', 'Call', 'In person']

export default function AddTab({ onAdd }: AddTabProps) {
  const [form, setForm] = useState<NewContact>({
    name: '',
    context: '',
    tier: 1,
    channel: 'Text',
    offer: '',
    notes: '',
    last_contact: undefined,
    reminder_days: 30,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof NewContact, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleTierChange(tier: number) {
    setForm((prev) => ({ ...prev, tier: tier as 1 | 2 | 3, reminder_days: TIER_DEFAULT_DAYS[tier] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.context.trim()) {
      setError('Name and context are required.')
      return
    }
    setLoading(true)
    setError('')
    await onAdd({
      ...form,
      offer: form.offer || undefined,
      notes: form.notes || undefined,
    })
    setForm({ name: '', context: '', tier: 1, channel: 'Text', offer: '', notes: '', last_contact: undefined, reminder_days: 30 })
    setLoading(false)
  }

  return (
    <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-6">Add a contact</h2>

      {error && (
        <div className="bg-[#FAECE7] text-[#D85A30] rounded-lg p-3 mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Name <span className="text-[#D85A30]">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            className="w-full border border-[#e5e5e0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
            placeholder="Jane Smith"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Context <span className="text-[#D85A30]">*</span>
          </label>
          <input
            type="text"
            value={form.context}
            onChange={(e) => set('context', e.target.value)}
            required
            className="w-full border border-[#e5e5e0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
            placeholder="e.g. Ex-colleague from Google, now at Stripe"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tier</label>
            <select
              value={form.tier}
              onChange={(e) => handleTierChange(Number(e.target.value))}
              className="w-full border border-[#e5e5e0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] bg-white"
            >
              <option value={1}>Tier 1 — closest</option>
              <option value={2}>Tier 2 — medium</option>
              <option value={3}>Tier 3 — distant</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Channel</label>
            <select
              value={form.channel}
              onChange={(e) => set('channel', e.target.value)}
              className="w-full border border-[#e5e5e0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] bg-white"
            >
              {CHANNELS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Reminder frequency</label>
          <select
            value={form.reminder_days}
            onChange={(e) => set('reminder_days', Number(e.target.value))}
            className="w-full border border-[#e5e5e0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] bg-white"
          >
            {FREQUENCY_OPTIONS.map((opt) => (
              <option key={opt.days} value={opt.days}>
                {opt.label} — every {opt.days}d
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">What I can offer them</label>
          <input
            type="text"
            value={form.offer}
            onChange={(e) => set('offer', e.target.value)}
            className="w-full border border-[#e5e5e0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
            placeholder="Intros, design feedback, startup advice..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes about their world</label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
            className="w-full border border-[#e5e5e0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent resize-none"
            placeholder="Recently moved to SF, has a new baby, just closed Series A..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1D9E75] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#0F6E56] transition-colors disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Save contact'}
        </button>
      </form>
    </div>
  )
}
