-- 初始数据导入（2026-03月数据）
-- 在 Supabase SQL Editor 中执行

-- 1. 插入 KPI 数据
INSERT INTO kpi_data (
  month, bg_name, total_headcount, regular_staff, outsourced_staff,
  total_quota, regular_quota, outsourced_quota,
  vacancy_regular, vacancy_outsourced,
  new_hires, resignations,
  attrition_rate, active_attrition, passive_attrition
) VALUES (
  '2026-03', 'CBG', 2572, 1949, 485,
  2665, 2206, 459,
  257, -26,
  12, 31,
  3.0, 1.7, 1.3
)
ON CONFLICT (month, bg_name) DO UPDATE SET
  total_headcount = EXCLUDED.total_headcount,
  regular_staff = EXCLUDED.regular_staff,
  outsourced_staff = EXCLUDED.outsourced_staff,
  total_quota = EXCLUDED.total_quota,
  regular_quota = EXCLUDED.regular_quota,
  outsourced_quota = EXCLUDED.outsourced_quota,
  vacancy_regular = EXCLUDED.vacancy_regular,
  vacancy_outsourced = EXCLUDED.vacancy_outsourced,
  new_hires = EXCLUDED.new_hires,
  resignations = EXCLUDED.resignations,
  attrition_rate = EXCLUDED.attrition_rate,
  active_attrition = EXCLUDED.active_attrition,
  passive_attrition = EXCLUDED.passive_attrition,
  updated_at = now();

-- 2. 插入招聘数据
INSERT INTO recruit_data (
  month, bg_name, total_demand, completed, completion_rate,
  hired_this_month, offered, pending_offer, interviewed,
  overseas_demand, overseas_completed, overseas_rate,
  a_class_demand, a_class_completed, a_class_rate
) VALUES (
  '2026-03', 'CBG', 108, 83, 76.9,
  24, 135, 13, 89,
  44, 34, 77.3,
  13, 9, 69.2
)
ON CONFLICT (month, bg_name) DO UPDATE SET
  total_demand = EXCLUDED.total_demand,
  completed = EXCLUDED.completed,
  completion_rate = EXCLUDED.completion_rate,
  hired_this_month = EXCLUDED.hired_this_month,
  offered = EXCLUDED.offered,
  pending_offer = EXCLUDED.pending_offer,
  interviewed = EXCLUDED.interviewed,
  overseas_demand = EXCLUDED.overseas_demand,
  overseas_completed = EXCLUDED.overseas_completed,
  overseas_rate = EXCLUDED.overseas_rate,
  a_class_demand = EXCLUDED.a_class_demand,
  a_class_completed = EXCLUDED.a_class_completed,
  a_class_rate = EXCLUDED.a_class_rate,
  updated_at = now();

-- 3. 删除并插入异动数据
DELETE FROM anomaly_data WHERE month = '2026-03' AND bg_name = 'CBG';

INSERT INTO anomaly_data (month, bg_name, type, count, note, sort_order) VALUES
  ('2026-03', 'CBG', '新入职', 12, '社招+校招', 1),
  ('2026-03', 'CBG', '主动离职', 18, '正编口径', 2),
  ('2026-03', 'CBG', '被动离职', 14, '正编口径', 3),
  ('2026-03', 'CBG', '跨BG调入', 3, '', 4),
  ('2026-03', 'CBG', '跨BG调出', 10, '', 5),
  ('2026-03', 'CBG', '月度净增', -7, '正编+外包净变化', 6);

-- 4. 删除并插入产线数据（示例数据）
DELETE FROM product_data WHERE month = '2026-03' AND bg_name = 'CBG';

INSERT INTO product_data (month, bg_name, product_line, headcount, demand, vacancy, attrition_rate) VALUES
  ('2026-03', 'CBG', 'AI营销', 212, 250, 38, 2.8),
  ('2026-03', 'CBG', '数据增值', 51, 60, 9, 1.2),
  ('2026-03', 'CBG', '商业共享', 103, 110, 7, 0.8),
  ('2026-03', 'CBG', '开发者生态', 75, 80, 5, 0.5),
  ('2026-03', 'CBG', '虚拟数字人', 65, 70, 5, 1.5),
  ('2026-03', 'CBG', 'AI交互', 125, 130, 5, 0.4),
  ('2026-03', 'CBG', '寰语', 143, 150, 7, 0.0),
  ('2026-03', 'CBG', '海外市场部', 48, 50, 2, 0.0),
  ('2026-03', 'CBG', '海外产品部', 31, 35, 4, 0.0),
  ('2026-03', 'CBG', '数字员工', 84, 90, 6, 1.9);

-- 5. 插入历史版本记录
INSERT INTO historical_months (month, bg_name, data_type, version, snapshot, note)
VALUES (
  '2026-03',
  'CBG',
  'full',
  1,
  jsonb_build_object(
    'kpi', jsonb_build_object(
      'total_headcount', 2572,
      'regular_staff', 1949,
      'outsourced_staff', 485,
      'attrition_rate', 3.0
    ),
    'recruit', jsonb_build_object(
      'total_demand', 108,
      'completed', 83,
      'completion_rate', 76.9
    ),
    'anomaly', jsonb_build_array(
      jsonb_build_object('type', '新入职', 'count', 12),
      jsonb_build_object('type', '主动离职', 'count', 18),
      jsonb_build_object('type', '被动离职', 'count', 14),
      jsonb_build_object('type', '月度净增', 'count', -7)
    )
  ),
  '初始数据导入'
);

-- 验证数据
SELECT 'kpi_data' as table_name, count(*) as count FROM kpi_data WHERE month = '2026-03'
UNION ALL
SELECT 'recruit_data', count(*) FROM recruit_data WHERE month = '2026-03'
UNION ALL
SELECT 'anomaly_data', count(*) FROM anomaly_data WHERE month = '2026-03'
UNION ALL
SELECT 'product_data', count(*) FROM product_data WHERE month = '2026-03'
UNION ALL
SELECT 'historical_months', count(*) FROM historical_months WHERE month = '2026-03';