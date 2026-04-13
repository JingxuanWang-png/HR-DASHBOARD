'use client'

import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase'

interface DashboardData {
  kpi?: any
  recruit?: any
  anomaly?: any[]
  product?: any[]
  available_months?: string[]
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<DashboardData>({})
  const [month, setMonth] = useState('2026-03')
  const [loading, setLoading] = useState(true)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  // 检查登录状态
  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
      } else {
        window.location.href = '/login'
      }
    })
  }, [])

  // 加载数据
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, month])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/data?month=${month}&type=all`)
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (e) {
      console.error('加载数据失败:', e)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    window.location.href = '/login'
  }

  const handleImport = async () => {
    if (!importFile) return
    
    setImporting(true)
    const formData = new FormData()
    formData.append('file', importFile)
    formData.append('month', month)

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData
      })
      const result = await res.json()
      
      if (result.success) {
        alert('导入成功！')
        loadData()
      } else {
        alert('导入失败: ' + result.error)
      }
    } catch (e) {
      alert('导入出错')
    }
    setImporting(false)
  }

  if (!user) return <div className="p-8 text-center">加载中...</div>

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">CBG 人力驾驶舱</h1>
          <p className="text-gray-400 text-sm mt-1">
            {user.email} | 
            <button onClick={handleLogout} className="text-blue-400 hover:underline ml-2">
              退出
            </button>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* 月份选择 */}
          <select 
            value={month} 
            onChange={(e) => setMonth(e.target.value)}
            className="px-4 py-2 bg-gray-800 text-white rounded border border-gray-600"
          >
            {data.available_months?.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
            <option value="2026-04">2026-04</option>
            <option value="2026-03">2026-03</option>
          </select>
          
          {/* Excel 导入 */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="text-sm text-gray-300 file:mr-2 file:py-1 file:px-3 file:rounded file:bg-blue-600 file:text-white file:border-0"
            />
            <button
              onClick={handleImport}
              disabled={!importFile || importing}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
            >
              {importing ? '导入中...' : '导入 Excel'}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">加载中...</div>
      ) : (
        <>
          {/* KPI 卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <KPICard title="总人数" value={data.kpi?.total_headcount || 0} />
            <KPICard title="正编人数" value={data.kpi?.regular_staff || 0} />
            <KPICard title="外包人数" value={data.kpi?.outsourced_staff || 0} />
            <KPICard title="总编制" value={data.kpi?.total_quota || 0} />
            <KPICard title="本月入职" value={data.kpi?.new_hires || 0} color="green" />
            <KPICard title="本月离职" value={data.kpi?.resignations || 0} color="red" />
          </div>

          {/* 离职率和异动明细 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* 离职率 */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">📉 离职率指标</h3>
              <div className="flex items-center justify-center h-40">
                <div className="text-center">
                  <div className="text-5xl font-bold text-purple-400">
                    {data.kpi?.attrition_rate || 0}%
                  </div>
                  <div className="text-gray-400 mt-2">综合离职率</div>
                </div>
              </div>
              <div className="flex justify-center gap-8 mt-4">
                <span className="text-red-400">主动: {data.kpi?.active_attrition || 0}%</span>
                <span className="text-yellow-400">被动: {data.kpi?.passive_attrition || 0}%</span>
              </div>
            </div>

            {/* 异动明细 */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">📋 当月人力异动明细</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-2">类型</th>
                      <th className="text-right py-2">人数</th>
                      <th className="text-left py-2 pl-4">备注</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.anomaly?.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-700/50">
                        <td className="py-2 text-gray-300">{item.type}</td>
                        <td className="py-2 text-right">
                          <span className={item.count >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {item.count > 0 ? '+' : ''}{item.count}
                          </span>
                        </td>
                        <td className="py-2 pl-4 text-gray-500 text-xs">{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 产线数据 */}
          {data.product && data.product.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">🏭 产线数据</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-2">产线</th>
                      <th className="text-right py-2">在职</th>
                      <th className="text-right py-2">需求</th>
                      <th className="text-right py-2">空编</th>
                      <th className="text-right py-2">离职率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.product.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-700/50">
                        <td className="py-2 text-gray-300">{item.product_line}</td>
                        <td className="py-2 text-right">{item.headcount}</td>
                        <td className="py-2 text-right">{item.demand}</td>
                        <td className="py-2 text-right text-yellow-400">{item.vacancy}</td>
                        <td className="py-2 text-right">{item.attrition_rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// KPI 卡片组件
function KPICard({ title, value, color = 'blue' }: { title: string, value: number, color?: string }) {
  const colorClasses: any = {
    blue: 'from-blue-600 to-blue-800',
    green: 'from-green-600 to-green-800',
    red: 'from-red-600 to-red-800',
  }
  
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color] || colorClasses.blue} rounded-lg p-4 text-white`}>
      <div className="text-sm opacity-80">{title}</div>
      <div className="text-2xl font-bold mt-1">{value.toLocaleString()}</div>
    </div>
  )
}