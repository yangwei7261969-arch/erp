'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Factory,
  Package,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  ShoppingCart,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

// Mock data for charts
const productionData = [
  { month: '1月', 完成订单: 65, 进行中: 28 },
  { month: '2月', 完成订单: 59, 进行中: 32 },
  { month: '3月', 完成订单: 80, 进行中: 25 },
  { month: '4月', 完成订单: 81, 进行中: 35 },
  { month: '5月', 完成订单: 56, 进行中: 40 },
  { month: '6月', 完成订单: 95, 进行中: 30 },
];

const inventoryData = [
  { name: '布料', value: 4000, color: '#0088FE' },
  { name: '辅料', value: 3000, color: '#00C49F' },
  { name: '成衣', value: 2000, color: '#FFBB28' },
  { name: '包材', value: 1000, color: '#FF8042' },
];

const revenueData = [
  { month: '1月', 收入: 400000, 支出: 240000 },
  { month: '2月', 收入: 300000, 支出: 139800 },
  { month: '3月', 收入: 500000, 支出: 280000 },
  { month: '4月', 收入: 478000, 支出: 309000 },
  { month: '5月', 收入: 589000, 支出: 310000 },
  { month: '6月', 收入: 639000, 支出: 320000 },
];

const recentOrders = [
  { id: 'PO2024001', customer: '广州服饰有限公司', style: '休闲T恤', quantity: 1000, status: '进行中', progress: 75 },
  { id: 'PO2024002', customer: '深圳时尚集团', style: '牛仔裤', quantity: 2000, status: '已完成', progress: 100 },
  { id: 'PO2024003', customer: '东莞服装厂', style: '运动短裤', quantity: 500, status: '待开始', progress: 0 },
  { id: 'PO2024004', customer: '佛山纺织公司', style: '连衣裙', quantity: 800, status: '进行中', progress: 45 },
  { id: 'PO2024005', customer: '中山制衣厂', style: '工作服', quantity: 3000, status: '已完成', progress: 100 },
];

const alerts = [
  { type: 'warning', message: '布料库存不足：蓝色棉布仅剩 50 米', time: '10 分钟前' },
  { type: 'error', message: '生产订单 #PO2024006 超期未完成', time: '1 小时前' },
  { type: 'info', message: '新客户订单待审核（5个）', time: '2 小时前' },
  { type: 'success', message: '采购订单 #PUR2024010 已到货', time: '3 小时前' },
];

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">数据大屏</h1>
          <p className="text-muted-foreground">实时监控企业运营数据</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            今日数据
          </Button>
          <Button>
            导出报表
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-90">生产订单</CardTitle>
            <Factory className="h-5 w-5 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">156</div>
            <div className="mt-2 flex items-center text-sm opacity-90">
              <TrendingUp className="mr-1 h-4 w-4" />
              较上月增长 12%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-90">库存总量</CardTitle>
            <Package className="h-5 w-5 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12,450</div>
            <div className="mt-2 flex items-center text-sm opacity-90">
              <AlertTriangle className="mr-1 h-4 w-4" />
              3 项库存预警
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-90">本月收入</CardTitle>
            <DollarSign className="h-5 w-5 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">¥2.8M</div>
            <div className="mt-2 flex items-center text-sm opacity-90">
              <TrendingUp className="mr-1 h-4 w-4" />
              较上月增长 8.5%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-90">在职员工</CardTitle>
            <Users className="h-5 w-5 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">328</div>
            <div className="mt-2 flex items-center text-sm opacity-90">
              <CheckCircle className="mr-1 h-4 w-4" />
              出勤率 96%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Production Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>生产趋势</CardTitle>
            <CardDescription>近6个月订单完成情况</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="production">
              <TabsList className="mb-4">
                <TabsTrigger value="production">生产统计</TabsTrigger>
                <TabsTrigger value="revenue">财务统计</TabsTrigger>
              </TabsList>
              <TabsContent value="production">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="完成订单" fill="#22c55e" />
                      <Bar dataKey="进行中" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="revenue">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `¥${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="收入" fill="#22c55e" />
                      <Bar dataKey="支出" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Inventory Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>库存分布</CardTitle>
            <CardDescription>各类物资库存占比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {inventoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>近期订单</CardTitle>
              <CardDescription>最新生产订单状态</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              查看全部
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>订单号</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead>款名</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>进度</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.style}</TableCell>
                    <TableCell>{order.quantity.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={order.progress} className="w-20" />
                        <span className="text-sm text-muted-foreground">{order.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === '已完成'
                            ? 'default'
                            : order.status === '进行中'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>系统提醒</CardTitle>
              <CardDescription>需要关注的业务事项</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              全部已读
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  {alert.type === 'warning' && (
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-500" />
                  )}
                  {alert.type === 'error' && (
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" />
                  )}
                  {alert.type === 'info' && (
                    <Clock className="mt-0.5 h-5 w-5 text-blue-500" />
                  )}
                  {alert.type === 'success' && (
                    <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
          <CardDescription>常用功能入口</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Factory className="h-6 w-6" />
              <span className="text-xs">新建订单</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <ShoppingCart className="h-6 w-6" />
              <span className="text-xs">采购申请</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Package className="h-6 w-6" />
              <span className="text-xs">入库登记</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Truck className="h-6 w-6" />
              <span className="text-xs">出货发货</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              <span className="text-xs">财务付款</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-xs">员工入职</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Clock className="h-6 w-6" />
              <span className="text-xs">生产排期</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Package className="h-6 w-6" />
              <span className="text-xs">库存盘点</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
