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
  Scissors,
  Download,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

const cuttingOrders = [
  { id: 'CT2024001', styleNo: 'ST2024001', styleName: '休闲T恤', color: '白色', quantity: 1000, completed: 1000, status: 'completed', date: '2024-01-15' },
  { id: 'CT2024002', styleNo: 'ST2024002', styleName: '牛仔裤', color: '蓝色', quantity: 2000, completed: 1500, status: 'in_progress', date: '2024-01-14' },
  { id: 'CT2024003', styleNo: 'ST2024003', styleName: '运动短裤', color: '黑色', quantity: 500, completed: 0, status: 'pending', date: '2024-01-13' },
  { id: 'CT2024004', styleNo: 'ST2024004', styleName: '连衣裙', color: '红色', quantity: 800, completed: 600, status: 'in_progress', date: '2024-01-12' },
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  pending: { label: '待开始', variant: 'outline' },
  in_progress: { label: '裁床中', variant: 'secondary' },
  completed: { label: '已完成', variant: 'default' },
};

export default function CuttingPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">裁床管理</h1>
          <p className="text-muted-foreground">管理裁床单、裁数与工资同步</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建裁床单
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今日裁床</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,200</div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">进行中</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">裁床单</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">本月完成</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,600</div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">次品率</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2%</div>
            <p className="text-xs text-muted-foreground">较上月 -0.3%</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">裁床单</TabsTrigger>
          <TabsTrigger value="wages">工资同步</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>裁床单号</TableHead>
                    <TableHead>款号</TableHead>
                    <TableHead>款名</TableHead>
                    <TableHead>颜色</TableHead>
                    <TableHead>裁床数量</TableHead>
                    <TableHead>已完成</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>日期</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cuttingOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.styleNo}</TableCell>
                      <TableCell>{order.styleName}</TableCell>
                      <TableCell>{order.color}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{order.completed}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${(order.completed / order.quantity) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">{Math.round((order.completed / order.quantity) * 100)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[order.status].variant}>
                          {statusConfig[order.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wages">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                工资同步功能开发中...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
