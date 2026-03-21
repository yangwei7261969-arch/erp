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
  DollarSign,
  Download,
  CheckCircle,
  Clock,
  FileSignature,
} from 'lucide-react';

const salaries = [
  { id: 1, employee: '张三', department: '生产部', month: '2024-01', base: 5000, overtime: 800, bonus: 500, deduction: 200, total: 6100, status: 'paid' },
  { id: 2, employee: '李四', department: '裁床部', month: '2024-01', base: 5500, overtime: 600, bonus: 300, deduction: 150, total: 6250, status: 'confirmed' },
  { id: 3, employee: '王五', department: '仓库', month: '2024-01', base: 4500, overtime: 0, bonus: 200, deduction: 0, total: 4700, status: 'pending' },
  { id: 4, employee: '赵六', department: '财务部', month: '2024-01', base: 6000, overtime: 200, bonus: 500, deduction: 100, total: 6600, status: 'signed' },
];

export default function SalaryPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">工资管理</h1>
          <p className="text-muted-foreground">管理员工工资、确认与签收</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出工资条
          </Button>
          <Button>
            生成本月工资
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">本月工资总额</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥1.85M</div>
            <p className="text-xs text-muted-foreground">328 人</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待确认</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">56</div>
            <p className="text-xs text-muted-foreground">人待确认</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">已签收</CardTitle>
            <FileSignature className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">245</div>
            <p className="text-xs text-muted-foreground">人已签收</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">已发放</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥1.2M</div>
            <p className="text-xs text-muted-foreground">已发放金额</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">本月工资</TabsTrigger>
          <TabsTrigger value="history">历史工资</TabsTrigger>
          <TabsTrigger value="config">工资配置</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>员工</TableHead>
                    <TableHead>部门</TableHead>
                    <TableHead>基本工资</TableHead>
                    <TableHead>加班费</TableHead>
                    <TableHead>奖金</TableHead>
                    <TableHead>扣款</TableHead>
                    <TableHead>实发工资</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaries.map((salary) => (
                    <TableRow key={salary.id}>
                      <TableCell className="font-medium">{salary.employee}</TableCell>
                      <TableCell>{salary.department}</TableCell>
                      <TableCell>¥{salary.base.toLocaleString()}</TableCell>
                      <TableCell>¥{salary.overtime.toLocaleString()}</TableCell>
                      <TableCell>¥{salary.bonus.toLocaleString()}</TableCell>
                      <TableCell className="text-red-500">-¥{salary.deduction.toLocaleString()}</TableCell>
                      <TableCell className="font-bold">¥{salary.total.toLocaleString()}</TableCell>
                      <TableCell>
                        {salary.status === 'pending' && <Badge variant="outline">待确认</Badge>}
                        {salary.status === 'confirmed' && <Badge variant="secondary">已确认</Badge>}
                        {salary.status === 'signed' && <Badge className="bg-blue-500">已签收</Badge>}
                        {salary.status === 'paid' && <Badge>已发放</Badge>}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">详情</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                历史工资记录功能开发中...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                工资配置功能开发中...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
