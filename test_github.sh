#!/bin/bash
# 测试 GitHub 仓库状态
echo "Testing GitHub repository access..."

# 检查仓库是否存在（会返回 404 或 200）
curl -I -s -o /dev/null -w "%{http_code}\n" https://github.com/JingxuanWang-png/HR-DASHBOARD.git

# 如果是 404，说明仓库不存在，需要创建
# 如果是 200，说明仓库存在但权限不够