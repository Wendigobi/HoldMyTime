// lib/supabaseAdmin.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let admin: SupabaseClient | null = null;

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

// Always returns a SupabaseClient or throws (never null)
export default function getSupabaseAdmin(): SupabaseClient {
  if (admin) return admin;

  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  admin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  return admin;
}
