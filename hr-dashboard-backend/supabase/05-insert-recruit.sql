-- 插入招聘数据
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
