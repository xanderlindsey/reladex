'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Contact } from '@/lib/types'
import TodayTab from './TodayTab'
import ContactsTab from './ContactsTab'
import AddTab from './AddTab'
import SettingsTab from './SettingsTab'
import SetupModal from './SetupModal'

type Tab = 'today' | 'contacts' | 'add' | 'settings'

interface DashboardShellProps {
  userEmail: string
  userId: string
  initialContacts: Contact[]
}

export default function DashboardShell({ userEmail, userId, initialContacts }: DashboardShellProps) {
  const [activeTab, setActiveTab] = useState<Tab>('today')
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [showSetup, setShowSetup] = useState(false)
  const [skipped, setSkipped] = useState<Set<string>>(new Set())
  const [nudgeCache, setNudgeCache] = useState<Record<string, string>>({})

  const supabase = createClient()

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('reladex_anthropic_key')) {
      setShowSetup(true)
    }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function logInteraction(contactId: string, note?: string) {
    const today = new Date().toISOString().split('T')[0]
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, last_contact: today } : c))
    )
    await supabase.from('interaction_log').insert({
      contact_id: contactId,
      user_id: userId,
      date: today,
      note: note || null,
    })
    await supabase.from('contacts').update({ last_contact: today }).eq('id', contactId)
  }

  async function addContact(contact: Omit<Contact, 'id' | 'user_id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('contacts')
      .insert({ ...contact, user_id: userId })
      .select()
      .single()
    if (!error && data) {
      setContacts((prev) => [data, ...prev])
    }
    return !error
  }

  async function deleteContact(id: string) {
    setContacts((prev) => prev.filter((c) => c.id !== id))
    await supabase.from('contacts').delete().eq('id', id)
  }

  async function deleteAllData() {
    await supabase.from('contacts').delete().eq('user_id', userId)
    setContacts([])
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'add', label: '+ Add' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <>
      {showSetup && <SetupModal onClose={() => setShowSetup(false)} />}

      <div className="min-h-screen bg-[#f9f9f7]">
        {/* Top nav */}
        <nav className="bg-white border-b border-[#e5e5e0] sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-2xl font-display font-semibold">
              <span className="text-[#1a1a18]">Rela</span>
              <span className="text-[#1D9E75]">dex</span>
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#6b6b66] hidden sm:block">{userEmail}</span>
              <button
                onClick={signOut}
                className="text-sm text-[#6b6b66] hover:text-[#1a1a18] border border-[#e5e5e0] rounded-lg px-3 py-1.5 hover:border-[#1a1a18] transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </nav>

        {/* Tab nav */}
        <div className="bg-white border-b border-[#e5e5e0]">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#1D9E75] text-[#1D9E75]'
                      : 'border-transparent text-[#6b6b66] hover:text-[#1a1a18]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 py-6">
          {activeTab === 'today' && (
            <TodayTab
              contacts={contacts}
              skipped={skipped}
              nudgeCache={nudgeCache}
              onNudgeCached={(id, nudge) => setNudgeCache((prev) => ({ ...prev, [id]: nudge }))}
              onMarkReachedOut={(id) => logInteraction(id)}
              onSkip={(id) => setSkipped((prev) => new Set([...prev, id]))}
              onDifferent={(id) => setSkipped((prev) => new Set([...prev, id]))}
            />
          )}
          {activeTab === 'contacts' && (
            <ContactsTab
              contacts={contacts}
              userId={userId}
              onLog={logInteraction}
              onDelete={deleteContact}
            />
          )}
          {activeTab === 'add' && (
            <AddTab
              onAdd={async (contact) => {
                const success = await addContact(contact)
                if (success) setActiveTab('contacts')
              }}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsTab
              userEmail={userEmail}
              onSignOut={signOut}
              onDeleteAll={deleteAllData}
            />
          )}
        </div>
      </div>
    </>
  )
}
