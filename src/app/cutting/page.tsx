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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Scissors,
  Plus,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
} from 'lucide-react';

interface CuttingOrder {
  id: string;
  order_no: string;
  production_order_id: string | null;
  style_no: string;
  color: string;
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
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  pending: { label: '待开始', variant: 'outline' },
  in_progress: { label: '裁床中', variant: 'secondary' },
  completed: { label: '已完成', variant: 'default' },
};

// 常用尺码
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28', '29', '30', '31', '32', '34', '36', '38', '40'];

export default function CuttingPage() {
  const [cuttingOrders, setCuttingOrders] = useState<CuttingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CuttingOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [productionOrders, setProductionOrders] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    production_order_id: '',
    style_no: '',
    color: '',
    fabric_code: '',
    fabric_qty: '',
    cutting_qty: '',
    cutting_date: new Date().toISOString().slice(0, 10),
    workshop: '一车间',
    cutting_team: '',
    notes: '',
    // 尺码配比
    size_breakdown: {} as Record<string, number>,
  });

  const fetchCuttingOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/cutting-orders?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setCuttingOrders(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch cutting orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductionOrders = async () => {
    try {
      const response = await fetch('/api/production-orders?status=in_progress&pageSize=100');
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
  }, [statusFilter]);

  const handleProductionOrderChange = (orderId: string) => {
    const order = productionOrders.find(o => o.id === orderId);
    if (order) {
      setFormData({
        ...formData,
        production_order_id: orderId,
        style_no: order.style_no || '',
        color: order.color || '',
      });
    }
  };

  const handleSizeChange = (size: string, qty: number) => {
    const newSizeBreakdown = { ...formData.size_breakdown, [size]: qty };
    const totalQty = Object.values(newSizeBreakdown).reduce((sum, q) => sum + q, 0);
    setFormData({
      ...formData,
      size_breakdown: newSizeBreakdown,
      cutting_qty: totalQty.toString(),
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/cutting-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fabric_qty: formData.fabric_qty ? Number(formData.fabric_qty) : null,
          cutting_qty: Number(formData.cutting_qty),
          size_breakdown: formData.size_breakdown,
        }),
      });
      const result = await response.json();
      
      if (result.success) {
        setDialogOpen(false);
        setFormData({
          production_order_id: '',
          style_no: '',
          color: '',
          fabric_code: '',
          fabric_qty: '',
          cutting_qty: '',
          cutting_date: new Date().toISOString().slice(0, 10),
          workshop: '一车间',
          cutting_team: '',
          notes: '',
          size_breakdown: {},
        });
        fetchCuttingOrders();
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string, completedQty?: number) => {
    try {
      const response = await fetch('/api/cutting-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, completed_qty: completedQty }),
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
  const stats = {
    total: cuttingOrders.length,
    pending: cuttingOrders.filter(o => o.status === 'pending').length,
    inProgress: cuttingOrders.filter(o => o.status === 'in_progress').length,
    totalCuttingQty: cuttingOrders.reduce((sum, o) => sum + Number(o.cutting_qty), 0),
    totalCompletedQty: cuttingOrders.reduce((sum, o) => sum + Number(o.completed_qty), 0),
    defectRate: cuttingOrders.reduce((sum, o) => sum + Number(o.defective_qty), 0) / 
                Math.max(cuttingOrders.reduce((sum, o) => sum + Number(o.completed_qty), 0), 1) * 100,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">裁床管理</h1>
          <p className="text-muted-foreground">管理裁床单、尺码配比、工序工资</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新建裁床单
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总裁床数</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCuttingQty.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待裁床</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">单</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">完成数量</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.totalCompletedQty.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">次品率</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.defectRate.toFixed(2)}%</div>
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
                  <TableHead>裁床数量</TableHead>
                  <TableHead>完成数量</TableHead>
                  <TableHead>次品数</TableHead>
                  <TableHead>进度</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuttingOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">{order.order_no}</TableCell>
                    <TableCell>{order.style_no}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.color}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{order.cutting_qty}</TableCell>
                    <TableCell>{order.completed_qty}</TableCell>
                    <TableCell className="text-red-500">{order.defective_qty}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${Math.min((order.completed_qty / order.cutting_qty) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs">
                          {Math.round((order.completed_qty / order.cutting_qty) * 100)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[order.status]?.variant || 'outline'}>
                        {statusConfig[order.status]?.label || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{order.cutting_date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {order.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                          >
                            开始
                          </Button>
                        )}
                        {order.status === 'in_progress' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleUpdateStatus(order.id, 'completed', order.cutting_qty)}
                          >
                            完成
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setSelectedOrder(order);
                            setDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新建裁床单</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>关联生产订单</Label>
              <Select 
                value={formData.production_order_id} 
                onValueChange={handleProductionOrderChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择生产订单（可选）" />
                </SelectTrigger>
                <SelectContent>
                  {productionOrders.map(order => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.order_no} - {order.style_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>款号 *</Label>
                <Input
                  value={formData.style_no}
                  onChange={(e) => setFormData({ ...formData, style_no: e.target.value })}
                  placeholder="如: ST2024001"
                />
              </div>
              <div className="space-y-2">
                <Label>颜色 *</Label>
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="如: 黑色"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>面料编码</Label>
                <Input
                  value={formData.fabric_code}
                  onChange={(e) => setFormData({ ...formData, fabric_code: e.target.value })}
                  placeholder="如: MF001"
                />
              </div>
              <div className="space-y-2">
                <Label>面料用量(米)</Label>
                <Input
                  type="number"
                  value={formData.fabric_qty}
                  onChange={(e) => setFormData({ ...formData, fabric_qty: e.target.value })}
                />
              </div>
            </div>

            {/* 尺码配比 */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">尺码配比</Label>
              <div className="grid grid-cols-4 gap-2">
                {sizeOptions.map(size => (
                  <div key={size} className="space-y-1">
                    <Label className="text-xs">{size}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.size_breakdown[size] || ''}
                      onChange={(e) => handleSizeChange(size, parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 p-2 bg-muted rounded">
                <span className="text-sm text-muted-foreground">合计: </span>
                <span className="font-bold">{formData.cutting_qty || 0}</span>
                <span className="text-sm text-muted-foreground"> 件</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>裁床日期</Label>
                <Input
                  type="date"
                  value={formData.cutting_date}
                  onChange={(e) => setFormData({ ...formData, cutting_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>车间</Label>
                <Select 
                  value={formData.workshop} 
                  onValueChange={(v) => setFormData({ ...formData, workshop: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择车间" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="一车间">一车间</SelectItem>
                    <SelectItem value="二车间">二车间</SelectItem>
                    <SelectItem value="三车间">三车间</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>裁床班组</Label>
              <Input
                value={formData.cutting_team}
                onChange={(e) => setFormData({ ...formData, cutting_team: e.target.value })}
                placeholder="如: 裁床A组"
              />
            </div>

            <div className="space-y-2">
              <Label>备注</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !formData.style_no || !formData.color || !formData.cutting_qty}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              创建裁床单
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 详情弹窗 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>裁床单详情</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">裁床单号</span>
                  <p className="font-mono font-medium">{selectedOrder.order_no}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">款号</span>
                  <p className="font-medium">{selectedOrder.style_no}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">颜色</span>
                  <p>{selectedOrder.color}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">状态</span>
                  <Badge variant={statusConfig[selectedOrder.status]?.variant}>
                    {statusConfig[selectedOrder.status]?.label}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">裁床数量</span>
                  <p className="font-bold">{selectedOrder.cutting_qty}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">完成数量</span>
                  <p className="font-bold text-green-600">{selectedOrder.completed_qty}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">次品数</span>
                  <p className="text-red-500">{selectedOrder.defective_qty}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">车间</span>
                  <p>{selectedOrder.workshop || '-'}</p>
                </div>
              </div>
              {selectedOrder.notes && (
                <div>
                  <span className="text-sm text-muted-foreground">备注</span>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
