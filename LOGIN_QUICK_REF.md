# 🔐 登录保护 · 快速参考卡

**打印这个。贴在你的显示器上。**

---

## 💡 核心原则

**登录是系统的门户。一旦坏了，你就进不去。**

所以，每次迭代前都要检查：

```bash
# 在项目目录运行
python3 check_login_integrity.py hr_dashboard.html
```

✅ 看到「检查完全通过」就可以放心迭代
❌ 看到「严重问题」就要停下来修复

---

## 📋 核心元素清单

```html
<!-- 不能改名 / 不能删除 -->
<div id="login-page">             ← 登录页面容器
  <div id="login-box">            ← 登录框
    <input id="login-username">   ← 账号
    <input id="login-password">   ← 密码  
    <select id="login-role">      ← 角色
    <button onclick="doLogin()">  ← 登录按钮
  </div>
</div>

<div id="main-app">               ← 主应用（登录后显示）
  ...
</div>
```

---

## 🛡️ 三道防线

### 1️⃣ **检测（自动）**
```javascript
// 页面加载时自动运行（F12 可查看结果）
validateLoginState()     // 检查整体状态
validateLoginForm()      // 检查表单完整性
```

### 2️⃣ **警告（自动）**
- 若检测到问题，浏览器 F12 → Console 会看到 ❌ 错误
- 页面仍能正常加载，但要尽快修复

### 3️⃣ **修复（手动或自动）**
```javascript
// 若表单损坏
rebuildLoginForm()       // 重建表单

// 若整个登录页损坏
rebuildLoginPage()       // 完全重建登录页
```

---

## ⚡ 常见问题

### Q: 迭代后突然登不了
**A:**
1. 打开浏览器 F12 → Console
2. 粘贴 `validateLoginState()` 按 Enter
3. 查看输出：
   - 全是 ✅ → 其他问题
   - 有 ❌ → 按 `LOGIN_PROTECTION.md` 修复

### Q: 不确定改了什么导致的
**A:**
1. 运行 `python3 check_login_integrity.py hr_dashboard.html`
2. 看报告，找出缺失的元素
3. 查看 Git diff 找回改动
4. 恢复被改动的 ID / 函数名

### Q: 着急上线，但不想冒险
**A:**
1. 迭代完成后，运行检查脚本
2. 若检查通过，安心部署
3. 若检查失败，立即回滚该次迭代

---

## 📁 相关文件

| 文件 | 用途 |
|------|------|
| `LOGIN_PROTECTION.md` | 完整的保护文档（详细原理） |
| `hr-dashboard-skill.md` | 迭代指南（已包含登录保护说明） |
| `check_login_integrity.py` | 自动检查脚本 |
| `hr_dashboard.html` | 主文件（已内置保护函数） |

---

## 🚀 迭代工作流

```
1. 开始迭代
   ↓
2. 做改动
   ↓
3. 测试功能（登录、权限等）
   ↓
4. 运行检查脚本
   ├─ ✅ 通过 → 部署
   └─ ❌ 失败 → 修复 → 回到步骤3
   ↓
5. 完成
```

---

## 🆘 救命函数表

| 函数 | 什么时候用 |
|------|----------|
| `validateLoginState()` | 诊断问题 |
| `validateLoginForm()` | 检查表单 |
| `rebuildLoginForm()` | 表单坏了 |
| `rebuildLoginPage()` | 登录页坏了 |
| `doLogin()` | 不要动！ |
| `doLogout()` | 不要动！ |

---

## ✅ 三步快速检查

**每次迭代前做这个（需要 30 秒）**

```bash
# 1. 运行自动检查
python3 check_login_integrity.py hr_dashboard.html

# 2. 查看结果
# 期望看到：✅ 检查完全通过

# 3. 若看到错误，记下缺失的元素，修复它
```

---

**记住：登录功能是系统的心脏。保护好它。** ❤️

