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
import { Progress } from '@/components/ui/progress';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Factory,
  Calendar,
  Users,
  Package,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data
const productionOrders = [
  {
    id: 'PO2024001',
    customerOrderNo: 'CO20240101',
    customer: '广州服饰有限公司',
    styleNo: 'ST2024001',
    styleName: '休闲T恤',
    color: '白色',
    size: 'M/L/XL',
    quantity: 1000,
    completed: 750,
    defective: 15,
    status: 'cutting',
    priority: 1,
    planStart: '2024-01-15',
    planEnd: '2024-01-25',
    workshop: 'A车间',
    progress: 75,
  },
  {
    id: 'PO2024002',
    customerOrderNo: 'CO20240102',
    customer: '深圳时尚集团',
    styleNo: 'ST2024002',
    styleName: '牛仔裤',
    color: '蓝色',
    size: 'S/M/L',
    quantity: 2000,
    completed: 2000,
    defective: 20,
    status: 'completed',
    priority: 2,
    planStart: '2024-01-10',
    planEnd: '2024-01-20',
    workshop: 'B车间',
    progress: 100,
  },
  {
    id: 'PO2024003',
    customerOrderNo: 'CO20240103',
    customer: '东莞服装厂',
    styleNo: 'ST2024003',
    styleName: '运动短裤',
    color: '黑色',
    size: 'M/L/XL/XXL',
    quantity: 500,
    completed: 0,
    defective: 0,
    status: 'pending',
    priority: 3,
    planStart: '2024-01-20',
    planEnd: '2024-01-30',
    workshop: 'A车间',
    progress: 0,
  },
];

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pending: { label: '待开始', variant: 'outline' },
  cutting: { label: '裁床中', variant: 'secondary' },
  sewing: { label: '缝制中', variant: 'secondary' },
  ironing: { label: '大烫中', variant: 'secondary' },
  packing: { label: '包装中', variant: 'secondary' },
  completed: { label: '已完成', variant: 'default' },
  cancelled: { label: '已取消', variant: 'destructive' },
};

export default function ProductionPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = productionOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.styleName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">生产管理</h1>
          <p className="text-muted-foreground">管理生产订单、工序进度和质量控制</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            打印
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新建订单
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>新建生产订单</DialogTitle>
                <DialogDescription>填写生产订单信息</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">客户</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择客户" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">广州服饰有限公司</SelectItem>
                        <SelectItem value="2">深圳时尚集团</SelectItem>
                        <SelectItem value="3">东莞服装厂</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerOrderNo">客户订单号</Label>
                    <Input id="customerOrderNo" placeholder="输入客户订单号" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="styleNo">款号</Label>
                    <Input id="styleNo" placeholder="输入款号" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="styleName">款名</Label>
                    <Input id="styleName" placeholder="输入款名" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">颜色</Label>
                    <Input id="color" placeholder="颜色" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">尺码</Label>
                    <Input id="size" placeholder="S/M/L" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">数量</Label>
                    <Input id="quantity" type="number" placeholder="数量" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="planStart">计划开始日期</Label>
                    <Input id="planStart" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="planEnd">计划结束日期</Label>
                    <Input id="planEnd" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">备注</Label>
                  <Textarea id="notes" placeholder="订单备注..." />
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
            <CardTitle className="text-sm font-medium">待生产</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">共 15,000 件</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">生产中</CardTitle>
            <Factory className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">共 8,500 件</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <Factory className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">本月完成</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">次品率</CardTitle>
            <Factory className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1%</div>
            <p className="text-xs text-muted-foreground">较上月 -0.3%</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索订单号、客户、款名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待开始</SelectItem>
                <SelectItem value="cutting">裁床中</SelectItem>
                <SelectItem value="sewing">缝制中</SelectItem>
                <SelectItem value="ironing">大烫中</SelectItem>
                <SelectItem value="packing">包装中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              更多筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>生产订单列表</CardTitle>
          <CardDescription>共 {filteredOrders.length} 条订单</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>订单号</TableHead>
                <TableHead>客户订单号</TableHead>
                <TableHead>客户</TableHead>
                <TableHead>款名</TableHead>
                <TableHead>颜色/尺码</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>完成/次品</TableHead>
                <TableHead>进度</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>车间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customerOrderNo}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>
                    <div>
                      <p>{order.styleName}</p>
                      <p className="text-xs text-muted-foreground">{order.styleNo}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.color} / {order.size}
                  </TableCell>
                  <TableCell>{order.quantity.toLocaleString()}</TableCell>
                  <TableCell>
                    {order.completed} / <span className="text-red-500">{order.defective}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={order.progress} className="w-16" />
                      <span className="text-sm">{order.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusMap[order.status]?.variant || 'outline'}>
                      {statusMap[order.status]?.label || order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.workshop}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Package className="mr-2 h-4 w-4" />
                          修改进度
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
