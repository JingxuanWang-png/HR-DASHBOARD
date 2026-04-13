import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const month = formData.get('month') as string // 格式: 2026-04
    const bgName = (formData.get('bg_name') as string) || 'CBG'

    if (!file || !month) {
      return NextResponse.json(
        { error: '缺少文件或月份参数' },
        { status: 400 }
      )
    }

    // 读取 Excel 文件
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    
    // 先保存历史版本
    await saveHistoricalVersion(month, bgName)

    // 解析各个工作表
    const results: any = {}

    // 1. KPI 数据 (headcount_summary)
    if (workbook.Sheets['headcount_summary'] || workbook.Sheets['kpi_data']) {
      const sheet = workbook.Sheets['headcount_summary'] || workbook.Sheets['kpi_data']
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
      results.kpi = await importKPIData(data, month, bgName)
    }

    // 2. 招聘数据 (recruit_summary)
    if (workbook.Sheets['recruit_summary'] || workbook.Sheets['recruit_data']) {
      const sheet = workbook.Sheets['recruit_summary'] || workbook.Sheets['recruit_data']
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
      results.recruit = await importRecruitData(data, month, bgName)
    }

    // 3. 异动明细 (anomaly)
    if (workbook.Sheets['anomaly']) {
      const sheet = workbook.Sheets['anomaly']
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
      results.anomaly = await importAnomalyData(data, month, bgName)
    }

    // 4. 产线数据 (product_headcount 等)
    if (workbook.Sheets['product_headcount']) {
      const sheet = workbook.Sheets['product_headcount']
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
      results.product = await importProductData(data, month, bgName)
    }

    // 5. 尝试解析 dashboard_all 总表
    if (workbook.Sheets['dashboard_all']) {
      const dashboardResults = await importDashboardAll(workbook.Sheets['dashboard_all'], month, bgName)
      Object.assign(results, dashboardResults)
    }

    return NextResponse.json({
      success: true,
      message: '导入成功',
      data: results
    })

  } catch (error: any) {
    console.error('导入失败:', error)
    return NextResponse.json(
      { error: '导入失败: ' + error.message },
      { status: 500 }
    )
  }
}

// 保存历史版本
async function saveHistoricalVersion(month: string, bgName: string) {
  const tables = ['kpi_data', 'recruit_data', 'anomaly_data', 'product_data']
  
  for (const table of tables) {
    const { data } = await supabaseServer
      .from(table)
      .select('*')
      .eq('month', month)
      .eq('bg_name', bgName)

    if (data && data.length > 0) {
      // 获取当前最大版本号
      const { data: versionData } = await supabaseServer
        .from('historical_months')
        .select('version')
        .eq('month', month)
        .eq('bg_name', bgName)
        .eq('data_type', table)
        .order('version', { ascending: false })
        .limit(1)
        .single()

      const newVersion = (versionData?.version || 0) + 1

      await supabaseServer.from('historical_months').insert({
        month,
        bg_name: bgName,
        data_type: table,
        version: newVersion,
        snapshot: data,
        note: `自动备份 v${newVersion}`
      })
    }
  }
}

// 导入 KPI 数据
async function importKPIData(data: any[][], month: string, bgName: string) {
  // 简化实现：解析表格数据
  const kpiData: any = { month, bg_name: bgName }
  
  // 查找关键行
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    if (!row) continue
    
    const label = String(row[0] || '').trim()
    const value = row[1]
    
    if (label.includes('总人数')) kpiData.total_headcount = parseInt(value) || 0
    if (label.includes('正编人数')) kpiData.regular_staff = parseInt(value) || 0
    if (label.includes('外包人数')) kpiData.outsourced_staff = parseInt(value) || 0
    if (label.includes('总编制')) kpiData.total_quota = parseInt(value) || 0
    if (label.includes('正编编制')) kpiData.regular_quota = parseInt(value) || 0
    if (label.includes('本月入职')) kpiData.new_hires = parseInt(value) || 0
    if (label.includes('本月离职')) kpiData.resignations = parseInt(value) || 0
    if (label.includes('离职率')) kpiData.attrition_rate = parseFloat(value) || 0
  }

  // Upsert 数据
  const { error } = await supabaseServer
    .from('kpi_data')
    .upsert(kpiData, { onConflict: 'month,bg_name' })

  if (error) throw error
  return kpiData
}

// 导入招聘数据
async function importRecruitData(data: any[][], month: string, bgName: string) {
  const recruitData: any = { month, bg_name: bgName }
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    if (!row) continue
    
    const label = String(row[0] || '').trim()
    const value = row[1]
    
    if (label.includes('总需求')) recruitData.total_demand = parseInt(value) || 0
    if (label.includes('已完成')) recruitData.completed = parseInt(value) || 0
    if (label.includes('本月入职')) recruitData.hired_this_month = parseInt(value) || 0
    if (label.includes('出海需求')) recruitData.overseas_demand = parseInt(value) || 0
    if (label.includes('出海完成')) recruitData.overseas_completed = parseInt(value) || 0
  }

  const { error } = await supabaseServer
    .from('recruit_data')
    .upsert(recruitData, { onConflict: 'month,bg_name' })

  if (error) throw error
  return recruitData
}

// 导入异动数据
async function importAnomalyData(data: any[][], month: string, bgName: string) {
  const anomalies = []
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    if (!row || !row[0]) continue
    
    anomalies.push({
      month,
      bg_name: bgName,
      type: String(row[0] || ''),
      count: parseInt(row[1]) || 0,
      pct: String(row[2] || '-'),
      note: String(row[3] || ''),
      sort_order: i
    })
  }

  // 先删除旧数据
  await supabaseServer
    .from('anomaly_data')
    .delete()
    .eq('month', month)
    .eq('bg_name', bgName)

  // 插入新数据
  const { error } = await supabaseServer
    .from('anomaly_data')
    .insert(anomalies)

  if (error) throw error
  return anomalies
}

// 导入产线数据
async function importProductData(data: any[][], month: string, bgName: string) {
  const products = []
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    if (!row || !row[0]) continue
    
    products.push({
      month,
      bg_name: bgName,
      product_line: String(row[0] || ''),
      headcount: parseInt(row[1]) || 0,
      demand: parseInt(row[2]) || 0,
      vacancy: parseInt(row[3]) || 0,
      attrition_rate: parseFloat(row[4]) || 0
    })
  }

  // 先删除旧数据
  await supabaseServer
    .from('product_data')
    .delete()
    .eq('month', month)
    .eq('bg_name', bgName)

  const { error } = await supabaseServer
    .from('product_data')
    .insert(products)

  if (error) throw error
  return products
}

// 导入 dashboard_all 总表
async function importDashboardAll(sheet: any, month: string, bgName: string) {
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
  const results: any = {}
  
  // 这里需要根据你的 dashboard_all 实际格式解析
  // 简化处理：按区域识别数据
  
  return results
}