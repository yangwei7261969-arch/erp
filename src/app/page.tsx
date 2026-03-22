'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  Users,
  DollarSign,
  Factory,
  Building2,
  Truck,
  Calendar,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Loader2,
  Download,
  RefreshCw,
  Image as ImageIcon,
  BarChart3,
  PieChart,
  Activity,
  ChevronRight,
  Zap,
  Settings,
  ClipboardList,
  Boxes,
  FileText,
  Wrench,
  Shield,
  Cpu,
  LayoutDashboard,
  Menu,
  Bell,
  MessageSquare,
  Sparkles,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  orderStats: { total: number; pending: number; in_progress: number; completed: number; cancelled: number };
  progressStats: { total_quantity: number; completed_quantity: number };
  outsourceStats: { total: number; pending: number; in_progress: number; completed: number; total_amount: number };
  inventoryStats: { total_types: number; low_stock: number; total_value: number };
  financeStats: { income: number; expense: number; profit: number };
  shipmentStats: { total: number; pending: number; shipped: number };
  employeeStats: { total: number; active: number };
  monthlyTrend: { month: string; orders: number; income: number; expense: number; profit: number }[];
  urgentOrders: any[];
  lowStockMaterials: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // 检查管理员登录状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [period, isAuthenticated]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/stats?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const initDemoData = async () => {
    try {
      const response = await fetch('/api/init-demo', { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        alert('演示数据初始化成功！');
        fetchStats();
      }
    } catch (error) {
      console.error('Init demo error:', error);
    }
  };

  const exportData = async () => {
    try {
      const res = await fetch('/api/export/data');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `生产数据导出_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('导出失败');
    }
  };

  const getProgressPercent = () => {
    if (!stats || stats.progressStats.total_quantity === 0) return 0;
    return Math.round((stats.progressStats.completed_quantity / stats.progressStats.total_quantity) * 100);
  };

  const getMaxOrders = () => {
    if (!stats) return 10;
    return Math.max(...stats.monthlyTrend.map(m => m.orders), 1);
  };

  const getMaxAmount = () => {
    if (!stats) return 100000;
    return Math.max(...stats.monthlyTrend.map(m => Math.max(m.income, m.expense)), 1);
  };

  if (authLoading || loading || !stats) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 核心功能模块
  const mainFeatures = [
    { icon: Factory, label: '生产订单', href: '/production', color: 'bg-primary' },
    { icon: Activity, label: '裁床管理', href: '/cutting', color: 'bg-cyan-500' },
    { icon: ClipboardList, label: '工序扫码', href: '/process-scan', color: 'bg-pink-500' },
    { icon: Shield, label: '质量管理', href: '/quality-management', color: 'bg-rose-500' },
    { icon: Building2, label: '外发跟踪', href: '/outsource-tracking', color: 'bg-violet-500' },
    { icon: Boxes, label: '物料库存', href: '/inventory', color: 'bg-amber-500' },
    { icon: Package, label: '成衣库存', href: '/finished-inventory', color: 'bg-teal-500' },
    { icon: Truck, label: '发货任务', href: '/shipping-tasks', color: 'bg-emerald-500' },
  ];

  // 数据分析模块
  const analysisFeatures = [
    { icon: DollarSign, label: '财务管理', href: '/finance', color: 'bg-red-500' },
    { icon: BarChart3, label: 'MES看板', href: '/mes-dashboard', color: 'bg-sky-500' },
    { icon: TrendingUp, label: 'KPI绩效', href: '/kpi-dashboard', color: 'bg-lime-500' },
    { icon: PieChart, label: '成本分析', href: '/cost-analysis', color: 'bg-indigo-500' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* 顶部导航栏 - 编菲风格橙色渐变 */}
      <header className="bg-gradient-to-r from-primary to-orange-600 text-white">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">服装生产管理系统</h1>
              <p className="text-xs text-white/80">ERP · MES · 智能分析</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-[10px] font-bold rounded-full flex items-center justify-center">
                4
              </span>
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 pb-20">
        {/* 核心指标卡片 - 编菲风格白色卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            icon={<Package className="h-4 w-4" />}
            label="生产订单"
            value={stats.orderStats.total}
            subValue={`${stats.orderStats.in_progress} 进行中`}
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <StatCard
            icon={<Activity className="h-4 w-4" />}
            label="生产进度"
            value={`${getProgressPercent()}%`}
            subValue={`${stats.progressStats.completed_quantity}/${stats.progressStats.total_quantity}`}
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            icon={<Building2 className="h-4 w-4" />}
            label="外发订单"
            value={stats.outsourceStats.total}
            subValue={`¥${stats.outsourceStats.total_amount.toLocaleString()}`}
            iconBg="bg-violet-100"
            iconColor="text-violet-600"
          />
          <StatCard
            icon={<Boxes className="h-4 w-4" />}
            label="库存种类"
            value={stats.inventoryStats.total_types}
            subValue={`${stats.inventoryStats.low_stock} 种低库存`}
            subValueColor="text-red-500"
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
          />
          <StatCard
            icon={stats.financeStats.profit >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            label="净利润"
            value={`¥${stats.financeStats.profit.toLocaleString()}`}
            subValue={`+${stats.financeStats.income.toLocaleString()}`}
            iconBg={stats.financeStats.profit >= 0 ? "bg-green-100" : "bg-red-100"}
            iconColor={stats.financeStats.profit >= 0 ? "text-green-600" : "text-red-600"}
            valueColor={stats.financeStats.profit >= 0 ? "text-green-600" : "text-red-600"}
          />
          <StatCard
            icon={<Truck className="h-4 w-4" />}
            label="出货任务"
            value={stats.shipmentStats.total}
            subValue={`${stats.shipmentStats.pending} 待发货`}
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
        </div>

        {/* AI智能助手入口 - 编菲风格突出显示 */}
        <Card className="bg-gradient-to-r from-primary to-orange-500 text-white border-0 shadow-lg overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI智能助手</h3>
                  <p className="text-sm text-white/80">智能分析 · 排产建议 · 预警提醒</p>
                </div>
              </div>
              <Link href="/ai-assistant">
                <Button className="bg-white text-primary hover:bg-white/90 font-medium">
                  立即体验
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 核心功能模块 - 编菲风格网格布局 */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base">核心功能</h3>
              <Link href="/all-features" className="text-sm text-primary font-medium flex items-center gap-1">
                全部功能 <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {mainFeatures.map((feature, index) => (
                <Link
                  key={index}
                  href={feature.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-primary/5 transition-colors group"
                >
                  <div className={`w-11 h-11 ${feature.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{feature.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 图表区域 */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* 月度趋势图 */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  月度订单趋势
                </CardTitle>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-24 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">本月</SelectItem>
                    <SelectItem value="quarter">本季度</SelectItem>
                    <SelectItem value="year">本年</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="h-40 flex items-end justify-between gap-1.5">
                {stats.monthlyTrend.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                        style={{ height: `${(m.orders / getMaxOrders()) * 100}px` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1.5">{m.month}</span>
                    <span className="text-[10px] font-medium">{m.orders}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 财务趋势图 */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                财务收支趋势
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="h-40 flex items-end justify-between gap-1.5">
                {stats.monthlyTrend.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full flex gap-0.5">
                      <div 
                        className="flex-1 bg-green-500 rounded-t"
                        style={{ height: `${(m.income / getMaxAmount()) * 80}px` }}
                      />
                      <div 
                        className="flex-1 bg-red-400 rounded-t"
                        style={{ height: `${(m.expense / getMaxAmount()) * 80}px` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">{m.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-6 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded" />
                  <span className="text-xs text-muted-foreground">收入</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-red-400 rounded" />
                  <span className="text-xs text-muted-foreground">支出</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 预警提醒 - 编菲风格 */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* 即将到期订单 */}
          {stats.urgentOrders.length > 0 && (
            <Card className="border-primary/30 bg-primary/5 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-base flex items-center gap-2 text-primary">
                  <Clock className="h-4 w-4" />
                  即将到期订单 ({stats.urgentOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {stats.urgentOrders.slice(0, 3).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {order.style_image ? (
                          <img src={order.style_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{order.order_no}</div>
                        <div className="text-xs text-muted-foreground">{order.style_name}</div>
                      </div>
                    </div>
                    <Badge className="bg-red-500 text-white text-xs">
                      {Math.ceil((new Date(order.plan_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} 天
                    </Badge>
                  </div>
                ))}
                <Link href="/production" className="block text-center text-sm text-primary font-medium py-1.5">
                  查看全部 →
                </Link>
              </CardContent>
            </Card>
          )}

          {/* 低库存预警 */}
          {stats.lowStockMaterials.length > 0 && (
            <Card className="border-red-200 bg-red-50 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-base flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  低库存预警 ({stats.lowStockMaterials.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {stats.lowStockMaterials.slice(0, 3).map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl shadow-sm">
                    <div>
                      <div className="font-medium text-sm">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.code}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-600 text-sm">{m.quantity} {m.unit}</div>
                      <div className="text-xs text-muted-foreground">安全: {m.safety_stock}</div>
                    </div>
                  </div>
                ))}
                <Link href="/inventory" className="block text-center text-sm text-red-600 font-medium py-1.5">
                  查看全部 →
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 高级功能入口 */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base">数据分析</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {analysisFeatures.map((feature, index) => (
                <Link
                  key={index}
                  href={feature.href}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-primary/5 transition-colors group"
                >
                  <div className={`w-10 h-10 ${feature.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{feature.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 快捷操作 */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base">快捷操作</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchStats} className="h-8 text-xs">
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  刷新
                </Button>
                <Button variant="outline" size="sm" onClick={exportData} className="h-8 text-xs">
                  <Download className="h-3.5 w-3.5 mr-1" />
                  导出
                </Button>
                <Button size="sm" onClick={initDemoData} className="h-8 text-xs bg-primary hover:bg-primary/90">
                  初始化数据
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 统计卡片组件 - 编菲风格
function StatCard({ 
  icon, 
  label, 
  value, 
  subValue, 
  iconBg, 
  iconColor,
  subValueColor,
  valueColor,
}: { 
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue: string;
  iconBg: string;
  iconColor: string;
  subValueColor?: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
      <div className={`text-xl font-bold ${valueColor || 'text-foreground'}`}>{value}</div>
      <div className={`text-xs mt-0.5 ${subValueColor || 'text-muted-foreground'}`}>{subValue}</div>
    </div>
  );
}
