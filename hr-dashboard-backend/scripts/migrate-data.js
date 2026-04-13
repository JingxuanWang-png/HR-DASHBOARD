/**
 * 数据迁移脚本
 * 将现有数据写入 Supabase
 * 
 * 使用方法：
 * node scripts/migrate-data.js
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase 配置（请替换为你的配置）
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SUPABASE_SERVICE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 当前数据（从 hr_dashboard.html 提取）
const currentData = {
  month: '2026-03',
  bg_name: 'CBG',
  
  // KPI 数据
  kpi: {
    total_headcount: 2572,
    regular_staff: 1949,
    outsourced_staff: 485,
    total_quota: 2206 + 459, // regular_quota + outsourced_quota
    regular_quota: 2206,
    outsourced_quota: 459,
    vacancy_regular: 2206 - 1949,
    vacancy_outsourced: 459 - 485,
    new_hires: 12,
    resignations: 31,
    attrition_rate: 3.0,
    active_attrition: 1.7,
    passive_attrition: 1.3
  },
  
  // 招聘数据
  recruit: {
    total_demand: 108,
    completed: 83,
    completion_rate: 76.9,
    hired_this_month: 24,
    offered: 135,
    pending_offer: 13,
    interviewed: 89,
    overseas_demand: 44,
    overseas_completed: 34,
    overseas_rate: 77.3,
    a_class_demand: 13,
    a_class_completed: 9,
    a_class_rate: 69.2
  },
  
  // 异动数据
  anomaly: [
    { type: '新入职', count: 12, note: '社招+校招', sort_order: 1 },
    { type: '主动离职', count: 18, note: '正编口径', sort_order: 2 },
    { type: '被动离职', count: 14, note: '正编口径', sort_order: 3 },
    { type: '跨BG调入', count: 3, note: '', sort_order: 4 },
    { type: '跨BG调出', count: 10, note: '', sort_order: 5 },
    { type: '月度净增', count: -7, note: '正编+外包净变化', sort_order: 6 }
  ],
  
  // 产线数据（简化版，取第一条作为示例）
  products: [
    { product_line: 'AI营销', headcount: 212, demand: 762, vacancy: 100, attrition_rate: 2.8 },
    { product_line: '数据增值', headcount: 51, demand: 62, vacancy: 12, attrition_rate: 1.2 },
    { product_line: '商业共享', headcount: 103, demand: 110, vacancy: 7, attrition_rate: 0.8 },
    { product_line: '开发者生态', headcount: 75, demand: 80, vacancy: 5, attrition_rate: 0.5 },
    { product_line: '虚拟数字人', headcount: 65, demand: 70, vacancy: 5, attrition_rate: 1.5 }
  ]
};

async function migrateData() {
  console.log('开始数据迁移...');
  
  try {
    // 1. 写入 KPI 数据
    console.log('写入 KPI 数据...');
    const { error: kpiError } = await supabase
      .from('kpi_data')
      .upsert({
        month: currentData.month,
        bg_name: currentData.bg_name,
        ...currentData.kpi
      }, { onConflict: 'month,bg_name' });
    
    if (kpiError) throw kpiError;
    console.log('✓ KPI 数据写入成功');
    
    // 2. 写入招聘数据
    console.log('写入招聘数据...');
    const { error: recruitError } = await supabase
      .from('recruit_data')
      .upsert({
        month: currentData.month,
        bg_name: currentData.bg_name,
        ...currentData.recruit
      }, { onConflict: 'month,bg_name' });
    
    if (recruitError) throw recruitError;
    console.log('✓ 招聘数据写入成功');
    
    // 3. 写入异动数据（先删除旧数据）
    console.log('写入异动数据...');
    await supabase
      .from('anomaly_data')
      .delete()
      .eq('month', currentData.month)
      .eq('bg_name', currentData.bg_name);
    
    const { error: anomalyError } = await supabase
      .from('anomaly_data')
      .insert(currentData.anomaly.map(item => ({
        month: currentData.month,
        bg_name: currentData.bg_name,
        ...item
      })));
    
    if (anomalyError) throw anomalyError;
    console.log('✓ 异动数据写入成功');
    
    // 4. 写入产线数据（先删除旧数据）
    console.log('写入产线数据...');
    await supabase
      .from('product_data')
      .delete()
      .eq('month', currentData.month)
      .eq('bg_name', currentData.bg_name);
    
    const { error: productError } = await supabase
      .from('product_data')
      .insert(currentData.products.map(item => ({
        month: currentData.month,
        bg_name: currentData.bg_name,
        ...item
      })));
    
    if (productError) throw productError;
    console.log('✓ 产线数据写入成功');
    
    // 5. 写入历史版本记录
    console.log('写入历史版本...');
    const { error: versionError } = await supabase
      .from('historical_months')
      .insert({
        month: currentData.month,
        bg_name: currentData.bg_name,
        data_type: 'full',
        version: 1,
        snapshot: {
          kpi: currentData.kpi,
          recruit: currentData.recruit,
          anomaly: currentData.anomaly,
          products: currentData.products
        },
        note: '初始数据迁移'
      });
    
    if (versionError) throw versionError;
    console.log('✓ 历史版本记录写入成功');
    
    console.log('\n✅ 数据迁移完成！');
    console.log('月份:', currentData.month);
    console.log('业务群:', currentData.bg_name);
    
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    process.exit(1);
  }
}

migrateData();