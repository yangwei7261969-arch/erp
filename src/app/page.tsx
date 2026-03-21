'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Loader2,
  Factory,
  Building2,
  Truck,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    totalCustomers: 0,
    totalMaterials: 0,
    totalIncome: 0,
    totalExpense: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [urgentOrders, setUrgentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersRes, customersRes, materialsRes, billsRes] = await Promise.all([
        fetch('/api/production-orders?pageSize=100'),
        fetch('/api/customers?pageSize=100'),
        fetch('/api/materials?pageSize=100'),
        fetch('/api/bills?pageSize=100'),
      ]);

      const [orders, customers, materials, bills] = await Promise.all([
        ordersRes.json(),
        customersRes.json(),
        materialsRes.json(),
        billsRes.json(),
      ]);

      const ordersData = orders.success ? orders.data : [];
      const billsData = bills.success ? bills.data : [];

      setStats({
        totalOrders: orders.total || 0,
        inProgressOrders: ordersData.filter((o: any) => o.status === 'in_progress' || o.status === 'confirmed').length,
        completedOrders: ordersData.filter((o: any) => o.status === 'completed').length,
        totalCustomers: customers.total || 0,
        totalMaterials: materials.total || 0,
        totalIncome: billsData.filter((b: any) => b.type === 'income').reduce((sum: number, b: any) => sum + Number(b.amount), 0),
        totalExpense: billsData.filter((b: any) => b.type === 'expense').reduce((sum: number, b: any) => sum + Number(b.amount), 0),
      });

      setRecentOrders(ordersData.slice(0, 6));

      // 即将到期订单（3天内）
      const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const urgent = ordersData.filter((o: any) => 
        o.plan_end_date && 
        o.plan_end_date <= threeDaysLater && 
        o.status !== 'completed' &&
        o.status !== 'cancelled'
      );
      setUrgentOrders(urgent);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Init demo error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      pending: { label: '待开始', className: 'bg-gray-100 text-gray-800' },
      confirmed: { label: '已确认', className: 'bg-blue-100 text-blue-800' },
      in_progress: { label: '生产中', className: 'bg-orange-100 text-orange-800' },
      completed: { label: '已完成', className: 'bg-green-100 text-green-800' },
      cancelled: { label: '已取消', className: 'bg-red-100 text-red-800' },
    };
    const config = configs[status] || configs.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* 标题 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">数据大屏</h1>
          <p className="text-sm md:text-base text-muted-foreground">实时监控生产、库存、财务数据</p>
        </div>
        <Button onClick={initDemoData} size="sm" className="md:size-default">
          <Plus className="mr-2 h-4 w-4" />
          初始化数据
        </Button>
      </div>

      {/* 主要统计 - 移动端2列，PC端4列 */}
      <div className="grid gap-3 grid-cols-2 md:gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">生产订单</div>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xl md:text-2xl font-bold mt-1">{stats.totalOrders}</div>
            <div className="flex gap-2 mt-1 text-xs">
              <span className="text-blue-500">{stats.inProgressOrders} 进行</span>
              <span className="text-green-500">{stats.completedOrders} 完成</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">客户总数</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xl md:text-2xl font-bold mt-1">{stats.totalCustomers}</div>
            <div className="text-xs text-muted-foreground mt-1">活跃客户</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">物料种类</div>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xl md:text-2xl font-bold mt-1">{stats.totalMaterials}</div>
            <div className="text-xs text-muted-foreground mt-1">在库物料</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">净利润</div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className={`text-xl md:text-2xl font-bold mt-1 ${stats.totalIncome - stats.totalExpense >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ¥{(stats.totalIncome - stats.totalExpense).toLocaleString()}
            </div>
            <div className="flex gap-2 mt-1 text-xs">
              <span className="text-green-500">+¥{stats.totalIncome.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快捷操作 - 移动端横向滚动 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-4">
            <Link href="/production" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Factory className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <span className="text-xs md:text-sm text-center">生产订单</span>
            </Link>
            <Link href="/outsource-orders" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Building2 className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
              </div>
              <span className="text-xs md:text-sm text-center">外发订单</span>
            </Link>
            <Link href="/shipping-calendar" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
              </div>
              <span className="text-xs md:text-sm text-center">出货日历</span>
            </Link>
            <Link href="/shipping-tasks" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Truck className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              </div>
              <span className="text-xs md:text-sm text-center">发货任务</span>
            </Link>
            <Link href="/inventory" className="hidden md:flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-sm text-center">物料库存</span>
            </Link>
            <Link href="/finance" className="hidden md:flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-sm text-center">财务管理</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 即将到期提醒 */}
      {urgentOrders.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-4 w-4" />
              即将到期订单 ({urgentOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {urgentOrders.slice(0, 3).map((order: any) => {
              const daysLeft = Math.ceil(
                (new Date(order.plan_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div key={order.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
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
                  <div className="text-right">
                    <Badge className={daysLeft <= 1 ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}>
                      {daysLeft} 天
                    </Badge>
                  </div>
                </div>
              );
            })}
            {urgentOrders.length > 3 && (
              <Link href="/production" className="block text-center text-sm text-orange-600 py-1">
                查看全部 {urgentOrders.length} 个 →
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* 最近订单 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">最近生产订单</CardTitle>
          <Link href="/production">
            <Button variant="ghost" size="sm" className="text-sm">
              全部 <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              暂无订单，点击"初始化数据"添加示例
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {recentOrders.map((order: any) => {
                const progress = order.quantity > 0
                  ? Math.round((order.completed_quantity / order.quantity) * 100)
                  : 0;
                return (
                  <Link key={order.id} href="/production">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          {/* 图片 */}
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {order.style_image ? (
                              <img src={order.style_image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="h-8 w-8 text-gray-300" />
                            )}
                          </div>
                          
                          {/* 信息 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <div className="font-medium text-sm truncate">{order.order_no}</div>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 truncate">
                              {order.style_no} - {order.style_name}
                            </div>
                            <div className="text-xs text-muted-foreground">{order.color}</div>

                            {/* 进度条 */}
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getProgressColor(progress)}`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">{progress}%</span>
                            </div>

                            <div className="flex items-center justify-between mt-1 text-xs">
                              <span className="text-muted-foreground">
                                {order.completed_quantity}/{order.quantity} 件
                              </span>
                              {/* 外发标识 */}
                              {order.outsource_info && order.outsource_info.length > 0 && (
                                <Badge className="bg-purple-100 text-purple-800 text-[10px]">
                                  <Building2 className="h-3 w-3 mr-0.5" />
                                  {order.outsource_info[0].supplier_name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
