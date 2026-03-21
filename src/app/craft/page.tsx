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
  DialogDescription,
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
  Sparkles,
  Search,
  Plus,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Play,
} from 'lucide-react';

interface CraftProcess {
  id: string;
  productionOrderId: string;
  processName: string;
  processType: string | null;
  quantity: number;
  completedQty: number;
  unitPrice: string | null;
  totalCost: string | null;
  supplierId: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
  // 关联生产订单信息
  orderNo: string | null;
  styleNo: string | null;
  styleName: string | null;
}

const processTypes = [
  { value: 'embroidery', label: '刺绣' },
  { value: 'printing', label: '印花' },
  { value: 'washing', label: '水洗' },
  { value: 'dyeing', label: '染色' },
  { value: 'sequin', label: '烫钻' },
  { value: 'hemming', label: '包边' },
  { value: 'other', label: '其他' },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: '待处理', color: 'secondary', icon: Clock },
  in_progress: { label: '进行中', color: 'default', icon: Play },
  completed: { label: '已完成', color: 'default', icon: CheckCircle },
  cancelled: { label: '已取消', color: 'destructive', icon: XCircle },
};

export default function CraftPage() {
  const [crafts, setCrafts] = useState<CraftProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    productionOrderId: '',
    processName: '',
    processType: '',
    quantity: 0,
    unitPrice: 0,
    supplierId: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  // 生产订单列表
  const [orders, setOrders] = useState<any[]>([]);

  const fetchCrafts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });
      
      const response = await fetch(`/api/craft-processes?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setCrafts(result.data);
        setTotal(result.total);
      }
    } catch (error) {
      console.error('Failed to fetch craft processes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/production-orders?pageSize=100');
      const result = await response.json();
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  useEffect(() => {
    fetchCrafts();
    fetchOrders();
  }, [page, statusFilter]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/craft-processes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      
      if (result.success) {
        setDialogOpen(false);
        fetchCrafts();
        alert('创建成功！');
        // 重置表单
        setFormData({
          productionOrderId: '',
          processName: '',
          processType: '',
          quantity: 0,
          unitPrice: 0,
          supplierId: '',
          startDate: '',
          endDate: '',
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

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/craft-processes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const result = await response.json();
      
      if (result.success) {
        fetchCrafts();
        alert('状态更新成功！');
      } else {
        alert(result.error || '更新失败');
      }
    } catch (error) {
      console.error('Status change error:', error);
    }
  };

  // 计算统计数据
  const pendingCount = crafts.filter(c => c.status === 'pending').length;
  const inProgressCount = crafts.filter(c => c.status === 'in_progress').length;
  const completedCount = crafts.filter(c => c.status === 'completed').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">二次工艺</h1>
          <p className="text-muted-foreground">管理刺绣、印花、水洗等二次工艺</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新增工艺
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总工艺单</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待处理</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">进行中</CardTitle>
            <Play className="h-4 w-4 text-blue-500" />
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
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索工艺名称、类型..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchCrafts()}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="in_progress">进行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchCrafts}>查询</Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : crafts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              暂无工艺数据
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>工艺名称</TableHead>
                  <TableHead>工艺类型</TableHead>
                  <TableHead>生产订单</TableHead>
                  <TableHead>款号</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>已完成</TableHead>
                  <TableHead>单价</TableHead>
                  <TableHead>总价</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crafts.map((craft) => {
                  const statusInfo = statusConfig[craft.status] || statusConfig.pending;
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <TableRow key={craft.id}>
                      <TableCell className="font-medium">{craft.processName}</TableCell>
                      <TableCell>
                        {craft.processType ? (
                          <Badge variant="outline">
                            {processTypes.find(t => t.value === craft.processType)?.label || craft.processType}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{craft.orderNo || '-'}</TableCell>
                      <TableCell>{craft.styleNo || '-'}</TableCell>
                      <TableCell>{craft.quantity}</TableCell>
                      <TableCell>{craft.completedQty}</TableCell>
                      <TableCell>{craft.unitPrice ? `¥${craft.unitPrice}` : '-'}</TableCell>
                      <TableCell>{craft.totalCost ? `¥${craft.totalCost}` : '-'}</TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.color as any}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {craft.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(craft.id, 'in_progress')}
                            >
                              开始
                            </Button>
                          )}
                          {craft.status === 'in_progress' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleStatusChange(craft.id, 'completed')}
                            >
                              完成
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 新增工艺弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新增二次工艺</DialogTitle>
            <DialogDescription>
              创建新的二次工艺任务
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>生产订单 *</Label>
              <Select 
                value={formData.productionOrderId} 
                onValueChange={(v) => setFormData({ ...formData, productionOrderId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择生产订单" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.orderNo} - {order.styleName || order.styleNo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>工艺名称 *</Label>
                <Input
                  value={formData.processName}
                  onChange={(e) => setFormData({ ...formData, processName: e.target.value })}
                  placeholder="例如：前胸刺绣"
                />
              </div>
              <div className="space-y-2">
                <Label>工艺类型</Label>
                <Select 
                  value={formData.processType} 
                  onValueChange={(v) => setFormData({ ...formData, processType: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {processTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>数量 *</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>单价 (元)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>开始日期</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>完成日期</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>备注</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="备注信息..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !formData.productionOrderId || !formData.processName || formData.quantity <= 0}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
