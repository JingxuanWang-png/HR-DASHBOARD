# 产线页高度优化 · 快速参考卡

## 🎯 核心一句话

**外层 `align-items:stretch` + 两侧 `flex:1` + 调用 `adjustProductChartHeight()`  = 自动等高**

---

## ⚡ 迭代检查清单（打印用）

### HTML 结构检查
- [ ] `grid-2` 容器有 `style="align-items:stretch"`？
- [ ] 两个卡片都有 `style="display:flex;flex-direction:column"`？
- [ ] 图表容器 `id="bar-product"` 有 `style="height:100%;flex:1;min-height:480px"`？
- [ ] 表格滚动容器有 `style="flex:1;overflow-y:auto;min-height:480px"`？
- [ ] 表格表头有 `style="position:sticky;top:0;z-index:10;background:var(--card-bg)"`？

### CSS 规则检查
- [ ] `.grid-2` 有 `grid-template-columns: 1fr 1fr; align-items: stretch;`？
- [ ] `.card` 有 `display: flex; flex-direction: column; min-height: 0;`？

### JavaScript 调用检查
- [ ] `renderProductTable()` 末尾有 `adjustProductChartHeight();`？
- [ ] `renderProductTableFiltered()` 末尾有 `adjustProductChartHeight();`？
- [ ] `resetFilters()` 中有 `adjustProductChartHeight();`？

---

## 🚫 禁止事项

```
❌ 删除 align-items:stretch         → 两侧无法自动等高
❌ 删除 flex:1                       → 无法撑满容器
❌ 删除 flex-direction:column        → 排列方式混乱
❌ 写死容器 height:600px            → 高度无法动态调整
❌ 改动表头 position:sticky         → 表头会跟随滚动
❌ 漏掉 adjustProductChartHeight()  → 高度无法同步
```

---

## ✅ 调试命令（F12 Console）

```javascript
// 查看当前高度是否等高
const h1 = document.getElementById('bar-product').offsetHeight
const h2 = document.querySelector('div[style*="flex:1;overflow-y:auto"]').offsetHeight
console.log('图表高度:', h1, '表格高度:', h2, '等高:', h1 === h2)

// 手动触发高度同步
adjustProductChartHeight()

// 查看表格行数
console.log('表格行数:', document.querySelectorAll('#product-tbody tr').length)
```

---

## 📊 工作原理（超简版）

```
表格数据加载 
    ↓
调用 adjustProductChartHeight()
    ↓
计算表格实际高度 = 表头 + (行高 × 行数) + 16
    ↓
取最大值：Math.max(480, 计算值)
    ↓
同步两侧容器高度
    ↓
调用 chart.resize() 重新渲染
    ↓
左右等高 ✅
```

---

## 📝 3 个必填位置

| 位置 | 函数 | 代码 |
|------|------|------|
| **初始加载** | `renderProductTable()` 末尾 | `adjustProductChartHeight();` |
| **筛选后** | `renderProductTableFiltered()` 末尾 | `adjustProductChartHeight();` |
| **重置筛选** | `resetFilters()` 中 | `adjustProductChartHeight();` |

---

## 🔑 5 个关键代码片段

### 1️⃣ HTML 外层容器
```html
<div class="grid-2 mb-16" style="align-items:stretch">
```

### 2️⃣ HTML 图表卡片
```html
<div id="bar-product" style="height:100%;flex:1;min-height:480px"></div>
```

### 3️⃣ HTML 表格卡片
```html
<div style="flex:1;overflow-y:auto;min-height:480px">
  <table>...</table>
</div>
```

### 4️⃣ CSS 网格容器
```css
.grid-2 {
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
}
```

### 5️⃣ CSS 卡片容器
```css
.card {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
```

---

## 💾 快速参考

**当遇到高度不一致时**：

1. **第一步**：检查 HTML 结构
   - 确认 `align-items:stretch` 还在
   - 确认 `flex:1` 和 `flex-direction:column` 还在

2. **第二步**：检查 JavaScript
   - 确认数据填充后调用了 `adjustProductChartHeight()`
   - 在 F12 Console 手动调用 `adjustProductChartHeight()` 测试

3. **第三步**：检查浏览器
   - 打开 F12，用选择工具点击图表和表格
   - 查看 `offsetHeight` 是否相同

**若还是不相等**：
- 查看 `adjustProductChartHeight()` 函数逻辑
- 检查表格结构是否改变（行高、行数计算）
- 检查是否有其他 CSS 影响了高度计算

---

**最后修改**：2026-04-01 01:48  
**文档位置**：与 Skill 文档同目录  
**推荐打印**：便于迭代时随时查看
