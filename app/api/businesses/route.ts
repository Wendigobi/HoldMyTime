import { NextResponse } from 'next/server'
import getSupabaseAdmin from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'

function dollarsToCents(input: string | number) {
  const s = String(input).trim().replace('$', '')
  const n = Math.round(Number(s))
  const allowed = [25, 50, 75, 100]
  if (!allowed.includes(n)) throw new Error('Invalid deposit')
  return n * 100
}

export async function POST(req: Request) {
  try {
    const ct = req.headers.get('content-type') || ''
    let body: Record<string, any>

    if (ct.includes('application/json')) {
      body = await req.json()
    } else if (
      ct.includes('multipart/form-data') ||
      ct.includes('application/x-www-form-urlencoded')
    ) {
      const fd = await req.formData()
      body = Object.fromEntries(fd as any)
    } else {
      return NextResponse.json(
        { error: `Unsupported Content-Type: ${ct}` },
        { status: 415 }
      )
    }

    const {
      owner_email,
      name,
      slug,
      email,
      phone,
      deposit,        // "$75" | "75" | 75
      services = []   // string[]
    } = body

    if (!owner_email || !name || !slug || !email || !deposit) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const deposit_cents = dollarsToCents(deposit)

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        owner_email,
        name,
        slug,
        email,
        phone,
        deposit_cents,
        services,
      })
      .select('id, slug')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, business: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Server error' }, { status: 500 })
  }
}
