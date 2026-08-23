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

export function LevelMenu({ solved = 2 }: { solved?: number }) { return <div className="border border-border bg-card p-4 font-mono text-sm">{levels.map((level, i) => { const state = i < solved ? 'OK' : i === solved ? '>' : 'LK'; return <div key={level} className={`flex gap-3 py-1 ${state === '>' ? 'text-primary terminal-glow' : state === 'LK' ? 'text-muted/60' : 'text-foreground'}`}><span className="w-5 text-right">{i + 1}.</span><span className="flex-1">{level}</span><span className="w-8">[{state}]</span></div> })}</div> }

export function FlagSubmit({ level = 3 }: { level?: number }) {
  const [flag, setFlag] = useState(''); const [message, setMessage] = useState(''); const [cooldown, setCooldown] = useState(0); const [attempts, setAttempts] = useState(0)
  useEffect(() => { if (!cooldown) return; const timer = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000); return () => clearInterval(timer) }, [cooldown])
  async function submit(e: FormEvent) { e.preventDefault(); if (!flag || cooldown) return; const next = attempts + 1; setAttempts(next); if (next >= 3) setCooldown(10); setMessage(flag === 'flag{welcome_to_the_shell}' ? 'ACCESS GRANTED — level solved.' : 'ACCESS DENIED — incorrect flag.'); setFlag('') }
  return <form onSubmit={submit} className="border border-border bg-card p-4"><div className="mb-3 flex items-center justify-between text-xs"><span className="text-muted">LEVEL {String(level).padStart(2, '0')} FLAG INPUT</span><span className="text-amber-300">{cooldown ? `cooldown: ${cooldown}s` : `${Math.max(0, 10 - attempts)} attempts left`}</span></div><div className="flex gap-2"><input value={flag} onChange={e => setFlag(e.target.value)} className="min-w-0 flex-1 border border-border bg-background px-3 py-3 font-mono text-sm text-primary" placeholder="TFS{}..." /><button disabled={!flag || !!cooldown} className="border border-primary px-4 text-xs text-primary hover:bg-primary hover:text-background disabled:cursor-not-allowed disabled:opacity-40">SUBMIT</button></div>{message && <p className={`mt-3 text-xs ${message.includes('GRANTED') ? 'text-primary' : 'text-amber-300'}`}>{message}</p>}</form>
}

export function LeaderboardTable() { const rows = [{prn:'2024•••184', solved:14, time:'Today, 14:02'}, {prn:'2024•••072', solved:12, time:'Today, 13:48'}, {prn:'2023•••901', solved:11, time:'Today, 13:41'}, {prn:'2024•••337', solved:9, time:'Today, 13:36'}, {prn:'2023•••615', solved:7, time:'Today, 13:12'}]; return <div className="overflow-x-auto border border-border bg-card"><table className="w-full text-left text-xs"><thead className="border-b border-border text-muted"><tr><th className="px-4 py-3">RANK</th><th className="px-4 py-3">PRN</th><th className="px-4 py-3">LEVELS SOLVED</th><th className="px-4 py-3">LAST SOLVE</th></tr></thead><tbody>{rows.map((r,i) => <tr key={r.prn} className="border-b border-border/60 last:border-0"><td className="px-4 py-3 text-primary">{String(i+1).padStart(2,'0')}</td><td className="px-4 py-3">{r.prn}</td><td className="px-4 py-3">{r.solved}/15</td><td className="px-4 py-3 text-muted">{r.time}</td></tr>)}</tbody></table></div> }

export function FooterPrompt() { return <p className="mt-8 text-xs text-muted"><span className="text-primary">shell@ctf:~$</span> <Link className="link" href="/login">login</Link> or <Link className="link" href="/register">register</Link><span className="blink ml-1">_</span></p> }
