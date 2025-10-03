'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { getBrowserSupabase } from '@/lib/supabaseBrowser'

export default function Login() {
  const supabase = getBrowserSupabase()
  return (
    <div className="mx-auto max-w-md p-6 text-center">
      <h1 className="text-2xl font-semibold mb-4 text-gold">Sign in</h1>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
        redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined}
        theme="dark"
      />
    </div>
  )
}
