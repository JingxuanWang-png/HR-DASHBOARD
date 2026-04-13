import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, month, bg_name = 'CBG' } = await req.json()

    if (!data || !month) {
      return new Response(
        JSON.stringify({ error: 'Missing data or month' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert or update KPI data
    if (data.kpi) {
      await supabase.from('kpi_data').upsert({
        month,
        bg_name,
        ...data.kpi,
        updated_at: new Date().toISOString()
      })
    }

    // Insert or update recruit data
    if (data.recruit) {
      await supabase.from('recruit_data').upsert({
        month,
        bg_name,
        ...data.recruit,
        updated_at: new Date().toISOString()
      })
    }

    // Insert or update anomaly data
    if (data.anomaly && Array.isArray(data.anomaly)) {
      for (const item of data.anomaly) {
        await supabase.from('anomaly_data').upsert({
          month,
          bg_name,
          type: item.type,
          count: item.count,
          pct: item.pct || '-',
          note: item.note || '',
          sort_order: item.sort_order || 0,
          updated_at: new Date().toISOString()
        })
      }
    }

    // Insert or update product data
    if (data.product && Array.isArray(data.product)) {
      for (const item of data.product) {
        await supabase.from('product_data').upsert({
          month,
          bg_name,
          product_line: item.product_line,
          headcount: item.headcount,
          demand: item.demand,
          vacancy: item.vacancy,
          attrition_rate: item.attrition_rate,
          updated_at: new Date().toISOString()
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Data imported successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
