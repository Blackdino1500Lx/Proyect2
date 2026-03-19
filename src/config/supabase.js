import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
 
const SUPABASE_URL = 'https://spxrcypcnewtfgootfdj.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNweHJjeXBjbmV3dGZnb290ZmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NTM0OTcsImV4cCI6MjA4OTQyOTQ5N30.sdLk-HfbmxQZLbFK_m3_nt8tGL4dgSBot_fCHGI8jG4'
 
export const DEMO_MODE = SUPABASE_URL === 'https://spxrcypcnewtfgootfdj.supabase.co'
 
export const supabase = DEMO_MODE ? null : createClient(SUPABASE_URL, SUPABASE_KEY)