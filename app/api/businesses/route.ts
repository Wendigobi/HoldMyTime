import { NextResponse } from 'next/server';
import { z } from 'zod';
import getSupabaseAdmin from '@/lib/supabaseAdmin';
import { supabaseServer } from '@/lib/supabaseServer';

const schema = z.object({
  owner_email: z.string().email(),
  name: z.string().min(2).max(60),
  slug: z.string().min(2).max(64).regex(/^[a-z0-9-]+$/i, 'Letters, numbers, dashes only'),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  deposit: z.number().int().refine((n) => [25, 50, 75, 100].includes(n), 'Invalid deposit'),
  services: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);

    const server = supabaseServer();
    const { data: { user } } = await server.auth.getUser();

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('businesses')
      .insert([{
        owner_user: user?.id ?? null,
        owner_email: parsed.owner_email,
        name: parsed.name,
        slug: parsed.slug.toLowerCase(),
        email: parsed.email,
        phone: parsed.phone,
        deposit: parsed.deposit,
        services: parsed.services ?? [],
      }])
      .select('*')
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad request' }, { status: 400 });
  }
}
