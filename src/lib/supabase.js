// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mutrdkubqtknkxmpmped.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11dHJka3VicXRrbmt4bXBtcGVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNzE4NzIsImV4cCI6MjA5Mzk0Nzg3Mn0.3rB_90m9V435vMVnd6Q5OdcDyuGZsEfKGTNIRJTUOqE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)