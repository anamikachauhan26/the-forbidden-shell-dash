import { NextResponse } from 'next/server'
export async function POST(request: Request) { const { prn } = await request.json(); if (!/^\d{9}$/.test(prn || '')) return NextResponse.json({ error: 'Invalid PRN' }, { status: 400 }); return NextResponse.json({ ok: true, prn }) }
