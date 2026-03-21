'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Scissors,
  Plus,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface CuttingOrder {
  id: string;
  order_no: string;
  production_order_id: string | null;
  style_no: string | null;
  color: string | null;
  fabric_code: string | null;
  fabric_qty: number | null;
  cutting_qty: number;
  completed_qty: number;
  defective_qty: number;
  status: string;
  cutting_date: string | null;
  workshop: string | null;
  cutting_team: string | null;
  notes: string | null;
  created_at: string;
}

interface ProductionOrder {
  id: string;
  order_no: string;
  style_no: string;
  style_name: string;
  color: string;
  quantity: number;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  pending: { label: '待开始', variant: 'outline' },
  in_progress: { label: '裁床中', variant: 'secondary' },
  completed: { label: '已完成', variant: 'default' },
};

export default function CuttingPage() {
  const [cuttingOrders, setCuttingOrders] = useState<CuttingOrder[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    production_order_id: '',
    style_no: '',
    color: '',
    fabric_code: '',
    fabric_qty: '',
    cutting_qty: '',
    cutting_date: new Date().toISOString().slice(0, 10),
    workshop: '',
    cutting_team: '',
    notes: '',
  });

  const fetchCuttingOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await fetch(`/api/cutting-orders?${params}`);
      const result = await response.json();

      if (result.success) {
        setCuttingOrders(result.data);
        setTotal(result.total);
      }
    } catch (error) {
      console.error('Failed to fetch cutting orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductionOrders = async () => {
    try {
      const response = await fetch('/api/production-orders?pageSize=100');
      const result = await response.json();
      if (result.success) {
        setProductionOrders(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch production orders:', error);
    }
  };

  useEffect(() => {
    fetchCuttingOrders();
    fetchProductionOrders();
  }, [page, statusFilter]);

  const handleProductionOrderChange = (orderId: string) => {
    const order = productionOrders.find(o => o.id === orderId);
    if (order) {
      setFormData({
        ...formData,
        production_order_id: orderId,
        style_no: order.style_no || '',
        color: order.color || '',
        cutting_qty: order.quantity.toString(),
      });
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/cutting-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cutting_qty: parseInt(formData.cutting_qty) || 0,
          fabric_qty: parseFloat(formData.fabric_qty) || 0,
        }),
      });
      const result = await response.json();

      if (result.success) {
        setDialogOpen(false);
        fetchCuttingOrders();
        alert('裁床单创建成功！');
        // 重置表单
        setFormData({
          production_order_id: '',
          style_no: '',
          color: '',
          fabric_code: '',
          fabric_qty: '',
          cutting_qty: '',
          cutting_date: new Date().toISOString().slice(0, 10),
          workshop: '',
          cutting_team: '',
          notes: '',
        });
      } else {
        alert(result.error || '创建失败');
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/cutting-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const result = await response.json();

      if (result.success) {
        fetchCuttingOrders();
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  // 统计
  const pendingCount = cuttingOrders.filter(o => o.status === 'pending').length;
  const inProgressCount = cuttingOrders.filter(o => o.status === 'in_progress').length;
  const completedCount = cuttingOrders.filter(o => o.status === 'completed').length;
  const totalCuttingQty = cuttingOrders.reduce((sum, o) => sum + (o.cutting_qty || 0), 0);
  const totalCompletedQty = cuttingOrders.reduce((sum, o) => sum + (o.completed_qty || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">裁床管理</h1>
          <p className="text-muted-foreground">管理裁床单、裁数与工资同步</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新建裁床单
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待开始</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">裁床中</CardTitle>
            <Scissors className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{completedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总裁数</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCuttingQty.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">完成数</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompletedQty.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">待开始</SelectItem>
              <SelectItem value="in_progress">裁床中</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : cuttingOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              暂无裁床单
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>裁床单号</TableHead>
                  <TableHead>款号</TableHead>
                  <TableHead>颜色</TableHead>
                  <TableHead>面料编码</TableHead>
                  <TableHead>裁数</TableHead>
                  <TableHead>完成数</TableHead>
                  <TableHead>次品数</TableHead>
                  <TableHead>裁床日期</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuttingOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_no}</TableCell>
                    <TableCell>{order.style_no || '-'}</TableCell>
                    <TableCell>{order.color || '-'}</TableCell>
                    <TableCell>{order.fabric_code || '-'}</TableCell>
                    <TableCell>{order.cutting_qty}</TableCell>
                    <TableCell>{order.completed_qty}</TableCell>
                    <TableCell>{order.defective_qty}</TableCell>
                    <TableCell>{order.cutting_date || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[order.status]?.variant || 'outline'}>
                        {statusConfig[order.status]?.label || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {order.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                          >
                            开始
                          </Button>
                        )}
                        {order.status === 'in_progress' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                          >
                            完成
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 新建裁床单弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新建裁床单</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>关联生产订单</Label>
              <Select onValueChange={handleProductionOrderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择生产订单（可选）" />
                </SelectTrigger>
                <SelectContent>
                  {productionOrders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.order_no} - {order.style_name} ({order.color})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>款号</Label>
                <Input
                  value={formData.style_no}
                  onChange={(e) => setFormData({ ...formData, style_no: e.target.value })}
                  placeholder="款号"
                />
              </div>
              <div className="space-y-2">
                <Label>颜色</Label>
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="颜色"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>面料编码</Label>
                <Input
                  value={formData.fabric_code}
                  onChange={(e) => setFormData({ ...formData, fabric_code: e.target.value })}
                  placeholder="面料编码"
                />
              </div>
              <div className="space-y-2">
                <Label>面料用量(米)</Label>
                <Input
                  type="number"
                  value={formData.fabric_qty}
                  onChange={(e) => setFormData({ ...formData, fabric_qty: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>裁数 *</Label>
                <Input
                  type="number"
                  value={formData.cutting_qty}
                  onChange={(e) => setFormData({ ...formData, cutting_qty: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>裁床日期</Label>
                <Input
                  type="date"
                  value={formData.cutting_date}
                  onChange={(e) => setFormData({ ...formData, cutting_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>车间</Label>
                <Input
                  value={formData.workshop}
                  onChange={(e) => setFormData({ ...formData, workshop: e.target.value })}
                  placeholder="车间"
                />
              </div>
              <div className="space-y-2">
                <Label>裁床组</Label>
                <Input
                  value={formData.cutting_team}
                  onChange={(e) => setFormData({ ...formData, cutting_team: e.target.value })}
                  placeholder="裁床组"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>备注</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="备注信息"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={submitting || !formData.cutting_qty}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              创建裁床单
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
