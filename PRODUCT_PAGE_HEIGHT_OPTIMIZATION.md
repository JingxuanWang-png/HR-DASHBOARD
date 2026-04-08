# 产线页左右高度协调优化指南

## 问题描述

**现象**：业务群及产线页的左侧"产线对比"图表和右侧"产线明细"表在初始加载时高度差异太大，布局不够美观。

**影响**：
- 左图太矮，表格太高，或反之
- 整体视觉不平衡
- 用户体验不佳

## 优化方案

### 一、HTML 布局结构（必须遵守）

```html
<!-- 【第一层】外层网格容器：两列等宽 -->
<div class="grid-2 mb-16" style="align-items:stretch">
  
  <!-- 【第二层】左侧卡片 - 图表 -->
  <div class="card" style="display:flex;flex-direction:column">
    <div class="card-title">
      <span class="title-icon">📊 产线对比</span>
    </div>
    <!-- 【第三层】图表容器 - 关键配置 -->
    <div id="bar-product" style="height:100%;flex:1;min-height:480px"></div>
  </div>
  
  <!-- 【第二层】右侧卡片 - 表格 -->
  <div class="card" style="display:flex;flex-direction:column;overflow:hidden">
    <div class="card-title">
      <span class="title-icon">📋 产线明细</span>
      <button class="edit-btn" onclick="openEditModal('product-table')">✏️</button>
    </div>
    <!-- 【第三层】表格滚动容器 - 关键配置 -->
    <div style="flex:1;overflow-y:auto;min-height:480px">
      <table class="data-table" style="font-size:12px">
        <thead style="position:sticky;top:0;z-index:10;background:var(--card-bg)">
          <tr>
            <th>业务群</th>
            <th>产线</th>
            <th>审批需求</th>
            <th>完成需求</th>
            <th>完成率</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody id="product-tbody"></tbody>
      </table>
    </div>
  </div>
</div>
```

### 二、CSS 关键规则

#### 2.1 网格容器（`.grid-2`）
```css
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;    /* 两列等宽 */
  gap: 16px;
  align-items: stretch;              /* ⭐ 重要：拉伸所有子元素 */
}
```

**作用**：
- `grid-template-columns: 1fr 1fr` 使左右两列自动等宽
- `align-items: stretch` 使两个卡片自动拉伸到相同高度（沿交叉轴）

#### 2.2 卡片容器（`.card`）
```css
.card {
  display: flex;
  flex-direction: column;             /* 纵向排列子元素 */
  min-height: 0;                      /* ⭐ 关键：允许 flex 子元素收缩到内容大小 */
}
```

**作用**：
- `flex-direction: column` 将标题和内容纵向排列
- `min-height: 0` 解除隐式的 `auto` 最小高度限制，允许内容灵活调整

#### 2.3 表格表头粘性定位
```css
table thead {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--card-bg);         /* 必须与卡片背景一致 */
}
```

**作用**：
- 滚动表格时，表头始终停留在容器顶部
- `background` 防止滚动内容穿过表头

### 三、JavaScript 高度同步机制

#### 3.1 核心函数：`adjustProductChartHeight()`

```javascript
function adjustProductChartHeight() {
  // 1. 获取 DOM 元素
  const scrollContainer = document.querySelector('div[style*="flex:1;overflow-y:auto"]');
  const chartContainer = document.getElementById('bar-product');
  const table = document.querySelector('.data-table');
  
  // 2. 容错检查
  if (!scrollContainer || !chartContainer || !table) return;
  
  // 3. 计算表头高度
  const thead = table.querySelector('thead');
  const theadHeight = thead ? thead.offsetHeight : 0;
  
  // 4. 计算表体高度
  const tbody = table.querySelector('tbody');
  const rows = tbody ? tbody.querySelectorAll('tr') : [];
  const rowHeight = rows.length > 0 ? rows[0].offsetHeight : 32;
  const bodyHeight = rowHeight * rows.length;
  
  // 5. 计算总高度（最小 480px）
  const finalHeight = Math.max(480, theadHeight + bodyHeight + 16);
  
  // 6. 同步两个容器的高度
  scrollContainer.style.minHeight = finalHeight + 'px';
  chartContainer.style.height = finalHeight + 'px';
  
  // 7. 异步重新渲染图表
  setTimeout(() => {
    const chart = window.CHART_INSTANCES['bar-product'];
    if (chart && typeof chart.resize === 'function') {
      chart.resize();
    }
  }, 50);
}
```

#### 3.2 调用位置（3处）

**位置 1 - 初始加载**：在 `renderProductTable()` 末尾
```javascript
function renderProductTable() {
  const tbody = document.getElementById('product-tbody');
  // ... 填充表格行 ...
  
  adjustProductChartHeight();  // ← 添加这行
}
```

**位置 2 - 筛选后**：在 `renderProductTableFiltered()` 末尾
```javascript
function renderProductTableFiltered() {
  const tbody = document.getElementById('product-tbody');
  // ... 填充筛选后的表格行 ...
  
  adjustProductChartHeight();  // ← 添加这行
}
```

**位置 3 - 重置筛选**：在 `resetFilters()` 中
```javascript
function resetFilters() {
  // ... 重置筛选状态 ...
  
  renderProductTable();
  adjustProductChartHeight();  // ← 添加这行
  
  // ... 其他逻辑 ...
}
```

### 四、工作原理

```
┌─────────────────────────────────────────────┐
│ 用户点击「业务群及产线情况」Tab              │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│ switchPage('product') 被调用                │
│ ├─ renderProductTable() 填充表格            │
│ └─ initChartsForPage('product') 初始化图表 │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│ adjustProductChartHeight() 被调用            │
│ ├─ 计算表格实际高度                         │
│ │  = 表头高度 + (行高 × 行数) + 16px        │
│ ├─ 取最大值：Math.max(480, 计算值)         │
│ └─ 同步 scrollContainer 和 chartContainer   │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│ ECharts chart.resize() 被调用               │
│ └─ 图表重新渲染以适应新高度                 │
└───────────────┬─────────────────────────────┘
                │
                ▼
        ┌───────────────┐
        │  左右等高 ✅   │
        └───────────────┘
```

### 五、迭代防护清单

**❌ 禁止做的事**：

| 操作 | 为什么 | 后果 |
|------|--------|------|
| 删除 `align-items:stretch` | 外层容器无法拉伸子元素 | 两侧高度无法自动同步 |
| 去掉 `flex:1` | 内容无法撑满容器 | 图表或表格高度太小 |
| 删除 `flex-direction:column` | 内容从纵向改为横向 | 布局完全混乱 |
| 在卡片上写死 `height:600px` | 高度被锁定无法动态调整 | 筛选时高度无法跟随 |
| 改动表头 `position:sticky;top:0` | 表头会随表格滚动 | 用户看不到列头 |
| 漏掉 `adjustProductChartHeight()` 调用 | 高度无法同步 | 左右高度仍不一致 |

**✅ 每次迭代后必做**：

- [ ] 用 `grep` 或搜索确认 `align-items:stretch` 还在 `grid-2` 上
- [ ] 确认两个卡片上都有 `display:flex;flex-direction:column`
- [ ] 确认 `#bar-product` 有 `height:100%;flex:1;min-height:480px`
- [ ] 确认表格滚动容器有 `flex:1;overflow-y:auto;min-height:480px`
- [ ] 确认 `adjustProductChartHeight()` 在 3 处都被调用
- [ ] 用浏览器打开，切换到产线页，检查左右是否等高
- [ ] 筛选几条产线，检查高度是否自动调整
- [ ] 重置筛选，检查是否恢复到原高度

### 六、调试技巧

#### 6.1 浏览器 F12 Console 命令

**查看当前高度**：
```javascript
// 图表容器的计算高度
console.log('图表容器高度:', document.getElementById('bar-product').offsetHeight)

// 表格容器的计算高度
console.log('表格容器高度:', document.querySelector('div[style*="flex:1;overflow-y:auto"]').offsetHeight)
```

**手动触发高度同步**：
```javascript
adjustProductChartHeight()
```

**验证是否等高**：
```javascript
const h1 = document.getElementById('bar-product').offsetHeight
const h2 = document.querySelector('div[style*="flex:1;overflow-y:auto"]').offsetHeight
console.log('是否等高:', h1 === h2, '(图表:', h1, '表格:', h2, ')')
```

**查看表格有多少行**：
```javascript
console.log('表格行数:', document.querySelectorAll('#product-tbody tr').length)
```

#### 6.2 Chrome DevTools 检查元素

1. 打开 F12
2. 按 `Ctrl+Shift+C` 或点击「Select an element」
3. 点击左侧产线对比图表或右侧产线明细表
4. 在 Elements 面板查看：
   - `offsetHeight` 是实际计算高度
   - `style` 是内联样式（应看到 `height` 或 `min-height`）
   - Computed 面板显示所有 CSS 应用情况

### 七、常见问题

**Q: 为什么初始加载时高度不一致？**
A: 表格数据加载后需要计算其实际高度，然后同步给图表。`adjustProductChartHeight()` 必须在表格数据填充后调用。

**Q: 筛选后高度不同步了怎么办？**
A: 检查 `renderProductTableFiltered()` 末尾是否调用了 `adjustProductChartHeight()`。

**Q: 为什么设置了 `min-height:480px` 还是太矮/太高？**
A: 最小高度是 480px，但实际高度是 `Math.max(480, 表格实际高度)`，所以如果表格数据很多会自动拉伸。

**Q: 删除分组功能后高度又不对了？**
A: 如果修改了表格结构（行数计算、高度计算），需要重新调整 `adjustProductChartHeight()` 的计算逻辑。

### 八、总结

| 要素 | 重要程度 | 作用 |
|------|---------|------|
| `grid-2` 的 `align-items:stretch` | ⭐⭐⭐⭐⭐ | 自动拉伸子元素 |
| 卡片的 `flex-direction:column` | ⭐⭐⭐⭐⭐ | 纵向排列 |
| 图表 `height:100%;flex:1` | ⭐⭐⭐⭐⭐ | 撑满容器 |
| 表格 `flex:1;overflow-y:auto` | ⭐⭐⭐⭐⭐ | 灵活伸缩 + 可滚动 |
| `adjustProductChartHeight()` 调用 | ⭐⭐⭐⭐⭐ | 动态同步高度 |
| 表头 `position:sticky` | ⭐⭐⭐⭐ | 始终可见 |
| `min-height:0` | ⭐⭐⭐ | 允许收缩 |

---

**关键一句话**：*外层 `align-items:stretch` + 两侧 `flex:1` + `adjustProductChartHeight()` = 自动等高* 

**下次迭代时只需记住这个，问题就不会出现。** 🎯
