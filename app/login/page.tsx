'use client'

import { useState } from 'react'
import { PRNInput, Shell } from '@/components/terminal-ui'

export default function LoginPage() {
  const [prn, setPrn] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\d{9}$/.test(prn)) { setError('ERR: enter a valid 9-digit PRN.'); return }
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prn }) })
      const data = await res.json().catch(() => ({}))
      if (res.ok) { window.location.href = '/dashboard'; return }
      setError(res.status === 404 ? 'ERR 404: PRN not registered. Register first.' : `ERR ${res.status}: ${data.error || 'login failed.'}`)
    } catch { setError('ERR: network error — is the server running?') } finally { setBusy(false) }
  }
  return <Shell><div className="mx-auto max-w-lg"><p className="mb-3 text-xs text-amber-300">[ IDENTITY CHECK ]</p><h1 className="text-2xl font-bold text-primary">Enter the shell</h1><form onSubmit={submit} className="mt-8 space-y-5 border border-border bg-card p-5"><PRNInput value={prn} onChange={setPrn} />{error && <p className="text-xs text-amber-300">{error}</p>}<button disabled={busy} className="w-full border border-primary py-3 text-xs font-bold text-primary hover:bg-primary hover:text-background disabled:cursor-not-allowed disabled:opacity-40">{busy ? 'AUTHENTICATING…' : 'AUTHENTICATE →'}</button></form></div></Shell>
}
