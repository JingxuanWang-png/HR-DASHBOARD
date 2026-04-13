import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || getCurrentMonth()
    const bgName = searchParams.get('bg_name') || 'CBG'
    const type = searchParams.get('type') || 'all'

    const result: any = { month, bg_name: bgName }

    // 根据类型返回数据
    if (type === 'all' || type === 'kpi') {
      const { data: kpi, error: kpiError } = await supabaseServer
        .from('kpi_data')
        .select('*')
        .eq('month', month)
        .eq('bg_name', bgName)
        .single()
      
      if (!kpiError) result.kpi = kpi
    }

    if (type === 'all' || type === 'recruit') {
      const { data: recruit, error: recruitError } = await supabaseServer
        .from('recruit_data')
        .select('*')
        .eq('month', month)
        .eq('bg_name', bgName)
        .single()
      
      if (!recruitError) result.recruit = recruit
    }

    if (type === 'all' || type === 'anomaly') {
      const { data: anomaly, error: anomalyError } = await supabaseServer
        .from('anomaly_data')
        .select('*')
        .eq('month', month)
        .eq('bg_name', bgName)
        .order('sort_order')
      
      if (!anomalyError) result.anomaly = anomaly
    }

    if (type === 'all' || type === 'product') {
      const { data: product, error: productError } = await supabaseServer
        .from('product_data')
        .select('*')
        .eq('month', month)
        .eq('bg_name', bgName)
      
      if (!productError) result.product = product
    }

    // 获取历史月份列表
    const { data: months } = await supabaseServer
      .from('kpi_data')
      .select('month')
      .eq('bg_name', bgName)
      .order('month', { ascending: false })

    result.available_months = months?.map(m => m.month) || []

    return NextResponse.json({ success: true, data: result })

  } catch (error: any) {
    console.error('查询失败:', error)
    return NextResponse.json(
      { error: '查询失败: ' + error.message },
      { status: 500 }
    )
  }
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}