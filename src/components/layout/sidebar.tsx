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
  User,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
} from 'lucide-react';

// 菜单分组配置
interface MenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
  roles: string[];
  badge?: string;
}

interface MenuGroup {
  title: string;
  icon: LucideIcon;
  items: MenuItem[];
  defaultOpen?: boolean;
}

const menuGroups: MenuGroup[] = [
  // 概览
  {
    title: '概览',
    icon: LayoutDashboard,
    defaultOpen: true,
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
    defaultOpen: true,
    items: [
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
        title: '尾部处理',
        icon: FileCheck,
        href: '/finishing',
        roles: ['production_manager', 'finishing'],
      },
      {
        title: '二次工艺',
        icon: Palette,
        href: '/craft-processes',
        roles: ['craft'],
      },
    ],
  },
  // 生产配置
  {
    title: '生产配置',
    icon: Cog,
    defaultOpen: false,
    items: [
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
    ],
  },
  // 仓储物流
  {
    title: '仓储物流',
    icon: Warehouse,
    defaultOpen: true,
    items: [
      {
        title: '出货日历',
        icon: Calendar,
        href: '/shipping-calendar',
        roles: ['warehouse', 'boss', 'manager'],
        badge: '新',
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
    ],
  },
  // 采购供应
  {
    title: '采购供应',
    icon: ShoppingCart,
    defaultOpen: false,
    items: [
      {
        title: '采购管理',
        icon: ShoppingCart,
        href: '/purchase',
        roles: ['purchase', 'manager'],
      },
      {
        title: '供应商管理',
        icon: Building2,
        href: '/suppliers',
        roles: ['boss', 'manager'],
      },
      {
        title: '外发订单',
        icon: Send,
        href: '/outsource-orders',
        roles: ['production_manager', 'boss'],
      },
    ],
  },
  // 财务人事
  {
    title: '财务人事',
    icon: DollarSign,
    defaultOpen: false,
    items: [
      {
        title: '财务中心',
        icon: DollarSign,
        href: '/finance',
        roles: ['finance', 'boss'],
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
      {
        title: '人事管理',
        icon: Users,
        href: '/employees',
        roles: ['hr', 'boss'],
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
    defaultOpen: false,
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
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(menuGroups.filter(g => g.defaultOpen).map(g => g.title))
  );
  const pathname = usePathname();

  const toggleGroup = (title: string) => {
    const newOpenGroups = new Set(openGroups);
    if (newOpenGroups.has(title)) {
      newOpenGroups.delete(title);
    } else {
      newOpenGroups.add(title);
    }
    setOpenGroups(newOpenGroups);
  };

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
        <nav className="space-y-2 px-2">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {/* 分组标题 */}
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground',
                  collapsed && 'justify-center px-0'
                )}
                onClick={() => !collapsed && toggleGroup(group.title)}
              >
                <group.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{group.title}</span>
                    {openGroups.has(group.title) ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </>
                )}
              </Button>

              {/* 分组菜单项 */}
              {!collapsed && openGroups.has(group.title) && (
                <div className="ml-4 space-y-1 border-l pl-2">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={isActive ? 'secondary' : 'ghost'}
                          className="w-full justify-start gap-2 text-sm"
                          title={item.title}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                              {item.badge}
                            </span>
                          )}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* 折叠模式下只显示图标 */}
              {collapsed && (
                <div className="space-y-1">
                  {group.items.slice(0, 3).map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={isActive ? 'secondary' : 'ghost'}
                          className="w-full justify-center px-0"
                          title={item.title}
                        >
                          <item.icon className="h-5 w-5" />
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Info */}
      <div className="border-t p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">管理员</p>
              <p className="truncate text-xs text-muted-foreground">admin@company.com</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
