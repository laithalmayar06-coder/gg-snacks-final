import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined
let staffClient: SupabaseClient | undefined

export function getStaffSupabase(): SupabaseClient {
  if (staffClient) return staffClient
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  if (!url || !key) throw new Error('Supabase configuration is missing')
  staffClient = createClient(url, key, {
    auth: { storageKey: 'gg-staff-session', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  })
  return staffClient
}

export function getSupabase(): SupabaseClient {
  if (client) return client
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  if (!url || !key) throw new Error('Supabase configuration is missing')
  client = createClient(url, key, {
    auth: { storageKey: 'gg-public-anonymous', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  return client
}
