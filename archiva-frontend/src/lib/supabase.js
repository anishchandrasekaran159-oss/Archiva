// src/lib/supabase.js
// Single Supabase client instance — import this everywhere you need auth or DB.
// Never create multiple clients; one is enough and avoids session conflicts.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// ── Auth helpers ──────────────────────────────────────────────────────────────

/** Returns the JWT access token for the current session, or null */
export async function getAccessToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}