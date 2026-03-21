'use client';

import React, { useState, useEffect } from 'react';
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
  Package,
  Search,
  Download,
  Plus,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Scissors,
} from 'lucide-react';

interface ProductionOrder {
  id: string;
  order_no: string;
  style_no: string;
  style_name: string;
  color: string;
  quantity: number;
  completed_quantity: number;
  status: string;
  plan_start_date: string | null;
  plan_end_date: string | null;
  workshop: string | null;
  notes: string | null;
  created_at: string;
}

interface CuttingOrder {
  id: string;
  order_no: string;
  style_no: string;
  color: string;
  cutting_qty: number;
  completed_qty: number;
  defective_qty: number;
  status: string;
  cutting_date: string | null;
  workshop: string | null;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pending: { label: '待开始', variant: 'outline' },
  in_progress: { label: '生产中', variant: 'secondary' },
  completed: { label: '已完成', variant: 'default' },
  cancelled: { label: '已取消', variant: 'destructive' },
};

export default function ProductionPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // 详情弹窗
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [cuttingOrders, setCuttingOrders] = useState<CuttingOrder[]>([]);
  
  // 裁床弹窗
  const [cuttingDialogOpen, setCuttingDialogOpen] = useState(false);
  const [cuttingFormData, setCuttingFormData] = useState({
    production_order_id: '',
    style_no: '',
    color: '',
    cutting_qty: 0,
    workshop: '',
  });
  
  const [formData, setFormData] = useState({
    style_no: '',
    style_name: '',
    color: '',
    quantity: 0,
    plan_start_date: '',
    plan_end_date: '',
    workshop: '',
    notes: '',
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(search && { search }),
      });
      
      const response = await fetch(`/api/production-orders?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data);
        setTotal(result.total);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, search]);

  const handleOpenDialog = (order?: ProductionOrder) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        style_no: order.style_no,
        style_name: order.style_name,
        color: order.color,
        quantity: order.quantity,
        plan_start_date: order.plan_start_date || '',
        plan_end_date: order.plan_end_date || '',
        workshop: order.workshop || '',
        notes: order.notes || '',
      });
    } else {
      setEditingOrder(null);
      setFormData({
        style_no: '',
        style_name: '',
        color: '',
        quantity: 0,
        plan_start_date: '',
        plan_end_date: '',
        workshop: '',
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingOrder) {
        const response = await fetch(`/api/production-orders/${editingOrder.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        if (result.success) {
          setDialogOpen(false);
          fetchOrders();
        }
      } else {
        const response = await fetch('/api/production-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        if (result.success) {
          setDialogOpen(false);
          fetchOrders();
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此订单吗？')) return;
    
    try {
      const response = await fetch(`/api/production-orders/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/production-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (result.success) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  // 查看详情
  const handleViewDetail = async (order: ProductionOrder) => {
    setSelectedOrder(order);
    setDetailOpen(true);
    
    // 获取关联的裁床单
    const response = await fetch(`/api/cutting-orders?productionOrderId=${order.id}`);
    const result = await response.json();
    if (result.success) {
      setCuttingOrders(result.data);
    }
  };

  // 打开裁床弹窗
  const handleOpenCuttingDialog = (order: ProductionOrder) => {
    setCuttingFormData({
      production_order_id: order.id,
      style_no: order.style_no,
      color: order.color,
      cutting_qty: order.quantity,
      workshop: order.workshop || '',
    });
    setCuttingDialogOpen(true);
  };

  // 提交裁床单
  const handleCuttingSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/cutting-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuttingFormData),
      });
      const result = await response.json();
      if (result.success) {
        setCuttingDialogOpen(false);
        fetchOrders();
        alert('裁床单创建成功！');
      }
    } catch (error) {
      console.error('Cutting submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">生产管理</h1>
          <p className="text-muted-foreground">管理生产订单、裁床和进度</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            新建订单
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总订单</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">生产中</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {orders.filter(o => o.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {orders.filter(o => o.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总下单数</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {orders.reduce((sum, o) => sum + o.quantity, 0).toLocaleString()}
            </div>
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
                placeholder="搜索订单号、款号、款名..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待开始</SelectItem>
                <SelectItem value="in_progress">生产中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
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
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              暂无数据
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单号</TableHead>
                    <TableHead>款号</TableHead>
                    <TableHead>款名</TableHead>
                    <TableHead>颜色</TableHead>
                    <TableHead>下单数</TableHead>
                    <TableHead>完成数</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const config = statusConfig[order.status] || statusConfig.pending;
                    const progress = order.quantity > 0 
                      ? Math.round((order.completed_quantity / order.quantity) * 100) 
                      : 0;
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.order_no}</TableCell>
                        <TableCell>{order.style_no}</TableCell>
                        <TableCell>{order.style_name}</TableCell>
                        <TableCell>{order.color}</TableCell>
                        <TableCell className="font-medium">{order.quantity}</TableCell>
                        <TableCell>{order.completed_quantity}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-sm">{progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant}>
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleViewDetail(order)}
                            >
                              详情
                            </Button>
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
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleOpenCuttingDialog(order)}
                                >
                                  <Scissors className="h-3 w-3 mr-1" />
                                  裁床
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUpdateStatus(order.id, 'completed')}
                                >
                                  完成
                                </Button>
                              </>
                            )}
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleOpenDialog(order)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleDelete(order.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  共 {total} 条记录
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    第 {page} / {totalPages || 1} 页
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 订单详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>订单详情 - {selectedOrder?.order_no}</DialogTitle>
            <DialogDescription>
              {selectedOrder?.style_name} - {selectedOrder?.color}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="info">
            <TabsList>
              <TabsTrigger value="info">基本信息</TabsTrigger>
              <TabsTrigger value="cutting">裁床记录</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">订单号</Label>
                  <div className="font-medium">{selectedOrder?.order_no}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">款号</Label>
                  <div className="font-medium">{selectedOrder?.style_no}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">下单数量</Label>
                  <div className="font-medium text-lg">{selectedOrder?.quantity} 件</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">完成数量</Label>
                  <div className="font-medium text-lg text-green-600">{selectedOrder?.completed_quantity} 件</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">状态</Label>
                  <div>
                    <Badge variant={statusConfig[selectedOrder?.status]?.variant}>
                      {statusConfig[selectedOrder?.status]?.label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">车间</Label>
                  <div className="font-medium">{selectedOrder?.workshop || '-'}</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="cutting">
              {cuttingOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无裁床记录
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>裁床单号</TableHead>
                      <TableHead>裁床数</TableHead>
                      <TableHead>完成数</TableHead>
                      <TableHead>次品数</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>日期</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cuttingOrders.map((co) => (
                      <TableRow key={co.id}>
                        <TableCell>{co.order_no}</TableCell>
                        <TableCell>{co.cutting_qty}</TableCell>
                        <TableCell>{co.completed_qty}</TableCell>
                        <TableCell>{co.defective_qty}</TableCell>
                        <TableCell>
                          <Badge variant={co.status === 'completed' ? 'default' : 'secondary'}>
                            {co.status === 'completed' ? '已完成' : '进行中'}
                          </Badge>
                        </TableCell>
                        <TableCell>{co.cutting_date || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">
                      {cuttingOrders.reduce((sum, c) => sum + c.cutting_qty, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">总裁床数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {cuttingOrders.reduce((sum, c) => sum + c.completed_qty, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">总完成数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {cuttingOrders.reduce((sum, c) => sum + c.defective_qty, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">总次品数</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* 新建订单弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingOrder ? '编辑订单' : '新建订单'}</DialogTitle>
            <DialogDescription>
              {editingOrder ? '修改生产订单信息' : '创建新的生产订单'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="style_no">款号 *</Label>
                <Input
                  id="style_no"
                  value={formData.style_no}
                  onChange={(e) => setFormData({ ...formData, style_no: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="style_name">款名 *</Label>
                <Input
                  id="style_name"
                  value={formData.style_name}
                  onChange={(e) => setFormData({ ...formData, style_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">颜色 *</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">下单数量 *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan_start_date">计划开始日期</Label>
                <Input
                  id="plan_start_date"
                  type="date"
                  value={formData.plan_start_date}
                  onChange={(e) => setFormData({ ...formData, plan_start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan_end_date">计划结束日期</Label>
                <Input
                  id="plan_end_date"
                  type="date"
                  value={formData.plan_end_date}
                  onChange={(e) => setFormData({ ...formData, plan_end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workshop">车间</Label>
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
            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 裁床弹窗 */}
      <Dialog open={cuttingDialogOpen} onOpenChange={setCuttingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建裁床单</DialogTitle>
            <DialogDescription>
              为订单 {cuttingFormData.style_no} 创建裁床单
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>款号</Label>
                <Input value={cuttingFormData.style_no} disabled />
              </div>
              <div className="space-y-2">
                <Label>颜色</Label>
                <Input value={cuttingFormData.color} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cutting_qty">裁床数量 *</Label>
                <Input
                  id="cutting_qty"
                  type="number"
                  value={cuttingFormData.cutting_qty}
                  onChange={(e) => setCuttingFormData({ ...cuttingFormData, cutting_qty: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workshop">车间</Label>
                <Select 
                  value={cuttingFormData.workshop} 
                  onValueChange={(v) => setCuttingFormData({ ...cuttingFormData, workshop: v })}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCuttingDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCuttingSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  创建中...
                </>
              ) : (
                '创建裁床单'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
