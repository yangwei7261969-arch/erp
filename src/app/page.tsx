'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  ArrowRight,
  Loader2,
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 并行获取所有数据
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
        inProgressOrders: ordersData.filter((o: any) => o.status === 'in_progress').length,
        completedOrders: ordersData.filter((o: any) => o.status === 'completed').length,
        totalCustomers: customers.total || 0,
        totalMaterials: materials.total || 0,
        totalIncome: billsData.filter((b: any) => b.type === 'income').reduce((sum: number, b: any) => sum + Number(b.amount), 0),
        totalExpense: billsData.filter((b: any) => b.type === 'expense').reduce((sum: number, b: any) => sum + Number(b.amount), 0),
      });

      setRecentOrders(ordersData.slice(0, 5));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">数据大屏</h1>
          <p className="text-muted-foreground">实时监控生产、库存、财务数据</p>
        </div>
        <Button onClick={initDemoData}>
          <Plus className="mr-2 h-4 w-4" />
          初始化演示数据
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">生产订单</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-blue-500">生产中 {stats.inProgressOrders}</span>
              <span className="text-sm text-green-500">已完成 {stats.completedOrders}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">客户总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-2">活跃客户</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">物料种类</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaterials}</div>
            <p className="text-xs text-muted-foreground mt-2">在库物料</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">净利润</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.totalIncome - stats.totalExpense >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ¥{(stats.totalIncome - stats.totalExpense).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                ¥{stats.totalIncome.toLocaleString()}
              </span>
              <span className="text-sm text-red-500 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                ¥{stats.totalExpense.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/production">
              <Button variant="outline" className="w-full h-20">
                <div className="flex flex-col items-center gap-2">
                  <Package className="h-6 w-6" />
                  <span>新建生产订单</span>
                </div>
              </Button>
            </Link>
            <Link href="/inventory">
              <Button variant="outline" className="w-full h-20">
                <div className="flex flex-col items-center gap-2">
                  <Package className="h-6 w-6" />
                  <span>物料入库</span>
                </div>
              </Button>
            </Link>
            <Link href="/finance">
              <Button variant="outline" className="w-full h-20">
                <div className="flex flex-col items-center gap-2">
                  <DollarSign className="h-6 w-6" />
                  <span>新建账单</span>
                </div>
              </Button>
            </Link>
            <Link href="/customers">
              <Button variant="outline" className="w-full h-20">
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span>新增客户</span>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>最近生产订单</CardTitle>
          <Link href="/production">
            <Button variant="ghost" size="sm">
              查看全部 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无订单，点击上方"初始化演示数据"按钮添加示例数据
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{order.order_no}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.style_name} - {order.color}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{order.quantity} 件</div>
                    <div className="text-sm text-muted-foreground">
                      完成 {order.completed_quantity} 件
                    </div>
                  </div>
                  <div className="w-24">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${order.quantity > 0 ? (order.completed_quantity / order.quantity) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
