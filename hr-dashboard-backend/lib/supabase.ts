import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = 'https://ccdgebymatqddpsvhpny.supabase.co'
const supabaseAnonKey = 'sb_publishable_9O0vOLRwrFxY5zMhyevvLA_kRgi8BYX'
const supabaseServiceKey = 'sb_secret_F-Sh8q4I7gEsvQVkd-OJPA_XJFndKTp'

// 客户端（前端用）
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// 服务端（API 用，有更高权限）
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)
