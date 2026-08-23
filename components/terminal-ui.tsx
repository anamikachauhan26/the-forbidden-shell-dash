'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'

export const levels = ['First Contact','What the Wipe Missed','Nobody Reads This','Stack Trace','Dead Letter','Root of Trust','Null Pointer','The Air Gap','Side Channel','Ghost Process','Backdoor Blues','Memory Lane','Kernel Panic','Last Resort','The Forbidden Shell']

export function Shell({ children, title = 'THE FORBIDDEN SHELL' }: { children: React.ReactNode; title?: string }) {
  return <main className="scanlines ascii-text min-h-screen"><header className="mx-auto flex max-w-5xl items-center justify-between border-b border-border px-5 py-5"><Link href="/" className="pixel-text terminal-glow text-sm text-primary">{title}</Link><nav className="flex gap-4 text-xs text-muted"><Link className="link uppercase" href="/dashboard">[ dashboard ]</Link><Link className="link uppercase" href="/leaderboard">[ leaderboard ]</Link></nav></header><div className="mx-auto max-w-5xl px-5 py-10">{children}</div></main>
}

export function PRNInput({ value, onChange, label = 'PRN', name = 'prn' }: { value: string; onChange: (v: string) => void; label?: string; name?: string }) {
  const invalid = value.length > 0 && !/^\d{9}$/.test(value)
  return <label className="block space-y-2 text-xs text-muted"><span>{label} <span className="text-primary">(9 digits)</span></span><input name={name} value={value} onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 9))} inputMode="numeric" autoComplete="off" className="w-full border border-border bg-card px-3 py-3 font-mono text-sm text-primary placeholder:text-muted/50" placeholder="e.g. 202401234" aria-invalid={invalid} />{invalid && <span className="block text-amber-300">ERR: PRN must contain exactly 9 digits.</span>}</label>
}

export function LevelMenu({ solvedLevels = [] }: { solvedLevels?: number[] }) {
  const solvedSet = new Set(solvedLevels)
  const next = solvedLevels.length + 1
  return <div className="border border-border bg-card p-4 font-mono text-sm">{levels.map((level, i) => { const n = i + 1; const state = solvedSet.has(n) ? 'OK' : n === next ? '>' : 'LK'; return <div key={level} className={`flex gap-3 py-1 ${state === '>' ? 'text-primary terminal-glow' : state === 'LK' ? 'text-muted/60' : 'text-foreground'}`}><span className="w-5 text-right">{n}.</span><span className="flex-1">{level}</span><span className="w-8">[{state}]</span></div> })}</div>
}

export function FlagSubmit({ level = 3, onSuccess }: { level?: number; onSuccess?: () => void }) {
  const [flag, setFlag] = useState(''); const [message, setMessage] = useState(''); const [granted, setGranted] = useState(false); const [cooldown, setCooldown] = useState(0); const [busy, setBusy] = useState(false)
  useEffect(() => { if (!cooldown) return; const timer = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000); return () => clearInterval(timer) }, [cooldown])
  async function submit(e: FormEvent) {
    e.preventDefault(); if (!flag || cooldown || busy) return
    setBusy(true); setMessage('')
    try {
      const res = await fetch('/api/submit-flag', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ level, flag }) })
      if (res.status === 401) { window.location.href = '/login'; return }
      const data = await res.json().catch(() => ({ error: 'Unexpected response.' }))
      if (res.ok) { setMessage(`ACCESS GRANTED — level ${String(level).padStart(2, '0')} solved.`); setGranted(true); setFlag(''); onSuccess?.() }
      else if (res.status === 429) { const retry = Number(res.headers.get('Retry-After')) || 10; setCooldown(retry); setMessage(`RATE LIMITED — retry in ${retry}s.`); setGranted(false) }
      else { setMessage(`ACCESS DENIED — ${data.error || 'incorrect flag.'}`); setGranted(false); setFlag('') }
    } catch { setMessage('NETWORK ERROR — is the server running?'); setGranted(false) } finally { setBusy(false) }
  }
  return <form onSubmit={submit} className="border border-border bg-card p-4"><div className="mb-3 flex items-center justify-between text-xs"><span className="text-muted">LEVEL {String(level).padStart(2, '0')} FLAG INPUT</span><span className="text-amber-300">{cooldown ? `cooldown: ${cooldown}s` : ''}</span></div><div className="flex gap-2"><input value={flag} onChange={e => setFlag(e.target.value)} className="min-w-0 flex-1 border border-border bg-background px-3 py-3 font-mono text-sm text-primary" placeholder="TFS{}..." /><button disabled={!flag || !!cooldown || busy} className="border border-primary px-4 text-xs text-primary hover:bg-primary hover:text-background disabled:cursor-not-allowed disabled:opacity-40">SUBMIT</button></div>{message && <p className={`mt-3 text-xs ${granted ? 'text-primary' : 'text-amber-300'}`}>{message}</p>}</form>
}

type LeaderboardRow = { prn: string; levels_solved: number; last_solve_at: string | null }

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function LeaderboardTable({ pollMs = 7000 }: { pollMs?: number }) {
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch('/api/leaderboard')
        if (!active) return
        if (!res.ok) { setError(res.status === 429 ? 'rate limited — retrying…' : 'failed to load leaderboard'); return }
        const json = await res.json()
        setRows(json.data); setError('')
      } catch { if (active) setError('network error') }
    }
    load()
    const timer = setInterval(load, pollMs)
    return () => { active = false; clearInterval(timer) }
  }, [pollMs])
  if (error) return <div className="border border-border bg-card p-4 text-xs text-amber-300">ERR: {error}</div>
  return <div className="overflow-x-auto border border-border bg-card"><table className="w-full text-left text-xs"><thead className="border-b border-border text-muted"><tr><th className="px-4 py-3">RANK</th><th className="px-4 py-3">PRN</th><th className="px-4 py-3">LEVELS SOLVED</th><th className="px-4 py-3">LAST SOLVE</th></tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={4} className="px-4 py-6 text-center text-muted">no operators registered yet.</td></tr> : rows.map((r, i) => <tr key={r.prn} className="border-b border-border/60 last:border-0"><td className="px-4 py-3 text-primary">{String(i + 1).padStart(2, '0')}</td><td className="px-4 py-3">{r.prn}</td><td className="px-4 py-3">{r.levels_solved}/15</td><td className="px-4 py-3 text-muted">{formatTime(r.last_solve_at)}</td></tr>)}</tbody></table></div>
}

export function FooterPrompt() { return <p className="mt-8 text-xs text-muted"><span className="text-primary">shell@ctf:~$</span> <Link className="link" href="/login">login</Link> or <Link className="link" href="/register">register</Link><span className="blink ml-1">_</span></p> }
