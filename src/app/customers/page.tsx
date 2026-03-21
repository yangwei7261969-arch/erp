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
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Search,
  Filter,
  Download,
  Users,
  Star,
  MoreHorizontal,
  Eye,
  Edit,
  Phone,
  Mail,
  Building,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data
const customers = [
  {
    id: 'C001',
    code: 'CUS20240001',
    name: '广州服饰有限公司',
    shortName: '广州服饰',
    level: 'vip',
    contact: '张经理',
    phone: '138****1234',
    email: 'zhang@gz-clothing.com',
    balance: 150000,
    orderCount: 45,
    status: 'active',
  },
  {
    id: 'C002',
    code: 'CUS20240002',
    name: '深圳时尚集团',
    shortName: '深圳时尚',
    level: 'important',
    contact: '李总',
    phone: '139****5678',
    email: 'li@sz-fashion.com',
    balance: 280000,
    orderCount: 78,
    status: 'active',
  },
  {
    id: 'C003',
    code: 'CUS20240003',
    name: '东莞服装厂',
    shortName: '东莞服装',
    level: 'normal',
    contact: '王主管',
    phone: '137****9012',
    email: 'wang@dg-garment.com',
    balance: 45000,
    orderCount: 12,
    status: 'active',
  },
  {
    id: 'C004',
    code: 'CUS20240004',
    name: '佛山纺织公司',
    shortName: '佛山纺织',
    level: 'important',
    contact: '赵经理',
    phone: '136****3456',
    email: 'zhao@fs-textile.com',
    balance: 120000,
    orderCount: 34,
    status: 'inactive',
  },
];

const levelMap: Record<string, { label: string; className: string }> = {
  vip: { label: 'VIP客户', className: 'bg-yellow-500' },
  important: { label: '重要客户', className: 'bg-blue-500' },
  normal: { label: '普通客户', className: 'bg-gray-500' },
};

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">客户管理</h1>
          <p className="text-muted-foreground">管理客户信息、评级和账单关联</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新增客户
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>新增客户</DialogTitle>
                <DialogDescription>填写客户基本信息</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>客户编码</Label>
                    <Input placeholder="自动生成" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>客户简称</Label>
                    <Input placeholder="客户简称" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>客户全称</Label>
                  <Input placeholder="客户全称" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>联系人</Label>
                    <Input placeholder="联系人姓名" />
                  </div>
                  <div className="space-y-2">
                    <Label>联系电话</Label>
                    <Input placeholder="联系电话" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>邮箱</Label>
                    <Input type="email" placeholder="邮箱地址" />
                  </div>
                  <div className="space-y-2">
                    <Label>客户等级</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择等级" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vip">VIP客户</SelectItem>
                        <SelectItem value="important">重要客户</SelectItem>
                        <SelectItem value="normal">普通客户</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>地址</Label>
                  <Textarea placeholder="客户地址" />
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
            <CardTitle className="text-sm font-medium">客户总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">活跃客户 128</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">VIP客户</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">占比 14.7%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">应收账款</CardTitle>
            <Building className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥1.2M</div>
            <p className="text-xs text-muted-foreground">待收回</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">本月新增</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">8</div>
            <p className="text-xs text-muted-foreground">新客户</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="customers">
        <TabsList>
          <TabsTrigger value="customers">客户列表</TabsTrigger>
          <TabsTrigger value="suppliers">供应商管理</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="搜索客户名称、编码..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="客户等级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部等级</SelectItem>
                    <SelectItem value="vip">VIP客户</SelectItem>
                    <SelectItem value="important">重要客户</SelectItem>
                    <SelectItem value="normal">普通客户</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Customer Table */}
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>编码</TableHead>
                    <TableHead>客户名称</TableHead>
                    <TableHead>等级</TableHead>
                    <TableHead>联系人</TableHead>
                    <TableHead>联系电话</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>欠款余额</TableHead>
                    <TableHead>订单数</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.code}</TableCell>
                      <TableCell>
                        <div>
                          <p>{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.shortName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={levelMap[customer.level]?.className}>
                          {levelMap[customer.level]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{customer.contact}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell className="font-medium">
                        ¥{customer.balance.toLocaleString()}
                      </TableCell>
                      <TableCell>{customer.orderCount}</TableCell>
                      <TableCell>
                        <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                          {customer.status === 'active' ? '活跃' : '停用'}
                        </Badge>
                      </TableCell>
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
                              <Phone className="mr-2 h-4 w-4" />
                              联系客户
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              发送邮件
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
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                供应商管理功能开发中...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
