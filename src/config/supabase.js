import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
 
const SUPABASE_URL = 'https://qxwswmkimbvyqhhmmzmh.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4d3N3bWtpbWJ2eXFoaG1tem1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjAzNTMsImV4cCI6MjA5MzM5NjM1M30.7UFoTOKjfVdRlU6udhLpIRzMT2hULjcTUai6I53Ss9M'

export const DEMO_MODE = false
// Todas las consultas usan el esquema aislado "pizarra"
export const supabase = DEMO_MODE ? null : createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: { schema: 'pizarra' }
})