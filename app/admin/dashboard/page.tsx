'use client'

import { useCallback, useEffect, useState } from 'react'

type Stats = { students: number; totalFlagsSubmitted: number; updatedAt: string }

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [resetConfirm, setResetConfirm] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [resetError, setResetError] = useState('')
  const [busy, setBusy] = useState(false)
  const [exporting, setExporting] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.status === 401) { window.location.href = '/admin/login'; return }
      if (res.ok) setStats(await res.json())
    } catch { /* keep last known stats */ }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(load, 5000)
    return () => clearInterval(timer)
  }, [load])

  async function exportXlsx() {
    setExporting(true)
    try {
      const res = await fetch('/api/admin/export')
      if (res.status === 401) { window.location.href = '/admin/login'; return }
      if (!res.ok) { alert('Export failed.'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'forbidden-shell-results.xlsx'
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
    } finally { setExporting(false) }
  }

  async function resetData() {
    if (resetConfirm !== 'RESET' || busy) return
    setBusy(true); setResetError(''); setResetMessage('')
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'RESET' }),
      })
      if (res.status === 401) { window.location.href = '/admin/login'; return }
      const data = await res.json().catch(() => ({}))
      if (res.ok) { setResetMessage(data.message || 'Reset complete.'); setResetConfirm(''); load() }
      else setResetError(data.error || 'Reset failed.')
    } catch { setResetError('NETWORK ERROR.') } finally { setBusy(false) }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
    window.location.href = '/admin/login'
  }

  return (
    <main className="scanlines min-h-screen border-t-4 border-red-500">
      <header className="mx-auto flex max-w-5xl items-center justify-between border-b border-border px-5 py-5">
        <span className="pixel-text text-sm text-red-400 terminal-glow">ADMIN CONTROL</span>
        <nav className="flex items-center gap-4 text-xs text-muted">
          <a className="link uppercase" href="/" target="_blank" rel="noreferrer">[ student site ]</a>
          <button onClick={logout} className="border border-red-500/60 px-3 py-1 text-xs text-red-400 hover:bg-red-500 hover:text-background">LOGOUT</button>
        </nav>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10">
        <p className="mb-3 text-xs font-bold tracking-widest text-red-400">[ SESSION OVERVIEW // LIVE ]</p>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="border border-border bg-card p-5">
            <p className="text-xs text-muted">REGISTERED STUDENTS</p>
            <p className="mt-2 text-4xl font-bold text-primary">{stats ? stats.students : '…'}</p>
          </div>
          <div className="border border-border bg-card p-5">
            <p className="text-xs text-muted">TOTAL FLAGS SUBMITTED</p>
            <p className="mt-2 text-4xl font-bold text-primary">{stats ? stats.totalFlagsSubmitted : '…'}</p>
          </div>
        </section>
        <p className="mt-2 text-[10px] text-muted/60">auto-refreshes every 5s{stats ? ` · last update ${new Date(stats.updatedAt).toLocaleTimeString()}` : ''}</p>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="border border-border bg-card p-5">
            <h2 className="text-sm font-bold text-primary">EXPORT RESULTS (.xlsx)</h2>
            <p className="mt-2 text-xs leading-5 text-muted">Full PRNs, names, solve counts and per-level timestamps for every registered player.</p>
            <button onClick={exportXlsx} disabled={exporting} className="mt-4 border border-primary px-4 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-background disabled:cursor-not-allowed disabled:opacity-40">{exporting ? 'GENERATING…' : 'DOWNLOAD .XLSX ↓'}</button>
          </div>

          <div className="border border-red-500/60 bg-card p-5">
            <h2 className="text-sm font-bold text-red-400">DANGER ZONE — CLEAR ALL STUDENT DATA</h2>
            <p className="mt-2 text-xs leading-5 text-red-300/80">Deletes all players and progress. Irreversible. Flag hashes are preserved. The action is logged.</p>
            <input value={resetConfirm} onChange={e => setResetConfirm(e.target.value)} className="mt-4 w-full border border-red-500/60 bg-background px-3 py-2 font-mono text-sm text-red-300" placeholder='type "RESET" to confirm' />
            <button onClick={resetData} disabled={resetConfirm !== 'RESET' || busy} className="mt-3 w-full border border-red-500 bg-red-500/10 py-2 text-xs font-bold tracking-widest text-red-400 hover:bg-red-500 hover:text-background disabled:cursor-not-allowed disabled:opacity-40">{busy ? 'WIPING…' : 'WIPE ALL STUDENT DATA'}</button>
            {resetMessage && <p className="mt-3 text-xs text-primary">{resetMessage}</p>}
            {resetError && <p className="mt-3 text-xs text-red-400">{resetError}</p>}
          </div>
        </section>
      </div>
    </main>
  )
}
