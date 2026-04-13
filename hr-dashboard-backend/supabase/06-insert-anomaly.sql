-- 删除旧数据并插入异动数据
DELETE FROM anomaly_data WHERE month = '2026-03' AND bg_name = 'CBG';

INSERT INTO anomaly_data (month, bg_name, type, count, pct, note, sort_order) VALUES
  ('2026-03', 'CBG', '新入职', 12, '-', '社招+校招', 1),
  ('2026-03', 'CBG', '主动离职', 18, '-', '正编口径', 2),
  ('2026-03', 'CBG', '被动离职', 14, '-', '正编口径', 3),
  ('2026-03', 'CBG', '跨BG调入', 3, '-', '', 4),
  ('2026-03', 'CBG', '跨BG调出', 10, '-', '', 5),
  ('2026-03', 'CBG', '月度净增', -7, '-', '正编+外包净变化', 6);
