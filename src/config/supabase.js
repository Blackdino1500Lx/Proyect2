import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
 
const SUPABASE_URL = 'https://apczslcxltjlnmpsatcr.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwY3pzbGN4bHRqbG5tcHNhdGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjcxNDQsImV4cCI6MjA5NTU0MzE0NH0.OHJst82yVQ9JzVxMfSqLomfHkfWKzO1HYTnGvLaKZgI'
 
export const DEMO_MODE = false
export const supabase = DEMO_MODE ? null : createClient(SUPABASE_URL, SUPABASE_KEY)
