import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY'

// 客户端（前端用）
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// 服务端（API 用，有更高权限）
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)