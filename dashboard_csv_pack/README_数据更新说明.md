# 仪表盘数据更新包

- 数据截止：2026年3月
- 输出目录：`/Users/ara/WorkBuddy/20260330182034/dashboard_csv_pack`
- 文件数量：11 份底表 + 1 份清单
- 适用方式：在仪表盘中点击“批量导入 CSV”，一次选中整套文件即可自动刷新

## 文件清单

| 文件名 | 模块 | 用途 | 行数 |
| --- | --- | --- | ---: |
| 01_headcount_summary.csv | 首页/总览人力 | 总览 KPI、人力结构、编制使用率、离职仪表、数据截止时间 | 13 |
| 02_recruit_summary.csv | 招聘进展 | 招聘 KPI、专项招聘看板、人才质量分析 | 38 |
| 03_anomaly.csv | 首页异常预警 | 异常预警表 | 6 |
| 04_product_recruit.csv | 业务群及产线 | 产线对比图、明细表、P4专项统计 | 21 |
| 05_offer_list.csv | 招聘进展/数据管理 | 录用清单表、来源分析、序列结构、趋势图、出海人员回填 | 135 |
| 06_demand_list.csv | 招聘进展/数据管理 | 招聘需求表、需求筛选、补岗追踪 | 100 |
| 07_class_distribution.csv | 首页人力结构 | 职类编制结构图、头部结构洞察 | 5 |
| 08_series_distribution.csv | 首页核心序列分布 | 序列人数 TOP 图、Top5 数据条 | 35 |
| 09_product_headcount.csv | 业务群及产线趋势 | 产线人力节点趋势图 | 35 |
| 10_product_attrition.csv | 业务群及产线风险 | 离职率风险图、离职预警摘要 | 34 |
| 11_product_movement.csv | 业务群及产线异动 | 一季度异动趋势图、产线流入流出分析 | 33 |

## 命名说明

为兼容当前页面的自动识别，这批文件保留了固定英文前缀：

- `headcount_summary`
- `recruit_summary`
- `anomaly`
- `product_recruit`
- `offer_list`
- `demand_list`
- `class_distribution`
- `series_distribution`
- `product_headcount`
- `product_attrition`
- `product_movement`

建议保留文件名不变，只替换每个 CSV 内的数据。

## 使用建议

1. 先维护 11 份 CSV 底表。
2. 打开仪表盘，点击数据管理页或顶部的批量导入入口。
3. 一次性选中整套 CSV。
4. 页面会按当前底表自动刷新 KPI、图表、表格与专项看板。

## 备注

- `05_offer_list.csv` 会驱动招聘来源分析、趋势图、序列结构和部分出海统计。
- `01_headcount_summary.csv` 中的 `overseas_onboard` 为手工优先值；若留空，页面会自动按 `offer_list` 中“是否出海=是 且 状态=已入职”回填。
- `04_product_recruit.csv`、`09_product_headcount.csv`、`10_product_attrition.csv`、`11_product_movement.csv` 共同驱动业务群及产线页面。