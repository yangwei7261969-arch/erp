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
  Trash2,
  Layers,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileCheck,
  XCircle,
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
  bed_number?: number; // 床号
  total_beds?: number; // 总床数
  size_breakdown?: Record<string, number>;
}

interface ProductionOrder {
  id: string;
  order_no: string;
  style_no: string;
  style_name: string;
  color: string;
  quantity: number;
  completed_quantity: number;
  status: string;
}

interface OrderDetail {
  order: ProductionOrder;
  size_breakdown: Record<string, number>;
  already_cut: number;
  size_already_cut: Record<string, number>;
  size_remaining: Record<string, number>;
  remaining_qty: number;
  cutting_orders: CuttingOrder[];
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  pending: { label: '待开始', variant: 'outline' },
  in_progress: { label: '裁床中', variant: 'secondary' },
  completed: { label: '已完成', variant: 'default' },
};

export default function CuttingPage() {
  const [cuttingOrders, setCuttingOrders] = useState<CuttingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CuttingOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [selectedProductionOrder, setSelectedProductionOrder] = useState<string>('');
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // 分床数据
  const [beds, setBeds] = useState<{
    bedNumber: number;
    size_breakdown: Record<string, number>;
    cutting_qty: number;
    notes: string;
  }[]>([]);
  
  const [formData, setFormData] = useState({
    production_order_id: '',
    style_no: '',
    color: '',
    fabric_code: '',
    fabric_qty: '',
    cutting_date: new Date().toISOString().slice(0, 10),
    workshop: '一车间',
    cutting_team: '',
    notes: '',
    size_breakdown: {} as Record<string, number>,
  });

  // 数量检查相关状态
  const [checkingOpen, setCheckingOpen] = useState(false);
  const [checkingProgress, setCheckingProgress] = useState(0);
  const [checkingResults, setCheckingResults] = useState<{
    order_no: string;
    style_no: string;
    color: string;
    cutting_qty: number;
    expected_qty: number;
    status: 'pass' | 'warning' | 'error';
    message: string;
  }[]>([]);
  const [isChecking, setIsChecking] = useState(false);

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
      const response = await fetch('/api/order-details');
      const result = await response.json();
      if (result.success) {
        setProductionOrders(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch production orders:', error);
    }
  };

  const fetchOrderDetail = async (orderId: string) => {
    setLoadingDetail(true);
    try {
      const response = await fetch(`/api/order-details?order_id=${orderId}`);
      const result = await response.json();
      if (result.success) {
        setOrderDetail(result.data);
        
        // 初始化第一床数据
        const sizes = Object.keys(result.data.size_breakdown);
        const initialBreakdown: Record<string, number> = {};
        sizes.forEach(size => {
          initialBreakdown[size] = 0;
        });
        
        setBeds([{
          bedNumber: 1,
          size_breakdown: initialBreakdown,
          cutting_qty: 0,
          notes: '',
        }]);
      }
    } catch (error) {
      console.error('Failed to fetch order detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchCuttingOrders();
    fetchProductionOrders();
  }, [statusFilter]);

  useEffect(() => {
    if (selectedProductionOrder) {
      fetchOrderDetail(selectedProductionOrder);
      const order = productionOrders.find(o => o.id === selectedProductionOrder);
      if (order) {
        setFormData({
          ...formData,
          production_order_id: selectedProductionOrder,
          style_no: order.style_no || '',
          color: order.color || '',
        });
      }
    } else {
      setOrderDetail(null);
      setBeds([]);
    }
  }, [selectedProductionOrder]);

  const handleAddBed = () => {
    if (!orderDetail) return;
    
    const sizes = Object.keys(orderDetail.size_breakdown);
    const initialBreakdown: Record<string, number> = {};
    sizes.forEach(size => {
      initialBreakdown[size] = 0;
    });
    
    setBeds([
      ...beds,
      {
        bedNumber: beds.length + 1,
        size_breakdown: initialBreakdown,
        cutting_qty: 0,
        notes: '',
      },
    ]);
  };

  const handleRemoveBed = (index: number) => {
    if (beds.length <= 1) return;
    const newBeds = beds.filter((_, i) => i !== index);
    // 重新编号
    newBeds.forEach((bed, i) => {
      bed.bedNumber = i + 1;
    });
    setBeds(newBeds);
  };

  const handleBedSizeChange = (bedIndex: number, size: string, qty: number) => {
    if (!orderDetail) return;
    
    const remaining = orderDetail.size_remaining[size] || 0;
    // 计算其他床已分配的数量
    const otherBedsQty = beds.reduce((sum, bed, i) => {
      if (i !== bedIndex) {
        return sum + (bed.size_breakdown[size] || 0);
      }
      return sum;
    }, 0);
    
    const maxAllowed = remaining - otherBedsQty;
    const actualQty = Math.min(qty, maxAllowed);
    
    const newBeds = [...beds];
    newBeds[bedIndex] = {
      ...newBeds[bedIndex],
      size_breakdown: {
        ...newBeds[bedIndex].size_breakdown,
        [size]: actualQty,
      },
      cutting_qty: Object.values({
        ...newBeds[bedIndex].size_breakdown,
        [size]: actualQty,
      }).reduce((sum, q) => sum + q, 0),
    };
    setBeds(newBeds);
  };

  const handleSubmit = async () => {
    if (!orderDetail || beds.length === 0) return;
    
    setSubmitting(true);
    try {
      // 创建每床裁床单
      for (const bed of beds) {
        if (bed.cutting_qty <= 0) continue;
        
        const response = await fetch('/api/cutting-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            production_order_id: selectedProductionOrder,
            style_no: formData.style_no,
            color: formData.color,
            fabric_code: formData.fabric_code || null,
            fabric_qty: formData.fabric_qty ? Number(formData.fabric_qty) : null,
            cutting_qty: bed.cutting_qty,
            cutting_date: formData.cutting_date,
            workshop: formData.workshop,
            cutting_team: formData.cutting_team || null,
            notes: bed.notes || formData.notes || `第${bed.bedNumber}床`,
            size_breakdown: bed.size_breakdown,
            bed_number: bed.bedNumber,
            total_beds: beds.filter(b => b.cutting_qty > 0).length,
          }),
        });
        
        const result = await response.json();
        if (!result.success) {
          alert(`第${bed.bedNumber}床创建失败: ${result.error}`);
        }
      }
      
      setDialogOpen(false);
      resetForm();
      fetchCuttingOrders();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedProductionOrder('');
    setOrderDetail(null);
    setBeds([]);
    setFormData({
      production_order_id: '',
      style_no: '',
      color: '',
      fabric_code: '',
      fabric_qty: '',
      cutting_date: new Date().toISOString().slice(0, 10),
      workshop: '一车间',
      cutting_team: '',
      notes: '',
      size_breakdown: {},
    });
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

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此裁床单吗？')) return;
    
    try {
      const response = await fetch(`/api/cutting-orders?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        fetchCuttingOrders();
      }
    } catch (error) {
      console.error('Delete error:', error);
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

  // 检查裁床数量
  const handleCheckQuantities = async () => {
    setIsChecking(true);
    setCheckingOpen(true);
    setCheckingProgress(0);
    setCheckingResults([]);

    const results: typeof checkingResults = [];

    for (let i = 0; i < cuttingOrders.length; i++) {
      const order = cuttingOrders[i];
      
      // 模拟检查过程（实际项目中应该调用API检查）
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 检查逻辑
      let status: 'pass' | 'warning' | 'error' = 'pass';
      let message = '数量正确';

      // 检查1: 裁床数量是否大于0
      if (order.cutting_qty <= 0) {
        status = 'error';
        message = '裁床数量为0，请检查';
      }
      // 检查2: 完成数量是否超过裁床数量
      else if (order.completed_qty > order.cutting_qty) {
        status = 'error';
        message = `完成数量(${order.completed_qty})超过裁床数量(${order.cutting_qty})`;
      }
      // 检查3: 待开始状态但已有完成数量
      else if (order.status === 'pending' && order.completed_qty > 0) {
        status = 'warning';
        message = '状态为待开始，但已有完成数量';
      }
      // 检查4: 已完成状态但数量不匹配
      else if (order.status === 'completed' && order.completed_qty < order.cutting_qty) {
        status = 'warning';
        message = `状态为已完成，但完成数量(${order.completed_qty})小于裁床数量(${order.cutting_qty})`;
      }
      // 检查5: 次品率检查
      else if (order.completed_qty > 0 && order.defective_qty > 0) {
        const defectRate = (order.defective_qty / order.completed_qty) * 100;
        if (defectRate > 5) {
          status = 'warning';
          message = `次品率过高: ${defectRate.toFixed(1)}%`;
        }
      }

      results.push({
        order_no: order.order_no,
        style_no: order.style_no,
        color: order.color,
        cutting_qty: order.cutting_qty,
        expected_qty: order.cutting_qty, // 实际项目中应该从生产订单获取预期数量
        status,
        message,
      });

      setCheckingProgress(((i + 1) / cuttingOrders.length) * 100);
      setCheckingResults([...results]);
    }

    setIsChecking(false);
  };

  // 计算总载数量
  const totalCuttingQty = beds.reduce((sum, bed) => sum + bed.cutting_qty, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">裁床管理</h1>
          <p className="text-muted-foreground">管理裁床单、分床、尺码配比</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleCheckQuantities}
            disabled={cuttingOrders.length === 0 || isChecking}
          >
            {isChecking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileCheck className="mr-2 h-4 w-4" />
            )}
            检查数量
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新建裁床单
          </Button>
        </div>
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
                  <TableHead>床号</TableHead>
                  <TableHead>款号</TableHead>
                  <TableHead>颜色</TableHead>
                  <TableHead>裁床数量</TableHead>
                  <TableHead>完成数量</TableHead>
                  <TableHead>进度</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuttingOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">{order.order_no}</TableCell>
                    <TableCell>
                      {order.bed_number ? (
                        <Badge variant="outline">第{order.bed_number}床</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{order.style_no}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.color}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{order.cutting_qty}</TableCell>
                    <TableCell>{order.completed_qty}</TableCell>
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
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
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
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDelete(order.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5" />
              新建裁床单
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* 选择生产订单 */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">选择生产订单 *</Label>
              <Select 
                value={selectedProductionOrder} 
                onValueChange={setSelectedProductionOrder}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择生产订单" />
                </SelectTrigger>
                <SelectContent>
                  {productionOrders.map(order => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.order_no} - {order.style_name || order.style_no} 
                      ({order.color}) - {order.quantity}件
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loadingDetail && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {orderDetail && (
              <>
                {/* 订单信息 */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">款号：</span>
                        <span className="font-medium">{orderDetail.order.style_no}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">颜色：</span>
                        <span className="font-medium">{orderDetail.order.color}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">订单数量：</span>
                        <span className="font-bold text-blue-600">{orderDetail.order.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">已裁数量：</span>
                        <span className="font-bold text-green-600">{orderDetail.already_cut}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 尺码配比明细 */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">订单尺码明细</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>尺码</TableHead>
                        {Object.keys(orderDetail.size_breakdown).map(size => (
                          <TableHead key={size} className="text-center">{size}</TableHead>
                        ))}
                        <TableHead className="text-right">合计</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="bg-gray-50">
                        <TableCell className="font-medium">订单数量</TableCell>
                        {Object.entries(orderDetail.size_breakdown).map(([size, qty]) => (
                          <TableCell key={size} className="text-center">{qty}</TableCell>
                        ))}
                        <TableCell className="text-right font-bold">
                          {Object.values(orderDetail.size_breakdown).reduce((a, b) => a + b, 0)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-green-50">
                        <TableCell className="font-medium text-green-700">已载数量</TableCell>
                        {Object.keys(orderDetail.size_breakdown).map(size => (
                          <TableCell key={size} className="text-center text-green-700">
                            {orderDetail.size_already_cut[size] || 0}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-bold text-green-700">
                          {orderDetail.already_cut}
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-orange-50">
                        <TableCell className="font-medium text-orange-700">待载数量</TableCell>
                        {Object.entries(orderDetail.size_remaining).map(([size, qty]) => (
                          <TableCell key={size} className="text-center text-orange-700 font-bold">
                            {qty}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-bold text-orange-700">
                          {orderDetail.remaining_qty}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* 分床 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Layers className="h-5 w-5" />
                      分床裁剪
                    </Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddBed}
                      disabled={beds.length >= 10}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      添加一床
                    </Button>
                  </div>

                  {beds.length > 0 && orderDetail && (
                    <div className="space-y-4">
                      {beds.map((bed, bedIndex) => (
                        <Card key={bedIndex} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">
                                第 {bed.bedNumber} 床
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                  裁剪数量: <span className="font-bold text-blue-600">{bed.cutting_qty}</span> 件
                                </span>
                                {beds.length > 1 && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleRemoveBed(bedIndex)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-6 gap-2">
                              {Object.entries(orderDetail.size_breakdown).map(([size, orderQty]) => {
                                const remaining = orderDetail.size_remaining[size] || 0;
                                const otherBedsQty = beds.reduce((sum, b, i) => {
                                  if (i !== bedIndex) return sum + (b.size_breakdown[size] || 0);
                                  return sum;
                                }, 0);
                                const maxForThisBed = remaining - otherBedsQty;
                                const currentQty = bed.size_breakdown[size] || 0;
                                const isOverLimit = currentQty > maxForThisBed;
                                
                                return (
                                  <div key={size} className="space-y-1">
                                    <Label className="text-xs flex items-center justify-between">
                                      <span>{size}</span>
                                      <span className="text-gray-400">
                                        (可裁: {Math.max(0, maxForThisBed)})
                                      </span>
                                    </Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max={Math.max(0, maxForThisBed)}
                                      value={currentQty || ''}
                                      onChange={(e) => handleBedSizeChange(bedIndex, size, parseInt(e.target.value) || 0)}
                                      className={isOverLimit ? 'border-red-500' : ''}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <Label className="text-xs">备注</Label>
                                <Input
                                  value={bed.notes}
                                  onChange={(e) => {
                                    const newBeds = [...beds];
                                    newBeds[bedIndex].notes = e.target.value;
                                    setBeds(newBeds);
                                  }}
                                  placeholder="如: 棉袄第1床..."
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* 汇总 */}
                {beds.length > 0 && (
                  <Card className="bg-gray-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          共 <span className="font-bold">{beds.length}</span> 床，
                          总裁剪数量: <span className="font-bold text-blue-600 text-lg">{totalCuttingQty}</span> 件
                        </div>
                        {totalCuttingQty > orderDetail.remaining_qty && (
                          <div className="flex items-center gap-1 text-red-500 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            超过待载数量 {totalCuttingQty - orderDetail.remaining_qty} 件
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 其他信息 */}
                <div className="grid grid-cols-3 gap-4">
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
                  <div className="space-y-2">
                    <Label>裁床班组</Label>
                    <Input
                      value={formData.cutting_team}
                      onChange={(e) => setFormData({ ...formData, cutting_team: e.target.value })}
                      placeholder="如: 裁床A组"
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

                <div className="space-y-2">
                  <Label>备注</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDialogOpen(false);
              resetForm();
            }}>取消</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !selectedProductionOrder || beds.length === 0 || totalCuttingQty === 0}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              创建裁床单 ({beds.length}床/{totalCuttingQty}件)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 详情弹窗 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
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
                  <span className="text-sm text-muted-foreground">床号</span>
                  <p>
                    {selectedOrder.bed_number ? (
                      <Badge variant="outline">第{selectedOrder.bed_number}床</Badge>
                    ) : '-'}
                  </p>
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
                  <span className="text-sm text-muted-foreground">裁床数量</span>
                  <p className="font-bold">{selectedOrder.cutting_qty}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">完成数量</span>
                  <p className="font-bold text-green-600">{selectedOrder.completed_qty}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">状态</span>
                  <Badge variant={statusConfig[selectedOrder.status]?.variant}>
                    {statusConfig[selectedOrder.status]?.label}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">车间</span>
                  <p>{selectedOrder.workshop || '-'}</p>
                </div>
              </div>
              
              {selectedOrder.size_breakdown && Object.keys(selectedOrder.size_breakdown).length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">尺码配比</span>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {Object.entries(selectedOrder.size_breakdown).map(([size, qty]) => (
                      qty > 0 && (
                        <Badge key={size} variant="secondary">
                          {size}: {qty}
                        </Badge>
                      )
                    ))}
                  </div>
                </div>
              )}
              
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

      {/* 数量检查弹窗 */}
      <Dialog open={checkingOpen} onOpenChange={setCheckingOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              裁床数量检查报告
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* 检查进度 */}
            {isChecking && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>正在检查...</span>
                  <span>{Math.round(checkingProgress)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${checkingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* 检查结果汇总 */}
            {!isChecking && checkingResults.length > 0 && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="text-sm text-green-600">检查通过</div>
                          <div className="text-2xl font-bold text-green-700">
                            {checkingResults.filter(r => r.status === 'pass').length}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <div className="text-sm text-yellow-600">警告</div>
                          <div className="text-2xl font-bold text-yellow-700">
                            {checkingResults.filter(r => r.status === 'warning').length}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <div>
                          <div className="text-sm text-red-600">错误</div>
                          <div className="text-2xl font-bold text-red-700">
                            {checkingResults.filter(r => r.status === 'error').length}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 详细结果列表 */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">检查详情</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>裁床单号</TableHead>
                        <TableHead>款号</TableHead>
                        <TableHead>颜色</TableHead>
                        <TableHead className="text-right">裁床数量</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>说明</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {checkingResults.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">{result.order_no}</TableCell>
                          <TableCell>{result.style_no}</TableCell>
                          <TableCell>{result.color}</TableCell>
                          <TableCell className="text-right font-medium">{result.cutting_qty}</TableCell>
                          <TableCell>
                            {result.status === 'pass' && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                通过
                              </Badge>
                            )}
                            {result.status === 'warning' && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                警告
                              </Badge>
                            )}
                            {result.status === 'error' && (
                              <Badge className="bg-red-100 text-red-800">
                                <XCircle className="h-3 w-3 mr-1" />
                                错误
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{result.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}

            {/* 无数据提示 */}
            {!isChecking && checkingResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                暂无检查结果
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckingOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
