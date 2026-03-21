'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Package,
  DollarSign,
  ShoppingCart,
  Users,
  UserCog,
  Factory,
  Scissors,
  Truck,
  Sparkles,
  Settings,
  Shield,
  MessageSquare,
  Bell,
  ChevronLeft,
  ChevronRight,
  Box,
  Cog,
  Calculator,
  Palette,
  ClipboardList,
  QrCode,
  GitBranch,
  Layers,
  Send,
  Building2,
  FileCheck,
  ClipboardCheck,
  LogIn,
} from 'lucide-react';

const menuItems = [
  {
    title: '数据大屏',
    icon: LayoutDashboard,
    href: '/',
    roles: ['boss', 'manager'],
  },
  {
    title: '生产管理',
    icon: Factory,
    href: '/production',
    roles: ['production_manager', 'boss'],
  },
  {
    title: '生产准备',
    icon: ClipboardCheck,
    href: '/production-prep',
    roles: ['production_manager', 'boss'],
  },
  {
    title: '裁床管理',
    icon: Scissors,
    href: '/cutting',
    roles: ['cutting_manager'],
  },
  {
    title: '裁床分扎',
    icon: Layers,
    href: '/cutting-bundles',
    roles: ['cutting_manager'],
  },
  {
    title: '工序扫码',
    icon: QrCode,
    href: '/process-scan',
    roles: ['worker', 'production_manager'],
  },
  {
    title: '工序追溯',
    icon: GitBranch,
    href: '/process-tracking',
    roles: ['production_manager', 'boss'],
  },
  {
    title: '工序管理',
    icon: Cog,
    href: '/processes',
    roles: ['production_manager', 'boss'],
  },
  {
    title: '款式工序配置',
    icon: ClipboardList,
    href: '/style-processes',
    roles: ['production_manager', 'boss'],
  },
  {
    title: '计件工资',
    icon: Calculator,
    href: '/piece-wages',
    roles: ['production_manager', 'finance', 'hr'],
  },
  {
    title: '二次工艺',
    icon: Palette,
    href: '/craft-processes',
    roles: ['craft'],
  },
  {
    title: '尾部处理',
    icon: FileCheck,
    href: '/finishing',
    roles: ['production_manager', 'finishing'],
  },
  {
    title: '发货任务',
    icon: Truck,
    href: '/shipping-tasks',
    roles: ['warehouse', 'boss'],
  },
  {
    title: '物料库存',
    icon: Package,
    href: '/inventory',
    roles: ['warehouse', 'manager'],
  },
  {
    title: '成衣库存',
    icon: Box,
    href: '/finished-inventory',
    roles: ['warehouse', 'manager'],
  },
  {
    title: '外发订单',
    icon: Send,
    href: '/outsource-orders',
    roles: ['production_manager', 'boss'],
  },
  {
    title: '供应商管理',
    icon: Building2,
    href: '/suppliers',
    roles: ['boss', 'manager'],
  },
  {
    title: '财务中心',
    icon: DollarSign,
    href: '/finance',
    roles: ['finance', 'boss'],
  },
  {
    title: '采购管理',
    icon: ShoppingCart,
    href: '/purchase',
    roles: ['purchase', 'manager'],
  },
  {
    title: '人事管理',
    icon: Users,
    href: '/employees',
    roles: ['hr', 'boss'],
  },
  {
    title: '工资管理',
    icon: DollarSign,
    href: '/salary',
    roles: ['finance', 'hr'],
  },
  {
    title: '客户管理',
    icon: UserCog,
    href: '/customers',
    roles: ['boss', 'manager'],
  },
  {
    title: '出货管理',
    icon: Truck,
    href: '/shipment',
    roles: ['warehouse', 'finance'],
  },
  {
    title: 'AI 助手',
    icon: Sparkles,
    href: '/ai-assistant',
    roles: ['all'],
  },
  {
    title: '公告中心',
    icon: Bell,
    href: '/announcements',
    roles: ['all'],
  },
  {
    title: '系统设置',
    icon: Settings,
    href: '/settings',
    roles: ['admin'],
  },
  {
    title: '后台管理',
    icon: Shield,
    href: '/admin',
    roles: ['admin'],
    isSeparator: true,
  },
  {
    title: '供应商登录',
    icon: LogIn,
    href: '/login',
    roles: ['all'],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'relative flex flex-col border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Factory className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">服装ERP</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Menu */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    collapsed && 'justify-center px-0'
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Info */}
      <div className="border-t p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              U
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">管理员</p>
              <p className="truncate text-xs text-muted-foreground">admin@company.com</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              U
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
