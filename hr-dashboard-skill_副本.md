# HR 人力驾驶舱 · Skill 文档

> **用途**：下次直接给我数据（Excel / CSV / 手动描述），我就能按这份 Skill 生成你偏好的仪表盘风格。  
> **技术栈**：单文件 HTML + ECharts 5 + Vanilla JS（无框架依赖）  
> **维护**：在原有文件基础上迭代；分享版（`hr_dashboard_share.html`）通过 Python 脚本与主版同步。

---

## 一、视觉风格（Design Language）

### 1.1 三套主题
| 主题 | `data-theme` | 底色 | 主色 | 性格 |
|------|-------------|------|------|------|
| 宇宙深蓝（默认）| `dark` | `#060f20` | `#00a8ff` | 科技感、沉浸感强 |
| 活力白 | `light` | `#f5f7ff` | `#4361ee` | 年轻、饱和、莫兰迪感×不要 |
| 讯飞蓝 | `blue` | `#e8f4ff` | `#0084ff` | 科大讯飞品牌色、天空清透 |

- 切换顺序：**dark → light → blue → dark**（三态循环）
- 按钮 emoji：🌙 / ☀️ / 🩵
- **主题切换必须流畅即时**（CSS 变量覆盖，无延迟）

### 1.2 配色规范（CSS 变量）
```css
/* 深色默认值 */
--bg-primary: #060f20;
--bg-secondary: #0a1830;
--bg-card: rgba(10,28,60,0.85);
--border-glow: rgba(0,168,255,0.25);
--border-active: rgba(0,220,255,0.75);
--accent-blue: #00a8ff;
--accent-cyan: #00e5ff;
--accent-green: #00ff88;
--accent-yellow: #ffd700;
--accent-red: #ff4757;
--accent-purple: #a55eea;
--text-primary: #e8f4ff;
--text-secondary: #7ab3d8;
--text-muted: #4a7a9b;
```

### 1.3 Card 风格
- 玻璃态半透明背景 + 上边彩色高光线（`card::before`）
- 深色模式：多层 box-shadow 外发光 + inset 顶部微光
- hover 时发光强度大幅提升
- `border-radius: 12px`，`padding: 20px`
- **绝对不加扫描线动画**（已删除 `.scanline`）

### 1.4 排版
- 标题：`PingFang SC` / `Microsoft YaHei`，加粗，带 emoji 图标前缀
- KPI 大数字：`font-size: 2rem+`，`font-weight: 700`
- 间距：慷慨，section 之间 `margin-bottom: 24px+`
- 所有图表卡片标题**必须有 emoji 图标**（`.title-icon`）

---

## 二、布局规范（Layout）

### 2.1 顶部 Header
```
[左] LOGO + 产品名（大字） + 小字副标题
[右] 数据实时同步中 ⏺（圆点脉冲）+ 角色权限标识 + 主题切换按钮
```
- **不显示「最后更新时间」**（已删除）
- **不显示「数据来源」**（已删除）

### 2.2 导航 Tab 顺序
1. 总览 & 人力
2. 招聘进展
3. 人才质量
4. 业务群及产线情况
5. 数据管理

### 2.3 首页（总览 & 人力）布局顺序
1. **6 列等宽 KPI 卡**（`repeat(6,1fr)`）：BG总人数 / 正编 / 外包 / 实习 / 主动离职率 / 月度净增
2. **4 列大数字 KPI 卡**（人力分布指标组）
3. **2 列文字指标区**（人员结构细分）
4. **分隔标题**：「📊 可视化图表分析」
5. **3 列图表 grid**：人员构成饼图 / 离职率趋势 / 人力规模四卡+当月异动

### 2.4 招聘进展页布局
1. 6 张 stat-card（整体招聘漏斗数字）
2. 分隔线：「专项招聘看板」
3. 3 列 grid：招聘漏斗图 ✈️出海专项 🏆A类岗位专项
4. Offer 趋势折线图（全宽）

### 2.5 编辑按钮设计
- 默认 `opacity: 0`（隐藏）
- hover 父卡片时淡入（`opacity: 0.7`）
- hover 按钮本身时完全显示（`opacity: 1`）
- 无文字，只有 ✏️ emoji

---

## 三、功能模块（Features）

### 3.1 登录墙
- 简单密码保护，正确后显示仪表盘
- 主版（`hr_dashboard.html`）需密码
- 分享版（`hr_dashboard_share.html`）跳过登录，直接展示

### 3.2 数据编辑（Modal 系统）
- 每个卡片右上角 ✏️ 按钮触发 `openEditModal(key)`
- Modal 通用结构：标题 + 表单字段列表 + 保存/取消
- 字段类型：`number`（数字）、`text`（文字）
- 保存后立即更新页面显示（无需刷新）
- **"优先手动值，降级自动计算"原则**：若字段有手动录入值则用之，否则从 DB 自动统计

### 3.3 出海人员数字（重点）
```js
// 初始化 & 保存后都走同一逻辑
if(hc.overseas_onboard !== undefined && hc.overseas_onboard !== '') {
  el.textContent = hc.overseas_onboard + '人';
} else {
  // 自动从 offerList 统计 overseas==='是' && status==='已入职'
  const cnt = DB.offerList.filter(o => o.overseas==='是' && o.status==='已入职').length;
  el.textContent = cnt + '人';
}
```
- 编辑弹框字段 key：`overseas_onboard`，存在 `DB.headcount` 里

### 3.4 数据表格（录用清单 & 需求明细）
- 录用清单字段（15列）：姓名 / 岗位 / 产品线 / 序列 / 学历 / 院校类型 / 来源 / 月份 / 状态 / 出海 / 职级 / AB类 / 入职日期 / 招聘类型 / 人才分类
- 需求明细字段（15列）：需求单号 / 部门 / 岗位 / 产品线 / 序列 / 类型 / 职级 / 数量 / 剩余 / 录用人员 / 地点 / 出海 / AB类 / 状态 / 负责人
- 两张表均支持：**关键词搜索 + 多维下拉筛选**
- Badge 辅助函数：`schoolBadge()` / `statusBadge()` / `overseasBadge()`
- 表格容器：`max-height: 360px; overflow-y: auto`

### 3.5 数据导出
- 数据管理页提供导出功能

### 3.6 分享版同步脚本
```python
# 保留分享版内联库（头部，~1MB），替换 <style> 之后的所有代码
with open('hr_dashboard.html', 'r', encoding='utf-8') as f:
    src = f.read()
with open('hr_dashboard_share.html', 'r', encoding='utf-8') as f:
    share = f.read()

style_pos_share = share.find('<style>')
style_pos_src   = src.find('<style>')
new_share = share[:style_pos_share] + src[style_pos_src:]

with open('hr_dashboard_share.html', 'w', encoding='utf-8') as f:
    f.write(new_share)
```
- 每次修改主版后**必须执行**此同步

---

## 四、图表规范（ECharts）

### 4.1 通用配置
```js
// 主题适配工具函数（三态）
const ct = (darkVal, lightVal, blueVal) => {
  const t = document.documentElement.getAttribute('data-theme');
  return t === 'light' ? lightVal : t === 'blue' ? blueVal : darkVal;
};

// 通用背景透明
backgroundColor: 'transparent'

// 字体
textStyle: { fontFamily: "'PingFang SC','Microsoft YaHei',sans-serif" }
```

### 4.2 图表调色板（CHART_PALETTE）
```js
const CHART_PALETTE = {
  dark:  ['#00a8ff','#00ff88','#ffd700','#ff4757','#a55eea','#00e5ff','#ff9f43','#2ed573'],
  light: ['#4361ee','#10ac84','#f9a825','#ee5a24','#8e44ad','#0abde3','#e17055','#00b894'],
  blue:  ['#0084ff','#00c48c','#ffaa00','#ff6b6b','#9b59b6','#00c8f0','#fd9644','#26de81'],
};
```

### 4.3 漏斗图（ECharts Funnel）
```js
// 必须设置，否则 label 会出现黑色背景框
label: {
  backgroundColor: 'transparent',
  borderWidth: 0,
  borderColor: 'transparent',
  // ...其他配置
},
itemStyle: {
  borderWidth: 0,
  borderColor: 'transparent'
}
```

### 4.4 图表自适应
- 所有图表注册到 `CHARTS` 对象，用 key 管理
- Tab 切换时调用 `initChartsForPage(pageId)` 懒初始化
- Window resize 时遍历 CHARTS 调用 `.resize()`

### 4.5 图表卡片标题 Emoji 对照
| 图表 | Emoji |
|------|-------|
| 人员构成 | 🧩 |
| 招聘漏斗 | 🔽 |
| 离职率 | 📉 |
| 出海专项 | ✈️ |
| A类岗位 | 🏆 |
| BG总人数 | 👥 |
| 正编 | 🪪 |
| 外包 | 🤝 |
| 实习 | 🎓 |
| 人员构成占比 | 🥧 |
| 人力分布 | 📊 |
| 当月异动 | 🔄 |
| Offer趋势 | 📈 |
| 学历分布 | 🎓 |
| 院校分布 | 🏛️ |
| 来源分布 | 📣 |
| 产线对比 | 📊 |
| 产线明细 | 📋 |
| P4专项 | ⭐ |
| 门槛对比 | 🎯 |
| 序列分布 | 🏷️ |
| 来源趋势 | 📡 |
| 录用清单 | 📝 |
| 快速录入 | ⚡ |
| 权限说明 | 🔐 |
| 数据导出 | 📦 |

---

## 五、数据结构（DB Schema）

### 5.1 顶层 DB 对象
```js
const DB = {
  headcount: { /* 人力核心数字 */ },
  offerList: [ /* 录用记录数组 */ ],
  demandList: [ /* 需求记录数组 */ ],
  talent: { /* 人才质量数据 */ },
  // ...其他
};
```

### 5.2 headcount 字段
```js
{
  total: 0,            // BG总人数
  regular: 0,          // 正编
  outsource: 0,        // 外包
  intern: 0,           // 实习
  marketing: 0,        // 市场营销类
  attrition_active: 0, // 主动离职率(%)
  attrition_passive: 0,// 被动离职率(%)
  net_change: 0,       // 月度净增
  overseas_onboard: '', // 出海人员（手动录入，空=自动统计）
}
```

### 5.3 offerList 单条字段
```js
{
  name: '',       // 姓名
  pos: '',        // 岗位
  line: '',       // 产品线
  series: '',     // 序列
  edu: '',        // 学历
  schoolType: '', // 院校类型（985/211/普通本科等）
  src: '',        // 来源
  month: '',      // 月份
  status: '',     // 状态（已入职/待入职/放弃入职）
  overseas: '',   // 是/否
  level: '',      // 职级
  abClass: '',    // A类/B类
  onboard: '',    // 入职日期
  type: '',       // 招聘类型（社招/校招）
  talentType: '', // 人才分类
}
```

### 5.4 demandList 单条字段
```js
{
  no: '',         // 需求单号
  time: '',       // 时间
  dept: '',       // 部门
  dept2: '',      // 二级部门
  pos: '',        // 岗位
  line: '',       // 产品线
  qty: 0,         // 需求数量
  series: '',     // 序列
  type: '',       // 类型
  level: '',      // 职级
  location: '',   // 地点
  status: '',     // 状态（招聘中/已完成/暂停）
  hired: 0,       // 已录用
  remaining: 0,   // 剩余
  recruiter: '',  // 负责人
  overseas: '',   // 是/否
  abClass: '',    // A类/B类
  reason: '',     // 原因
}
```

---

## 六、交互偏好（Interaction Preferences）

### 6.1 用户明确喜欢的
- ✅ 三主题切换（深色/白/品牌蓝）
- ✅ 卡片 hover 发光效果
- ✅ 编辑按钮隐藏、hover 父卡才显示
- ✅ ECharts 漏斗/折线/柱状/饼图
- ✅ 数据表格多列+多维筛选
- ✅ "优先手动值，降级自动计算"的数据逻辑
- ✅ 所有图表标题有 emoji
- ✅ 顶部状态栏简洁：只要「数据实时同步中 ⏺」+ 角色权限
- ✅ 分享版（内联资源，可离线打开）

### 6.2 用户明确不喜欢的
- ❌ 扫描线动画（.scanline 删除）
- ❌ 「最后更新时间」文字
- ❌ 「数据来源：xxx」文字
- ❌ 漏斗图 label 有黑色边框/背景
- ❌ 「待更新」硬编码占位符（应自动计算或可编辑）
- ❌ 莫兰迪/低饱和度的浅色主题（要活力色）
- ❌ 重复的 KPI 卡（同一数字出现两次）

---

## 七、Excel 数据导入规范

### 7.1 导入流程
1. 用 Python `openpyxl` 读取 Excel 两个 Sheet
2. Sheet1：录用表 → `DB.offerList`
3. Sheet2：需求表 → `DB.demandList`
4. 字段名映射（中文列头 → JS key）见上方 Schema

### 7.2 字段名映射参考
| Excel 列头 | JS key |
|-----------|--------|
| 姓名 | name |
| 岗位/职位 | pos |
| 产品线 | line |
| 序列 | series |
| 学历 | edu |
| 院校类型 | schoolType |
| 来源渠道 | src |
| 月份 | month |
| 状态 | status |
| 是否出海 | overseas |
| 职级 | level |
| AB类 | abClass |
| 入职日期 | onboard |
| 招聘类型 | type |
| 人才分类 | talentType |

---

## 八、分享版打包规范

### 8.1 内联资源列表
分享版需内联以下库（约 1MB）：
- ECharts 5.4.3 完整版

### 8.2 同步原则
- 保留分享版的内联 `<script>` 头部
- 从第一个 `<style>` 标签开始，完整替换为主版内容
- 每次主版有任何修改，**立即同步分享版**

---

## 九、快速生成新版本的 Checklist

给我新数据时，我会按以下步骤生成：

1. **[ ]** 解析数据（Excel/CSV/手动描述）→ 生成 `DB.offerList` + `DB.demandList`
2. **[ ]** 更新 `DB.headcount` 核心数字
3. **[ ]** 更新所有图表数据源（`CHART_DATA_*`）
4. **[ ]** 检查漏斗图 label 无黑框
5. **[ ]** 确认三主题切换正常
6. **[ ]** 确认编辑弹框字段完整
7. **[ ]** 确认出海人员「优先手动 → 降级自动」逻辑
8. **[ ]** 同步分享版
9. **[ ]** 验证：无「最后更新时间」、无「数据来源」、无扫描线、无重复 KPI

---

*最后更新：2026-03-31 · 基于 CBG 人力驾驶舱迭代对话沉淀*
