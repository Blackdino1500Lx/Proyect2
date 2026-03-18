import { createClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────
// 🔑 Reemplaza estos valores con los de tu proyecto Supabase
// supabase.com → tu proyecto → Settings → API
// ─────────────────────────────────────────────
const SUPABASE_URL = 'TU_SUPABASE_URL'
const SUPABASE_KEY = 'TU_SUPABASE_ANON_KEY'

export const DEMO_MODE = SUPABASE_URL === 'TU_SUPABASE_URL'

export const supabase = DEMO_MODE ? null : createClient(SUPABASE_URL, SUPABASE_KEY)
