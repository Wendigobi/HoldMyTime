// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  // Accept either common var name or fallback
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    // Keep logs compact, don't leak secrets
    console.error("Missing Supabase env", {
      hasUrl: !!url,
      hasServiceKey: !!serviceKey,
      vercelEnv: process.env.VERCEL_ENV,
    });
    return null;
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
