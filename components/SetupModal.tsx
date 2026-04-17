'use client'

import { useState } from 'react'

export default function SetupModal({ onClose }: { onClose: () => void }) {
  const [apiKey, setApiKey] = useState('')

  function handleSave() {
    if (apiKey.trim()) {
      localStorage.setItem('reladex_anthropic_key', apiKey.trim())
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl border border-[#e5e5e0] p-8 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-2">Welcome to Reladex</h2>
        <p className="text-sm text-[#6b6b66] mb-6">
          To get AI-generated nudges, add your Anthropic API key. It&apos;s stored only in your
          browser and never sent to our servers. You can skip this and add it later in Settings.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Anthropic API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full border border-[#e5e5e0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-[#1D9E75] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#0F6E56] transition-colors"
          >
            Save & continue
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-[#e5e5e0] text-[#6b6b66] rounded-lg py-2.5 text-sm font-medium hover:border-[#1a1a18] hover:text-[#1a1a18] transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
