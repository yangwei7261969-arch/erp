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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/toast';
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Building2,
  Palette,
  FileCheck,
  Image as ImageIcon,
  Upload,
  X,
  Truck,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
} from 'lucide-react';
import { ExportButton } from '@/components/export-button';

interface ProductionOrder {
  id: string;
  order_no: string;
  style_no: string;
  style_name: string;
  style_image?: string;
  color: string;
  size?: string;
  quantity: number;
  completed_quantity: number;
  status: string;
  plan_start_date: string | null;
  plan_end_date: string | null;
  workshop: string | null;
  notes: string | null;
  created_at: string;
  // 外发信息
  outsource_info?: {
    supplier_id: string;
    supplier_name: string;
    status: string;
  }[];
  // 二次工艺信息
  craft_info?: {
    total: number;
    completed: number;
    status: string;
  };
  // 尾部处理信息
  finishing_info?: {
    total: number;
    completed: number;
    status: string;
  };
}

interface Supplier {
  id: string;
  name: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pending: { label: '待开始', variant: 'outline' },
  confirmed: { label: '已确认', variant: 'secondary' },
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
  const [pageSize] = useState(12);
  const toast = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // 图片上传
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    style_no: '',
    style_name: '',
    color: '',
    size: '',
    quantity: 0,
    plan_start_date: '',
    plan_end_date: '',
    workshop: '',
    notes: '',
    style_image: '',
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

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers?pageSize=100');
      const result = await response.json();
      if (result.success) {
        setSuppliers(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
  }, [page, statusFilter, search]);

  const handleOpenDialog = (order?: ProductionOrder) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        style_no: order.style_no,
        style_name: order.style_name,
        color: order.color,
        size: order.size || '',
        quantity: order.quantity,
        plan_start_date: order.plan_start_date || '',
        plan_end_date: order.plan_end_date || '',
        workshop: order.workshop || '',
        notes: order.notes || '',
        style_image: order.style_image || '',
      });
      setImagePreview(order.style_image || '');
    } else {
      setEditingOrder(null);
      setFormData({
        style_no: '',
        style_name: '',
        color: '',
        size: '',
        quantity: 0,
        plan_start_date: '',
        plan_end_date: '',
        workshop: '',
        notes: '',
        style_image: '',
      });
      setImagePreview('');
    }
    setDialogOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setFormData({ ...formData, style_image: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // 表单验证
    if (!formData.style_no.trim()) {
      toast.error('保存失败', '请输入款号');
      return;
    }
    if (!formData.style_name.trim()) {
      toast.error('保存失败', '请输入款名');
      return;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      toast.error('保存失败', '请输入有效的数量');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingOrder ? `/api/production-orders/${editingOrder.id}` : '/api/production-orders';
      const method = editingOrder ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success(editingOrder ? '订单已更新' : '订单已创建');
        setDialogOpen(false);
        fetchOrders();
      } else {
        toast.error('保存失败', result.error || '未知错误');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('保存失败', '网络错误，请稍后重试');
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

  const handleViewDetail = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const totalPages = Math.ceil(total / pageSize);

  // 获取进度颜色
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">生产订单</h1>
          <p className="text-sm md:text-base text-muted-foreground">管理生产订单、外发、二次工艺和尾部处理</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <ExportButton 
            dataType="production_orders" 
            buttonText="导出订单"
            variant="outline"
          />
          <ExportButton 
            dataType="order_details" 
            buttonText="订单明细"
            variant="outline"
          />
          <Button onClick={() => handleOpenDialog()} className="flex-1 md:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            新建订单
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">总订单</div>
            <div className="text-xl md:text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">生产中</div>
            <div className="text-xl md:text-2xl font-bold text-blue-500">
              {orders.filter(o => o.status === 'in_progress' || o.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">已完成</div>
            <div className="text-xl md:text-2xl font-bold text-green-500">
              {orders.filter(o => o.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">总数量</div>
            <div className="text-xl md:text-2xl font-bold text-orange-500">
              {orders.reduce((sum, o) => sum + o.quantity, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-3">
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
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待开始</SelectItem>
                <SelectItem value="confirmed">已确认</SelectItem>
                <SelectItem value="in_progress">生产中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 订单卡片列表（适配移动端） */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            暂无数据
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 移动端卡片视图 */}
          <div className="grid gap-4 md:hidden">
            {orders.map((order) => {
              const progress = order.quantity > 0
                ? Math.round((order.completed_quantity / order.quantity) * 100)
                : 0;
              const config = statusConfig[order.status] || statusConfig.pending;

              return (
                <Card key={order.id} className="overflow-hidden">
                  <div className="flex">
                    {/* 图片 */}
                    <div className="w-24 h-24 bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      {order.style_image ? (
                        <img
                          src={order.style_image}
                          alt={order.style_no}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-300" />
                      )}
                    </div>
                    
                    <div className="flex-1 p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-sm">{order.order_no}</div>
                          <div className="text-xs text-muted-foreground">{order.style_no} - {order.style_name}</div>
                        </div>
                        <Badge variant={config.variant as any} className="text-xs">
                          {config.label}
                        </Badge>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-xs">
                        <span>{order.color}</span>
                        <span>{order.quantity}件</span>
                      </div>

                      {/* 进度条 */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getProgressColor(progress)}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{progress}%</span>
                      </div>

                      {/* 状态标签 */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {order.outsource_info && order.outsource_info.length > 0 && (
                          <Badge className="bg-purple-100 text-purple-800 text-[10px]">
                            <Building2 className="h-3 w-3 mr-0.5" />
                            {order.outsource_info[0].supplier_name}
                          </Badge>
                        )}
                        {order.craft_info && order.craft_info.total > 0 && (
                          <Badge className="bg-orange-100 text-orange-800 text-[10px]">
                            <Palette className="h-3 w-3 mr-0.5" />
                            二次工艺
                          </Badge>
                        )}
                        {order.finishing_info && order.finishing_info.total > 0 && (
                          <Badge className="bg-green-100 text-green-800 text-[10px]">
                            <FileCheck className="h-3 w-3 mr-0.5" />
                            尾部
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t px-3 py-2 flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleViewDetail(order)}>
                      详情
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleOpenDialog(order)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* PC端表格视图 */}
          <Card className="hidden md:block">
            <CardContent className="pt-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">图片</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">订单号</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">款号</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">款名</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">颜色/尺码</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">数量</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">进度</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">外发</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">状态</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const progress = order.quantity > 0
                      ? Math.round((order.completed_quantity / order.quantity) * 100)
                      : 0;
                    const config = statusConfig[order.status] || statusConfig.pending;

                    return (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {order.style_image ? (
                              <img
                                src={order.style_image}
                                alt={order.style_no}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-gray-300" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 font-medium">{order.order_no}</td>
                        <td className="py-3 px-2 font-bold">{order.style_no}</td>
                        <td className="py-3 px-2">{order.style_name}</td>
                        <td className="py-3 px-2">
                          <span>{order.color}</span>
                          {order.size && <span className="text-muted-foreground"> / {order.size}</span>}
                        </td>
                        <td className="py-3 px-2 font-medium">{order.quantity.toLocaleString()}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getProgressColor(progress)}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-sm">{progress}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          {order.outsource_info && order.outsource_info.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {order.outsource_info.map((os, idx) => (
                                <Badge key={idx} className="bg-purple-100 text-purple-800 text-xs">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  {os.supplier_name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={config.variant as any}>
                            {config.label}
                          </Badge>
                          {/* 工艺和尾部状态 */}
                          <div className="flex gap-1 mt-1">
                            {order.craft_info && order.craft_info.total > 0 && (
                              <Badge className="bg-orange-100 text-orange-800 text-[10px]">
                                <Palette className="h-3 w-3 mr-0.5" />
                                工艺 {order.craft_info.completed}/{order.craft_info.total}
                              </Badge>
                            )}
                            {order.finishing_info && order.finishing_info.total > 0 && (
                              <Badge className="bg-green-100 text-green-800 text-[10px]">
                                <FileCheck className="h-3 w-3 mr-0.5" />
                                尾部 {order.finishing_info.completed}/{order.finishing_info.total}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
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
                              className="text-red-500"
                              onClick={() => handleDelete(order.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
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
            </CardContent>
          </Card>

          {/* 移动端分页 */}
          <div className="flex items-center justify-between md:hidden">
            <div className="text-sm text-muted-foreground">
              共 {total} 条
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
              <span className="text-sm">{page}/{totalPages || 1}</span>
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

      {/* 订单详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              订单详情
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* 图片和基本信息 */}
              <div className="flex gap-4">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {selectedOrder.style_image ? (
                    <img
                      src={selectedOrder.style_image}
                      alt={selectedOrder.style_no}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold">{selectedOrder.order_no}</div>
                  <div className="text-muted-foreground">{selectedOrder.style_no} - {selectedOrder.style_name}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge>{selectedOrder.color}</Badge>
                    {selectedOrder.size && <Badge variant="outline">{selectedOrder.size}</Badge>}
                    <Badge variant={statusConfig[selectedOrder.status]?.variant as any}>
                      {statusConfig[selectedOrder.status]?.label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 数量信息 */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedOrder.quantity}</div>
                  <div className="text-sm text-muted-foreground">下单数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedOrder.completed_quantity}</div>
                  <div className="text-sm text-muted-foreground">完成数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedOrder.quantity > 0
                      ? Math.round((selectedOrder.completed_quantity / selectedOrder.quantity) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">完成率</div>
                </div>
              </div>

              {/* 外发信息 */}
              {selectedOrder.outsource_info && selectedOrder.outsource_info.length > 0 && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 font-medium mb-2">
                    <Building2 className="h-4 w-4 text-purple-500" />
                    外发供应商
                  </div>
                  <div className="space-y-2">
                    {selectedOrder.outsource_info.map((os, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <span className="font-medium">{os.supplier_name}</span>
                        <Badge className="bg-purple-100 text-purple-800">
                          {os.status === 'completed' ? '已完成' : os.status === 'in_progress' ? '进行中' : '待开始'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 二次工艺 */}
              {selectedOrder.craft_info && selectedOrder.craft_info.total > 0 && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 font-medium mb-2">
                    <Palette className="h-4 w-4 text-orange-500" />
                    二次工艺
                  </div>
                  <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                    <span>进度</span>
                    <span className="font-medium">{selectedOrder.craft_info.completed}/{selectedOrder.craft_info.total}</span>
                  </div>
                </div>
              )}

              {/* 尾部处理 */}
              {selectedOrder.finishing_info && selectedOrder.finishing_info.total > 0 && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 font-medium mb-2">
                    <FileCheck className="h-4 w-4 text-green-500" />
                    尾部处理
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span>进度</span>
                    <span className="font-medium">{selectedOrder.finishing_info.completed}/{selectedOrder.finishing_info.total}</span>
                  </div>
                </div>
              )}

              {/* 其他信息 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">车间：</span>
                  <span>{selectedOrder.workshop || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">交期：</span>
                  <span>{selectedOrder.plan_end_date || '-'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">备注：</span>
                  <span>{selectedOrder.notes || '-'}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              关闭
            </Button>
            {selectedOrder && (
              <Button onClick={() => {
                setDetailOpen(false);
                handleOpenDialog(selectedOrder);
              }}>
                编辑
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新建/编辑订单弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOrder ? '编辑订单' : '新建订单'}</DialogTitle>
            <DialogDescription>
              {editingOrder ? '修改生产订单信息' : '创建新的生产订单'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 图片上传 */}
            <div className="space-y-2">
              <Label>款式图片</Label>
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                  {imagePreview ? (
                    <img src={imagePreview} alt="预览" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    上传图片
                  </Button>
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-red-500"
                      onClick={() => {
                        setImagePreview('');
                        setFormData({ ...formData, style_image: '' });
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      移除
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>款号 *</Label>
                <Input
                  value={formData.style_no}
                  onChange={(e) => setFormData({ ...formData, style_no: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>款名 *</Label>
                <Input
                  value={formData.style_name}
                  onChange={(e) => setFormData({ ...formData, style_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>颜色 *</Label>
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>尺码</Label>
                <Input
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>下单数量 *</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>车间</Label>
                <Input
                  value={formData.workshop}
                  onChange={(e) => setFormData({ ...formData, workshop: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>计划开始日期</Label>
                <Input
                  type="date"
                  value={formData.plan_start_date}
                  onChange={(e) => setFormData({ ...formData, plan_start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>计划结束日期</Label>
                <Input
                  type="date"
                  value={formData.plan_end_date}
                  onChange={(e) => setFormData({ ...formData, plan_end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>备注</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
