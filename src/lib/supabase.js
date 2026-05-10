// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xasrnkavsxxfflwgmoin.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhc3Jua2F2c3h4ZmZsd2dtb2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzODEzNDEsImV4cCI6MjA5Mzk1NzM0MX0.nhYRl06wsr7Y0aFrCNp2uE3SUB4oM_l3zfUCC7O7eU0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)