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
  Calendar,
  Warehouse,
  Users2,
  LucideIcon,
} from 'lucide-react';

// 菜单分组结构
interface MenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
  roles: string[];
}

interface MenuGroup {
  title: string;
  icon: LucideIcon;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  // 数据概览
  {
    title: '数据概览',
    icon: LayoutDashboard,
    items: [
      {
        title: '数据大屏',
        icon: LayoutDashboard,
        href: '/',
        roles: ['boss', 'manager'],
      },
    ],
  },
  // 生产管理
  {
    title: '生产管理',
    icon: Factory,
    items: [
      {
        title: '生产订单',
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
    ],
  },
  // 工序配置
  {
    title: '工序配置',
    icon: Cog,
    items: [
      {
        title: '工序管理',
        icon: Cog,
        href: '/processes',
        roles: ['production_manager', 'boss'],
      },
      {
        title: '款式工序',
        icon: ClipboardList,
        href: '/style-processes',
        roles: ['production_manager', 'boss'],
      },
    ],
  },
  // 库存管理
  {
    title: '库存管理',
    icon: Warehouse,
    items: [
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
    ],
  },
  // 出货管理
  {
    title: '出货管理',
    icon: Truck,
    items: [
      {
        title: '出货日历',
        icon: Calendar,
        href: '/shipping-calendar',
        roles: ['warehouse', 'boss', 'manager'],
      },
      {
        title: '发货任务',
        icon: Truck,
        href: '/shipping-tasks',
        roles: ['warehouse', 'boss'],
      },
      {
        title: '出货记录',
        icon: Send,
        href: '/shipment',
        roles: ['warehouse', 'finance'],
      },
    ],
  },
  // 外发管理
  {
    title: '外发管理',
    icon: Send,
    items: [
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
    ],
  },
  // 人事工资
  {
    title: '人事工资',
    icon: Users,
    items: [
      {
        title: '员工管理',
        icon: Users,
        href: '/employees',
        roles: ['hr', 'boss'],
      },
      {
        title: '计件工资',
        icon: Calculator,
        href: '/piece-wages',
        roles: ['production_manager', 'finance', 'hr'],
      },
      {
        title: '工资管理',
        icon: DollarSign,
        href: '/salary',
        roles: ['finance', 'hr'],
      },
    ],
  },
  // 财务客户
  {
    title: '财务客户',
    icon: DollarSign,
    items: [
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
        title: '客户管理',
        icon: UserCog,
        href: '/customers',
        roles: ['boss', 'manager'],
      },
    ],
  },
  // 系统工具
  {
    title: '系统工具',
    icon: Settings,
    items: [
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
      },
      {
        title: '供应商登录',
        icon: LogIn,
        href: '/login',
        roles: ['all'],
      },
    ],
  },
];

interface SidebarProps {
  className?: string;
  onMobileClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ className, onMobileClose, isMobile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const handleItemClick = () => {
    // 移动端点击菜单项后关闭侧边栏
    if (onMobileClose) {
      onMobileClose();
    }
  };

  // 移动端始终显示完整菜单
  const showCollapsed = collapsed && !isMobile;

  return (
    <div
      className={cn(
        'relative flex flex-col border-r bg-background h-full',
        isMobile ? 'w-64' : collapsed ? 'w-16' : 'w-64',
        !isMobile && 'transition-all duration-300'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!showCollapsed && (
          <div className="flex items-center gap-2">
            <Factory className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">服装ERP</span>
          </div>
        )}
        
        {/* PC端收起/展开按钮 */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn('h-8 w-8', showCollapsed && 'mx-auto')}
            title={collapsed ? '展开菜单' : '收起菜单'}
          >
            {showCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {/* 移动端关闭按钮 */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Menu with Groups */}
      <ScrollArea className="flex-1 py-2">
        <nav className="px-2">
          {menuGroups.map((group) => (
            <div key={group.title} className="mb-2">
              {/* Group Title */}
              {!showCollapsed && (
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <group.icon className="h-3.5 w-3.5" />
                  {group.title}
                </div>
              )}
              {/* Group Items */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={handleItemClick}>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-3 h-9',
                          showCollapsed && 'justify-center px-0'
                        )}
                        title={showCollapsed ? item.title : undefined}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!showCollapsed && <span className="text-sm">{item.title}</span>}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Info */}
      <div className="border-t p-4">
        {!showCollapsed ? (
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
