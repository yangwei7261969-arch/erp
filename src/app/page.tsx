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

  // 检查管理员登录状态 - 主页仅供管理员使用
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // 未登录管理员，跳转到管理员登录页
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

  // 计算进度百分比
  const getProgressPercent = () => {
    if (!stats || stats.progressStats.total_quantity === 0) return 0;
    return Math.round((stats.progressStats.completed_quantity / stats.progressStats.total_quantity) * 100);
  };

  // 获取最大月度订单数（用于图表缩放）
  const getMaxOrders = () => {
    if (!stats) return 10;
    return Math.max(...stats.monthlyTrend.map(m => m.orders), 1);
  };

  // 获取最大金额（用于图表缩放）
  const getMaxAmount = () => {
    if (!stats) return 100000;
    return Math.max(...stats.monthlyTrend.map(m => Math.max(m.income, m.expense)), 1);
  };

  if (authLoading || loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* 标题 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">数据大屏</h1>
          <p className="text-sm md:text-base text-muted-foreground">实时监控生产、库存、财务数据</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">本月</SelectItem>
              <SelectItem value="quarter">本季度</SelectItem>
              <SelectItem value="year">本年</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchStats}>
            <RefreshCw className="h-4 w-4 mr-1" />
            刷新
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-1" />
            导出
          </Button>
          <Button size="sm" onClick={initDemoData}>
            初始化数据
          </Button>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700 dark:text-blue-300">生产订单</span>
              <Package className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.orderStats.total}</div>
            <div className="flex gap-2 mt-1 text-xs">
              <span className="text-orange-600">{stats.orderStats.in_progress} 进行中</span>
              <span className="text-green-600">{stats.orderStats.completed} 完成</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700 dark:text-green-300">生产进度</span>
              <Activity className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{getProgressPercent()}%</div>
            <div className="text-xs text-green-600 mt-1">
              {stats.progressStats.completed_quantity} / {stats.progressStats.total_quantity} 件
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-700 dark:text-purple-300">外发订单</span>
              <Building2 className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.outsourceStats.total}</div>
            <div className="text-xs text-purple-600 mt-1">
              ¥{stats.outsourceStats.total_amount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-yellow-700 dark:text-yellow-300">库存种类</span>
              <Package className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.inventoryStats.total_types}</div>
            <div className="text-xs text-red-600 mt-1">
              {stats.inventoryStats.low_stock} 种低库存
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${stats.financeStats.profit >= 0 ? 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900' : 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900'}`}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${stats.financeStats.profit >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>净利润</span>
              {stats.financeStats.profit >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
            </div>
            <div className={`text-2xl font-bold ${stats.financeStats.profit >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
              ¥{stats.financeStats.profit.toLocaleString()}
            </div>
            <div className="flex gap-2 mt-1 text-xs">
              <span className="text-green-600">+{stats.financeStats.income.toLocaleString()}</span>
              <span className="text-red-600">-{stats.financeStats.expense.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-orange-700 dark:text-orange-300">出货任务</span>
              <Truck className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.shipmentStats.total}</div>
            <div className="text-xs text-orange-600 mt-1">
              {stats.shipmentStats.pending} 待发货
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 月度趋势图 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              月度订单趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-2">
              {stats.monthlyTrend.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${(m.orders / getMaxOrders()) * 120}px` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground mt-2">{m.month}</span>
                  <span className="text-xs font-medium">{m.orders}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 财务趋势图 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              财务收支趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-2">
              {stats.monthlyTrend.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5">
                    <div 
                      className="flex-1 bg-green-500 rounded-t"
                      style={{ height: `${(m.income / getMaxAmount()) * 100}px` }}
                    />
                    <div 
                      className="flex-1 bg-red-500 rounded-t"
                      style={{ height: `${(m.expense / getMaxAmount()) * 100}px` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground mt-2">{m.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-sm text-muted-foreground">收入</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span className="text-sm text-muted-foreground">支出</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 预警和提醒 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 即将到期订单 */}
        {stats.urgentOrders.length > 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-orange-800 dark:text-orange-300">
                <AlertCircle className="h-4 w-4" />
                即将到期订单 ({stats.urgentOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.urgentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
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
                  <Badge className="bg-red-500 text-white">
                    {Math.ceil((new Date(order.plan_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} 天
                  </Badge>
                </div>
              ))}
              <Link href="/production" className="block text-center text-sm text-orange-600 py-1">
                查看全部 →
              </Link>
            </CardContent>
          </Card>
        )}

        {/* 低库存预警 */}
        {stats.lowStockMaterials.length > 0 && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-red-800 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                低库存预警 ({stats.lowStockMaterials.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.lowStockMaterials.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-red-600">{m.quantity} {m.unit}</div>
                    <div className="text-xs text-muted-foreground">安全库存: {m.safety_stock}</div>
                  </div>
                </div>
              ))}
              <Link href="/inventory" className="block text-center text-sm text-red-600 py-1">
                查看全部 →
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 高级功能入口 */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">高级功能中心</h3>
                <p className="text-sm text-muted-foreground">AI智能核心、设备管理、多工厂协同等9大高级功能已上线</p>
              </div>
            </div>
            <Link href="/advanced-features">
              <Button>
                查看全部功能
                <Package className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 快捷操作 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2">
            <Link href="/production" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Factory className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs text-center">生产订单</span>
            </Link>
            <Link href="/cutting" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5 text-cyan-600" />
              </div>
              <span className="text-xs text-center">裁床管理</span>
            </Link>
            <Link href="/process-scan" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-pink-600" />
              </div>
              <span className="text-xs text-center">工序扫码</span>
            </Link>
            <Link href="/quality-management" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-rose-600" />
              </div>
              <span className="text-xs text-center">质量管理</span>
            </Link>
            <Link href="/outsource-tracking" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-xs text-center">外发跟踪</span>
            </Link>
            <Link href="/suppliers" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                <Building2 className="h-5 w-5 text-teal-600" />
              </div>
              <span className="text-xs text-center">供应商</span>
            </Link>
            <Link href="/shipping-calendar" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-xs text-center">出货日历</span>
            </Link>
            <Link href="/shipping-tasks" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Truck className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs text-center">发货任务</span>
            </Link>
            <Link href="/inventory" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-yellow-600" />
              </div>
              <span className="text-xs text-center">物料库存</span>
            </Link>
            <Link href="/finished-inventory" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-amber-600" />
              </div>
              <span className="text-xs text-center">成衣库存</span>
            </Link>
            <Link href="/finance" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-xs text-center">财务管理</span>
            </Link>
            <Link href="/employees" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-xs text-center">员工管理</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 更多功能入口 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">更多功能</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-2">
            <Link href="/ai-assistant" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900 rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5 text-violet-600" />
              </div>
              <span className="text-xs text-center">AI助手</span>
            </Link>
            <Link href="/mes-dashboard" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-sky-600" />
              </div>
              <span className="text-xs text-center">MES看板</span>
            </Link>
            <Link href="/kpi-dashboard" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-xs text-center">KPI绩效</span>
            </Link>
            <Link href="/cost-analysis" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-lime-100 dark:bg-lime-900 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-lime-600" />
              </div>
              <span className="text-xs text-center">成本分析</span>
            </Link>
            <Link href="/piece-wages" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-fuchsia-100 dark:bg-fuchsia-900 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-fuchsia-600" />
              </div>
              <span className="text-xs text-center">计件工资</span>
            </Link>
            <Link href="/customers" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-slate-600" />
              </div>
              <span className="text-xs text-center">客户管理</span>
            </Link>
            <Link href="/permissions" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-zinc-600" />
              </div>
              <span className="text-xs text-center">权限管理</span>
            </Link>
            <Link href="/alert-system" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-xs text-center">预警系统</span>
            </Link>
            <Link href="/process-tracking" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs text-center">工序追溯</span>
            </Link>
            <Link href="/purchase" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-xs text-center">采购管理</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
