'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronDown,
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
  Activity,
  Ticket,
  AlertTriangle,
  BarChart3,
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
  defaultOpen?: boolean;
}

const menuGroups: MenuGroup[] = [
  // 数据概览
  {
    title: '数据概览',
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      {
        title: '数据大屏',
        icon: LayoutDashboard,
        href: '/',
        roles: ['boss', 'manager'],
      },
      {
        title: 'MES实时看板',
        icon: Activity,
        href: '/mes-dashboard',
        roles: ['boss', 'manager', 'production_manager'],
      },
      {
        title: '预警系统',
        icon: AlertTriangle,
        href: '/alert-system',
        roles: ['boss', 'manager', 'production_manager'],
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
        title: '条码工票',
        icon: Ticket,
        href: '/work-tickets',
        roles: ['worker', 'production_manager'],
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
    defaultOpen: false,
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
  // 质量管理
  {
    title: '质量管理',
    icon: ClipboardCheck,
    defaultOpen: false,
    items: [
      {
        title: '质量管理',
        icon: ClipboardCheck,
        href: '/quality-management',
        roles: ['production_manager', 'quality', 'boss'],
      },
    ],
  },
  // 成本核算
  {
    title: '成本核算',
    icon: Calculator,
    defaultOpen: false,
    items: [
      {
        title: '成本分析',
        icon: BarChart3,
        href: '/cost-analysis',
        roles: ['finance', 'boss', 'manager'],
      },
    ],
  },
  // 库存管理
  {
    title: '库存管理',
    icon: Warehouse,
    defaultOpen: true,
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
      {
        title: '装箱管理',
        icon: Package,
        href: '/packing-management',
        roles: ['warehouse', 'boss'],
      },
    ],
  },
  // 出货管理
  {
    title: '出货管理',
    icon: Truck,
    defaultOpen: true,
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
    defaultOpen: false,
    items: [
      {
        title: '外发订单',
        icon: Send,
        href: '/outsource-orders',
        roles: ['production_manager', 'boss'],
      },
      {
        title: '外发跟踪',
        icon: Truck,
        href: '/outsource-tracking',
        roles: ['production_manager', 'boss'],
      },
      {
        title: '供应商管理',
        icon: Building2,
        href: '/suppliers',
        roles: ['boss', 'manager'],
      },
      {
        title: '供应商付款',
        icon: DollarSign,
        href: '/supplier-payment',
        roles: ['finance', 'boss'],
      },
    ],
  },
  // 人事工资
  {
    title: '人事工资',
    icon: Users,
    defaultOpen: false,
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
    defaultOpen: false,
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
    defaultOpen: false,
    items: [
      {
        title: 'AI 助手',
        icon: Sparkles,
        href: '/ai-assistant',
        roles: ['all'],
      },
      {
        title: '通知管理',
        icon: Bell,
        href: '/notification-management',
        roles: ['boss', 'manager', 'production_manager'],
      },
      {
        title: '公告中心',
        icon: Bell,
        href: '/announcements',
        roles: ['all'],
      },
      {
        title: '权限管理',
        icon: Shield,
        href: '/permissions',
        roles: ['boss', 'factory_admin'],
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
}

export function Sidebar({ className, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // 分组展开状态
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    menuGroups.forEach((group) => {
      if (group.defaultOpen) {
        initial.add(group.title);
      }
    });
    return initial;
  });

  // 当路由变化时，自动展开包含当前页面的分组
  useEffect(() => {
    menuGroups.forEach((group) => {
      const hasActiveItem = group.items.some((item) => item.href === pathname);
      if (hasActiveItem && !expandedGroups.has(group.title)) {
        setExpandedGroups((prev) => new Set([...prev, group.title]));
      }
    });
  }, [pathname]);

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const handleItemClick = () => {
    // 移动端点击菜单项后关闭侧边栏
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <div
      className={cn(
        'relative flex flex-col border-r bg-background transition-all duration-300 h-full',
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
          className="h-8 w-8 hidden md:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
        {/* 移动端关闭按钮 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileClose}
          className="h-8 w-8 md:hidden"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Menu with Groups */}
      <ScrollArea className="flex-1 py-2">
        <nav className="px-2">
          {menuGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.title);
            const hasActiveItem = group.items.some((item) => item.href === pathname);

            return (
              <div key={group.title} className="mb-1">
                {/* Group Title - 可点击展开/收起 */}
                <button
                  onClick={() => !collapsed && toggleGroup(group.title)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-wider rounded-md transition-colors',
                    collapsed
                      ? 'justify-center cursor-default'
                      : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800',
                    hasActiveItem && !collapsed
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground'
                  )}
                  title={collapsed ? group.title : undefined}
                >
                  <group.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{group.title}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </>
                  )}
                </button>

                {/* Group Items - 带动画展开 */}
                {!collapsed && (
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-200 ease-in-out',
                      isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    )}
                  >
                    <div className="space-y-0.5 py-1 pl-2">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link key={item.href} href={item.href} onClick={handleItemClick}>
                            <Button
                              variant={isActive ? 'secondary' : 'ghost'}
                              className={cn(
                                'w-full justify-start gap-3 h-8 text-sm',
                                isActive && 'font-medium'
                              )}
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              <span>{item.title}</span>
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 收起状态：直接显示图标按钮 */}
                {collapsed && (
                  <div className="space-y-0.5 mt-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link key={item.href} href={item.href} onClick={handleItemClick}>
                          <Button
                            variant={isActive ? 'secondary' : 'ghost'}
                            size="icon"
                            className={cn('w-full h-9', isActive && 'bg-primary/10')}
                            title={item.title}
                          >
                            <item.icon className="h-4 w-4" />
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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
