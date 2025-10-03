// app/env/page.tsx
export const dynamic = "force-dynamic";

function mask(v?: string | null) {
  if (!v) return null;
  if (v.length <= 8) return "********";
  return `${v.slice(0, 4)}…${v.slice(-4)}`;
}

export default function EnvPage() {
  const payload = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME ?? "nodejs",
    PUBLIC: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    },
    PRESENT: {
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    },
    MASKED: {
      NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null),
    },
  };
  return (
    <main style={{ padding: 24, fontFamily: "ui-monospace, monospace" }}>
      <h1>/env</h1>
      <pre>{JSON.stringify(payload, null, 2)}</pre>
    </main>
  );
}
