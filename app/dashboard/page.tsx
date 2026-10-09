'use client'

import { useCallback, useEffect, useState } from 'react'
import { FlagSubmit, LevelMenu, Shell, levels } from '@/components/terminal-ui'

type Progress = {
  prn: string
  name: string | null
  solvedLevels: number[]
  solvedCount: number
  nextLevel: number
}

export default function DashboardPage() {
  const [progress, setProgress] = useState<Progress | null>(null)
  const [state, setState] = useState<'loading' | 'authed' | 'anon'>('loading')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/progress')
      if (res.status === 401) { setState('anon'); return }
      if (!res.ok) { setState('anon'); return }
      setProgress(await res.json()); setState('authed')
    } catch { setState('anon') }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <Shell>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <p className="mb-3 text-xs text-amber-300">[ BOOT SEQUENCE COMPLETE ]</p>
          <h1 className="text-2xl font-bold text-primary">
            Welcome back{progress?.name ? `, ${progress.name}` : ', operator.'}
          </h1>
          {state === 'loading' && <p className="mt-2 text-xs text-muted">loading session…</p>}
          {state === 'anon' && (
            <p className="mt-2 text-xs text-amber-300">No active session. <a className="link" href="/login">Login</a> or <a className="link" href="/register">register</a> first.</p>
          )}
          {progress && (progress.solvedCount >= levels.length ? (
            <p className="mt-2 text-xs font-bold text-primary terminal-glow">
              ALL {levels.length} NODES CLEARED — the shell has nothing left to hide.
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted">
              Progress: {progress.solvedCount}/{levels.length} levels solved · current node: {String(progress.nextLevel).padStart(2, '0')}
            </p>
          ))}
          {progress && <div className="mt-8"><LevelMenu solvedLevels={progress.solvedLevels} /></div>}
        </section>
        {progress && progress.solvedCount < levels.length && (
          <aside>
            <FlagSubmit level={progress.nextLevel} onSuccess={load} />
            <p className="mt-4 text-xs leading-5 text-muted">Tip: flags are case-sensitive. Read everything. Especially the things that look unimportant.</p>
          </aside>
        )}
      </div>
    </Shell>
  )
}
