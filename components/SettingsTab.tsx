'use client'

import { useState, useEffect } from 'react'

interface SettingsTabProps {
  userEmail: string
  onSignOut: () => void
  onDeleteAll: () => Promise<void>
}

export default function SettingsTab({ userEmail, onSignOut, onDeleteAll }: SettingsTabProps) {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('reladex_anthropic_key')
    if (stored) setApiKey(stored)
  }, [])

  function handleSaveKey() {
    if (apiKey.trim()) {
      localStorage.setItem('reladex_anthropic_key', apiKey.trim())
    } else {
      localStorage.removeItem('reladex_anthropic_key')
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleDeleteAll() {
    setDeleting(true)
    await onDeleteAll()
    setDeleting(false)
    setConfirmDelete(false)
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Account */}
      <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
        <h2 className="text-base font-semibold mb-4">Account</h2>
        <p className="text-sm text-[#6b6b66] mb-4">Signed in as <strong className="text-[#1a1a18]">{userEmail}</strong></p>
        <button
          onClick={onSignOut}
          className="border border-[#e5e5e0] text-[#6b6b66] rounded-lg px-4 py-2 text-sm font-medium hover:border-[#1a1a18] hover:text-[#1a1a18] transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* API Key */}
      <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
        <h2 className="text-base font-semibold mb-1">Anthropic API Key</h2>
        <p className="text-xs text-[#6b6b66] mb-4">
          Stored only in your browser. Used to generate personalized nudges.
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="flex-1 border border-[#e5e5e0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
          />
          <button
            onClick={handleSaveKey}
            className="bg-[#1D9E75] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#0F6E56] transition-colors whitespace-nowrap"
          >
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
        <h2 className="text-base font-semibold text-[#D85A30] mb-1">Danger zone</h2>
        <p className="text-xs text-[#6b6b66] mb-4">
          This will permanently delete all your contacts and interaction logs.
        </p>
        {confirmDelete ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#D85A30]">Are you sure? This cannot be undone.</span>
            <button
              onClick={handleDeleteAll}
              disabled={deleting}
              className="text-sm text-white bg-[#D85A30] rounded-lg px-3 py-1.5 hover:bg-[#b84a25] transition-colors disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Yes, delete all'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-sm text-[#6b6b66] hover:text-[#1a1a18]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="border border-[#D85A30] text-[#D85A30] rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#FAECE7] transition-colors"
          >
            Delete all my data
          </button>
        )}
      </div>
    </div>
  )
}
