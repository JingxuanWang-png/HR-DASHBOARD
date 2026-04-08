#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HR 人力驾驶舱登录功能完整性检查脚本
==============================================

用途：自动检查 HTML 文件中登录功能是否完整，防止迭代时意外破坏

用法：
    python3 check_login_integrity.py hr_dashboard.html

输出：
    - ✅ 所有检查通过
    - ⚠️  有警告（可修复）
    - ❌ 有严重问题（需要修复）
"""

import sys
import re
from pathlib import Path


class LoginIntegrityChecker:
    def __init__(self, html_file):
        self.file_path = Path(html_file)
        if not self.file_path.exists():
            raise FileNotFoundError(f"❌ 文件不存在：{html_file}")
        
        with open(self.file_path, 'r', encoding='utf-8') as f:
            self.content = f.read()
        
        self.errors = []
        self.warnings = []
        self.passed = []
    
    def check_element_exists(self, element_id, element_type="div"):
        """检查元素是否存在"""
        pattern = rf'id\s*=\s*["\']?{element_id}["\']?'
        if re.search(pattern, self.content):
            self.passed.append(f"✅ 元素 `#{element_id}` 存在")
            return True
        else:
            self.errors.append(f"❌ 元素 `#{element_id}` 缺失（必需）")
            return False
    
    def check_function_exists(self, func_name):
        """检查函数是否存在"""
        pattern = rf'function\s+{func_name}\s*\('
        if re.search(pattern, self.content):
            self.passed.append(f"✅ 函数 `{func_name}()` 存在")
            return True
        else:
            self.errors.append(f"❌ 函数 `{func_name}()` 缺失（必需）")
            return False
    
    def check_login_button(self):
        """检查登录按钮是否调用 doLogin()"""
        pattern = r'<button[^>]*onclick\s*=\s*["\']?doLogin\(\)["\']?[^>]*>'
        if re.search(pattern, self.content):
            self.passed.append("✅ 登录按钮调用 `doLogin()`")
            return True
        else:
            self.warnings.append("⚠️  登录按钮可能没有调用 `doLogin()`")
            return False
    
    def check_role_config(self):
        """检查角色配置"""
        pattern = r'const\s+ROLE_CONFIG\s*=\s*\{'
        if re.search(pattern, self.content):
            # 检查三种角色
            roles = ['admin', 'recruit', 'view']
            all_found = True
            for role in roles:
                if f'"{role}"' in self.content or f"'{role}'" in self.content:
                    pass
                else:
                    all_found = False
                    self.warnings.append(f"⚠️  角色 `{role}` 配置缺失")
            
            if all_found:
                self.passed.append("✅ ROLE_CONFIG 包含三种角色")
            return all_found
        else:
            self.errors.append("❌ ROLE_CONFIG 对象缺失（必需）")
            return False
    
    def check_protection_functions(self):
        """检查登录保护函数"""
        funcs = ['validateLoginState', 'validateLoginForm', 'rebuildLoginForm', 'rebuildLoginPage']
        all_found = True
        for func in funcs:
            if self.check_function_exists(func):
                pass
            else:
                all_found = False
        return all_found
    
    def check_css_variables(self):
        """检查 CSS 变量是否定义"""
        vars_to_check = [
            '--bg-primary',
            '--text-primary',
            '--input-bg',
            '--border-glow',
        ]
        all_found = True
        for var in vars_to_check:
            if f'{var}:' in self.content:
                pass
            else:
                self.warnings.append(f"⚠️  CSS 变量 `{var}` 缺失")
                all_found = False
        
        if all_found:
            self.passed.append("✅ 关键 CSS 变量已定义")
        return all_found
    
    def run_all_checks(self):
        """运行所有检查"""
        print("🔍 开始检查登录功能完整性...\n")
        
        # 核心元素检查
        print("📋 核心元素检查：")
        self.check_element_exists('login-page')
        self.check_element_exists('login-box')
        self.check_element_exists('login-username')
        self.check_element_exists('login-password')
        self.check_element_exists('login-role')
        self.check_element_exists('main-app')
        print()
        
        # 函数检查
        print("🔧 函数完整性检查：")
        self.check_function_exists('doLogin')
        self.check_function_exists('doLogout')
        self.check_protection_functions()
        print()
        
        # 逻辑检查
        print("⚙️  逻辑检查：")
        self.check_role_config()
        self.check_login_button()
        self.check_css_variables()
        print()
        
        # 输出结果
        self._print_results()
    
    def _print_results(self):
        """打印检查结果"""
        if self.passed:
            print("✅ 通过的检查：")
            for msg in self.passed:
                print(f"   {msg}")
            print()
        
        if self.warnings:
            print("⚠️  警告（需要注意）：")
            for msg in self.warnings:
                print(f"   {msg}")
            print()
        
        if self.errors:
            print("❌ 严重问题（必须修复）：")
            for msg in self.errors:
                print(f"   {msg}")
            print()
        
        # 总体结果
        print("=" * 60)
        if self.errors:
            print("❌ 检查失败 - 有严重问题需要修复")
            print("\n📖 建议：")
            print("   1. 检查文件是否被意外修改")
            print("   2. 查看 LOGIN_PROTECTION.md 获取恢复步骤")
            print("   3. 使用浏览器 F12 → Console 调用 validateLoginState()")
            return False
        elif self.warnings:
            print("⚠️  检查有警告 - 系统可能工作，但建议检查")
            return True
        else:
            print("✅ 检查完全通过 - 登录功能完整，可以放心迭代")
            return True


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        print("\n用法: python3 check_login_integrity.py <html_file>")
        print("\n示例:")
        print("  python3 check_login_integrity.py hr_dashboard.html")
        sys.exit(0)
    
    html_file = sys.argv[1]
    
    try:
        checker = LoginIntegrityChecker(html_file)
        result = checker.run_all_checks()
        sys.exit(0 if result else 1)
    except Exception as e:
        print(f"❌ 错误：{e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
