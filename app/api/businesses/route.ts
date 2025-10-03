// app/api/businesses/route.ts
import { NextResponse } from 'next/server'
import getSupabaseAdmin from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// (unchanged) helpers…
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sanitize(form: FormData) {
  const owner_email = String(form.get('owner_email') || '').trim().toLowerCase()
  const name = String(form.get('name') || '').trim()
  const email = String(form.get('email') || '').trim().toLowerCase()
  const phone = String(form.get('phone') || '').trim()
  const depositRaw = String(form.get('deposit') || '').trim()

  const dep = Number(depositRaw) // expecting 25 / 50 / 75 / 100 (see <select>)
  if (![25, 50, 75, 100].includes(dep)) throw new Error('Invalid deposit value')

  const servicesRaw = String(form.get('services') || '')
  const services = servicesRaw
    ? servicesRaw.split(',').map(s => s.trim()).filter(Boolean)
    : []

  if (!owner_email || !email) throw new Error('Email is required')
  if (!name) throw new Error('Business name is required')

  return { owner_email, name, email, phone, dep, services }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const { owner_email, name, email, phone, dep, services } = sanitize(form)

    const supabase = getSupabaseAdmin()
    if (!supabase) return NextResponse.json({ error: 'Server error' }, { status: 500 })

    // ensure unique slug
    const base = slugify(name)
    let suffix = 0
    let candidate = base
    while (true) {
      const { data, error } = await supabase
        .from('businesses')
        .select('slug')
        .eq('slug', candidate)
        .maybeSingle()

      if (error) throw error
      if (!data) break
      suffix++
      candidate = `${base}-${suffix}`
    }

    const deposit_cents = dep * 100

    const { data: created, error: insertErr } = await supabase
      .from('businesses')
      .insert({
        owner_email,
        name,
        slug: candidate,
        email,
        phone,
        deposit_cents,     // <-- correct column in cents
        services,          // text[] column
      })
      .select('slug')
      .single()

    if (insertErr) throw insertErr

    return NextResponse.json({ ok: true, slug: created.slug })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 400 })
  }
}
