'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Truck,
  Download,
  Plus,
  CheckCircle,
  Clock,
  Package,
  RotateCcw,
} from 'lucide-react';

const shipments = [
  { id: 'SHP2024001', customer: '广州服饰', items: 5, quantity: 1000, amount: 150000, status: 'delivered', date: '2024-01-15', trackingNo: 'SF1234567890' },
  { id: 'SHP2024002', customer: '深圳时尚', items: 8, quantity: 2000, amount: 280000, status: 'shipped', date: '2024-01-14', trackingNo: 'SF1234567891' },
  { id: 'SHP2024003', customer: '东莞服装', items: 3, quantity: 500, amount: 45000, status: 'pending', date: '2024-01-13', trackingNo: '-' },
  { id: 'SHP2024004', customer: '佛山纺织', items: 6, quantity: 1500, amount: 120000, status: 'shipped', date: '2024-01-12', trackingNo: 'SF1234567892' },
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  pending: { label: '待发货', variant: 'outline' },
  shipped: { label: '运输中', variant: 'secondary' },
  delivered: { label: '已送达', variant: 'default' },
};

export default function ShipmentPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">出货管理</h1>
          <p className="text-muted-foreground">管理出货、退货和次品记录</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建出货单
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待发货</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">出货单</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">运输中</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">出货单</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">本月出货</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥2.1M</div>
            <p className="text-xs text-muted-foreground">56 单</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">退货</CardTitle>
            <RotateCcw className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">退货单</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="shipments">
        <TabsList>
          <TabsTrigger value="shipments">出货单</TabsTrigger>
          <TabsTrigger value="returns">退货管理</TabsTrigger>
          <TabsTrigger value="defects">次品记录</TabsTrigger>
        </TabsList>

        <TabsContent value="shipments">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>出货单号</TableHead>
                    <TableHead>客户</TableHead>
                    <TableHead>物料数</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>物流单号</TableHead>
                    <TableHead>日期</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">{shipment.id}</TableCell>
                      <TableCell>{shipment.customer}</TableCell>
                      <TableCell>{shipment.items}</TableCell>
                      <TableCell>{shipment.quantity}</TableCell>
                      <TableCell>¥{shipment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[shipment.status].variant}>
                          {statusConfig[shipment.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>{shipment.trackingNo}</TableCell>
                      <TableCell>{shipment.date}</TableCell>
                    </TableRow>
                  ))}
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

        <TabsContent value="defects">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                次品记录功能开发中...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
