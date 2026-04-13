import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const url = new URL(req.url)
    const month = url.searchParams.get('month') || '2026-03'
    const bgName = url.searchParams.get('bg_name') || 'CBG'
    const type = url.searchParams.get('type') || 'all'

    const result: any = { month, bg_name: bgName }

    // Query KPI data
    if (type === 'all' || type === 'kpi') {
      const { data: kpi, error: kpiError } = await supabase
        .from('kpi_data')
        .select('*')
        .eq('month', month)
        .eq('bg_name', bgName)
        .single()
      
      if (!kpiError) result.kpi = kpi
    }

    // Query recruit data
    if (type === 'all' || type === 'recruit') {
      const { data: recruit, error: recruitError } = await supabase
        .from('recruit_data')
        .select('*')
        .eq('month', month)
        .eq('bg_name', bgName)
        .single()
      
      if (!recruitError) result.recruit = recruit
    }

    // Query anomaly data
    if (type === 'all' || type === 'anomaly') {
      const { data: anomaly, error: anomalyError } = await supabase
        .from('anomaly_data')
        .select('*')
        .eq('month', month)
        .eq('bg_name', bgName)
        .order('sort_order')
      
      if (!anomalyError) result.anomaly = anomaly
    }

    // Query product data
    if (type === 'all' || type === 'product') {
      const { data: product, error: productError } = await supabase
        .from('product_data')
        .select('*')
        .eq('month', month)
        .eq('bg_name', bgName)
      
      if (!productError) result.product = product
    }

    // Get available months
    const { data: months } = await supabase
      .from('kpi_data')
      .select('month')
      .eq('bg_name', bgName)
      .order('month', { ascending: false })

    result.available_months = months?.map(m => m.month) || []

    return new Response(
      JSON.stringify({ success: true, data: result }),
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
