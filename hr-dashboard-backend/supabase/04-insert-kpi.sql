-- 插入 KPI 数据
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
