'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) { window.location.href = '/admin/dashboard'; return }
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'ACCESS DENIED.')
    } catch { setError('NETWORK ERROR — is the server running?') } finally { setBusy(false) }
  }

  return (
    <main className="scanlines min-h-screen border-t-4 border-red-500">
      <div className="mx-auto max-w-lg px-5 py-14">
        <p className="mb-3 text-xs font-bold tracking-widest text-red-400">[ ADMIN ACCESS // RESTRICTED ZONE ]</p>
        <h1 className="text-2xl font-bold text-red-400 terminal-glow">Operator control</h1>
        <p className="mt-2 text-xs text-muted">Authorized personnel only. All actions are logged.</p>
        <form onSubmit={submit} className="mt-8 space-y-5 border border-red-500/60 bg-card p-5">
          <label className="block space-y-2 text-xs text-muted">
            <span>USERNAME</span>
            <input value={username} onChange={e => setUsername(e.target.value)} autoComplete="off" className="w-full border border-border bg-background px-3 py-3 font-mono text-sm text-red-300" placeholder="operator id" />
          </label>
          <label className="block space-y-2 text-xs text-muted">
            <span>PASSWORD</span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="off" className="w-full border border-border bg-background px-3 py-3 font-mono text-sm text-red-300" placeholder="••••••••" />
          </label>
          {error && <p className="text-xs font-bold text-red-400">{error}</p>}
          <button disabled={busy || !username || !password} className="w-full border border-red-500 bg-red-500/10 py-3 text-xs font-bold tracking-widest text-red-400 hover:bg-red-500 hover:text-background disabled:cursor-not-allowed disabled:opacity-40">{busy ? 'VERIFYING…' : 'AUTHENTICATE →'}</button>
        </form>
        <p className="mt-6 text-center text-xs text-muted"><Link className="link" href="/">← back to student portal</Link></p>
      </div>
    </main>
  )
}
