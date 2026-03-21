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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShoppingCart,
  Search,
  Download,
  Plus,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
} from 'lucide-react';

const purchaseOrders = [
  { id: 'PUR2024001', supplier: '布料供应商A', items: 5, amount: 85000, status: 'completed', date: '2024-01-15', receivedDate: '2024-01-18' },
  { id: 'PUR2024002', supplier: '辅料供应商B', items: 12, amount: 32000, status: 'completed', date: '2024-01-14', receivedDate: '2024-01-16' },
  { id: 'PUR2024003', supplier: '布料供应商C', items: 3, amount: 45000, status: 'shipped', date: '2024-01-13', expectedDate: '2024-01-20' },
  { id: 'PUR2024004', supplier: '设备供应商D', items: 2, amount: 120000, status: 'pending', date: '2024-01-12', expectedDate: '2024-01-25' },
  { id: 'PUR2024005', supplier: '辅料供应商E', items: 8, amount: 18000, status: 'confirmed', date: '2024-01-11', expectedDate: '2024-01-18' },
];

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pending: { label: '待确认', icon: Clock, variant: 'outline' },
  confirmed: { label: '已确认', icon: CheckCircle, variant: 'secondary' },
  shipped: { label: '运输中', icon: Truck, variant: 'default' },
  completed: { label: '已完成', icon: CheckCircle, variant: 'default' },
  cancelled: { label: '已取消', icon: XCircle, variant: 'destructive' },
};

export default function PurchasePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">采购管理</h1>
          <p className="text-muted-foreground">管理采购订单、进度和退货</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建采购单
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待采购</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">待确认订单</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">运输中</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">在途订单</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">本月采购额</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥358K</div>
            <p className="text-xs text-muted-foreground">较上月 +12%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待付款</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥128K</div>
            <p className="text-xs text-muted-foreground">8 笔待付</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">采购订单</TabsTrigger>
          <TabsTrigger value="returns">退货管理</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="搜索采购单..." className="pl-10" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="状态筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="pending">待确认</SelectItem>
                    <SelectItem value="confirmed">已确认</SelectItem>
                    <SelectItem value="shipped">运输中</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>采购单号</TableHead>
                    <TableHead>供应商</TableHead>
                    <TableHead>物料数</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>下单日期</TableHead>
                    <TableHead>预计到货</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((order) => {
                    const config = statusConfig[order.status];
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.supplier}</TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell>¥{order.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={config.variant}>
                            <config.icon className="mr-1 h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.receivedDate || order.expectedDate}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                退货管理功能开发中...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
