import { NextResponse } from 'next/server'
export async function POST(request: Request) { const { level, flag } = await request.json(); const solved = level === 3 && flag === 'flag{welcome_to_the_shell}'; return NextResponse.json({ ok: solved, solved, message: solved ? 'Level solved' : 'Incorrect flag' }, { status: solved ? 200 : 422 }) }
