// app/api/businesses/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs' // or leave it out; but avoids edge runtime surprises
export const dynamic = 'force-dynamic'

const ALLOWED_TIERS = [25, 50, 75, 100] as const

function normalizeTier(input: unknown): number {
  // Strip anything that's not a digit and coerce to number
  const n = Number(String(input ?? '').replace(/[^\d]/g, ''))
  return (ALLOWED_TIERS as unknown as number[]).includes(n) ? n : 25
}

function toSlug(s: string): string {
  return String(s ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const owner_email = String(body.owner_email || '')
    const name = String(body.name || '')
    const slug = toSlug(body.slug || name)
    const email = body.email ? String(body.email) : null
    const phone = body.phone ? String(body.phone) : null
    const services =
      Array.isArray(body.services)
        ? body.services
        : typeof body.services === 'string'
        ? body.services.split(',').map((s: string) => s.trim()).filter(Boolean)
        : []

    const price_tier = normalizeTier(body.price_tier ?? body.tier ?? body.deposit)

    if (!owner_email || !name || !slug) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: owner_email, name, slug' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: 'Supabase admin not configured' },
        { status: 500 }
      )
    }

    // Optional: ensure slug is unique
    const { data: existing, error: findErr } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (findErr) throw findErr
    if (existing) {
      return NextResponse.json(
        { ok: false, error: 'Slug already exists. Please choose another.' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        owner_email,
        name,
        slug,
        email,
        phone,
        price_tier,     // *** numeric, validated (25/50/75/100)
        services,       // array
      })
      .select('slug')
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, slug: data.slug })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { ok: false, error: err?.message || 'Unknown error' },
      { status: 400 }
    )
  }
}
