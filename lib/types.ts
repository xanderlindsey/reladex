export interface Contact {
  id: string
  user_id: string
  name: string
  context: string
  tier: 1 | 2 | 3
  channel: string
  offer?: string
  notes?: string
  last_contact?: string
  reminder_days?: number
  created_at: string
}

export interface InteractionLog {
  id: string
  contact_id: string
  user_id: string
  date: string
  note?: string
  created_at: string
}

export const TIER_THRESHOLDS: Record<number, number> = { 1: 30, 2: 90, 3: 180 }
export const TIER_LABELS: Record<number, string> = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3' }
export const TIER_CADENCE: Record<number, string> = {
  1: 'Every 30 days',
  2: 'Every 90 days',
  3: 'Every 180 days',
}

export function getDaysSince(lastContact?: string): number {
  if (!lastContact) return 999
  const last = new Date(lastContact)
  const now = new Date()
  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
}

export function getThreshold(contact: Contact): number {
  return contact.reminder_days ?? TIER_THRESHOLDS[contact.tier]
}

export function isOverdue(contact: Contact): boolean {
  return getDaysSince(contact.last_contact) > getThreshold(contact)
}

export function getDaysOverdue(contact: Contact): number {
  return getDaysSince(contact.last_contact) - getThreshold(contact)
}

export function sortByMostOverdue(contacts: Contact[]): Contact[] {
  return [...contacts].sort((a, b) => getDaysOverdue(b) - getDaysOverdue(a))
}
