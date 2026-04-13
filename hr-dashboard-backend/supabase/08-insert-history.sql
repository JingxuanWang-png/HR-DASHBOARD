-- 插入历史版本记录
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
