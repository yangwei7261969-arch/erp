'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Settings, LogOut, User, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import NotificationCenter from '@/components/notification/notification-center';

interface HeaderProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
}

export function Header({ onMenuClick, isMobile }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* 左侧：菜单按钮 + 搜索 */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* 移动端菜单按钮 */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* 搜索 - PC端显示 */}
        <div className="relative hidden md:block w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索订单、客户、SKU..."
            className="pl-10"
          />
        </div>

        {/* 移动端搜索按钮 */}
        {isMobile && (
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="hidden md:flex"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications - 使用新的通知中心组件 */}
        <NotificationCenter />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 md:h-10 md:w-10 rounded-full">
              <Avatar className="h-9 w-9 md:h-10 md:w-10">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs md:text-sm">ADMIN</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">管理员</p>
                <p className="text-xs text-muted-foreground">admin@company.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              个人信息
            </DropdownMenuItem>
            <DropdownMenuItem className="md:hidden">
              <Settings className="mr-2 h-4 w-4" />
              系统设置
            </DropdownMenuItem>
            <DropdownMenuItem className="md:hidden">
              {theme === 'dark' ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  切换亮色
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  切换暗色
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
