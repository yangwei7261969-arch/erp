'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data
const revenueData = [
  { month: '1月', 收入: 400000, 支出: 240000, 利润: 160000 },
  { month: '2月', 收入: 300000, 支出: 139800, 利润: 160200 },
  { month: '3月', 收入: 500000, 支出: 280000, 利润: 220000 },
  { month: '4月', 收入: 478000, 支出: 309000, 利润: 169000 },
  { month: '5月', 收入: 589000, 支出: 310000, 利润: 279000 },
  { month: '6月', 收入: 639000, 支出: 320000, 利润: 319000 },
];

const expenseCategories = [
  { name: '材料采购', value: 45, color: '#0088FE' },
  { name: '人工成本', value: 25, color: '#00C49F' },
  { name: '设备维护', value: 15, color: '#FFBB28' },
  { name: '其他支出', value: 15, color: '#FF8042' },
];

const bills = [
  { id: 'B2024001', type: 'receivable', customer: '广州服饰', amount: 150000, status: 'paid', date: '2024-01-15' },
  { id: 'B2024002', type: 'payable', supplier: '布料供应商A', amount: 85000, status: 'pending', date: '2024-01-14' },
  { id: 'B2024003', type: 'receivable', customer: '深圳时尚', amount: 280000, status: 'partial', date: '2024-01-13' },
  { id: 'B2024004', type: 'payable', supplier: '辅料供应商B', amount: 32000, status: 'paid', date: '2024-01-12' },
  { id: 'B2024005', type: 'receivable', customer: '东莞服装', amount: 95000, status: 'overdue', date: '2024-01-10' },
];

const payments = [
  { id: 'P2024001', billId: 'B2024001', type: 'income', amount: 150000, method: '银行转账', date: '2024-01-16', status: 'approved' },
  { id: 'P2024002', billId: 'B2024004', type: 'expense', amount: 32000, method: '银行转账', date: '2024-01-15', status: 'approved' },
  { id: 'P2024003', billId: 'B2024003', type: 'income', amount: 140000, method: '现金', date: '2024-01-14', status: 'pending' },
];

export default function FinancePage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">财务中心</h1>
          <p className="text-muted-foreground">管理账单、付款、发票和财务报表</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出报表
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新建账单
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新建账单</DialogTitle>
                <DialogDescription>填写账单信息</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>账单类型</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receivable">应收账款</SelectItem>
                        <SelectItem value="payable">应付账款</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>金额</Label>
                    <Input type="number" placeholder="金额" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>客户/供应商</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">广州服饰有限公司</SelectItem>
                      <SelectItem value="2">深圳时尚集团</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>账单日期</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>到期日期</Label>
                    <Input type="date" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">取消</Button>
                <Button>保存</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">本月收入</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥2,891,000</div>
            <div className="flex items-center text-sm text-green-500">
              <TrendingUp className="mr-1 h-4 w-4" />
              +12.5%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">本月支出</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥1,598,800</div>
            <div className="flex items-center text-sm text-red-500">
              <TrendingUp className="mr-1 h-4 w-4" />
              +8.2%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">净利润</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥1,292,200</div>
            <div className="flex items-center text-sm text-green-500">
              <TrendingUp className="mr-1 h-4 w-4" />
              +18.3%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待收账款</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥485,000</div>
            <div className="text-xs text-muted-foreground">5 笔待收款</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>收支趋势</CardTitle>
            <CardDescription>近6个月收支情况</CardDescription>
          </CardHeader>
          <CardContent>
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
                  <Bar dataKey="利润" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>支出分布</CardTitle>
            <CardDescription>本月支出构成</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bills">
        <TabsList>
          <TabsTrigger value="bills">账单管理</TabsTrigger>
          <TabsTrigger value="payments">付款记录</TabsTrigger>
          <TabsTrigger value="invoices">发票管理</TabsTrigger>
        </TabsList>

        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="搜索账单..." className="pl-10" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="状态筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="pending">待付款</SelectItem>
                    <SelectItem value="partial">部分付款</SelectItem>
                    <SelectItem value="paid">已完成</SelectItem>
                    <SelectItem value="overdue">已逾期</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>账单号</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>客户/供应商</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>日期</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.id}</TableCell>
                      <TableCell>
                        <Badge variant={bill.type === 'receivable' ? 'default' : 'secondary'}>
                          {bill.type === 'receivable' ? '应收' : '应付'}
                        </Badge>
                      </TableCell>
                      <TableCell>{bill.customer || bill.supplier}</TableCell>
                      <TableCell>¥{bill.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        {bill.status === 'paid' && <Badge><CheckCircle className="mr-1 h-3 w-3" />已完成</Badge>}
                        {bill.status === 'pending' && <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />待付款</Badge>}
                        {bill.status === 'partial' && <Badge variant="secondary">部分付款</Badge>}
                        {bill.status === 'overdue' && <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />已逾期</Badge>}
                      </TableCell>
                      <TableCell>{bill.date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>付款单号</TableHead>
                    <TableHead>关联账单</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>方式</TableHead>
                    <TableHead>日期</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.billId}</TableCell>
                      <TableCell>
                        <Badge variant={payment.type === 'income' ? 'default' : 'secondary'}>
                          {payment.type === 'income' ? '收入' : '支出'}
                        </Badge>
                      </TableCell>
                      <TableCell>¥{payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>
                        {payment.status === 'approved' && <Badge>已审核</Badge>}
                        {payment.status === 'pending' && <Badge variant="outline">待审核</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                发票管理功能开发中...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
