'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Package,
  Send,
  Eye,
  RotateCcw,
  Search,
  Building2,
  Trash2,
} from 'lucide-react';

interface ProductionOrder {
  id: string;
  order_no: string;
  style_no: string;
  style_name: string;
  color: string;
  size: string;
  quantity: number;
  completed_quantity: number;
  status: string;
  priority: number;
  plan_start_date: string;
  plan_end_date: string;
  actual_start_date: string;
  actual_end_date: string;
  created_at: string;
}

interface OutsourceOrder {
  id: string;
  order_no: string;
  supplier_id: string;
  style_no: string;
  style_name: string;
  quantity: number;
  unit_price?: number;
  total_amount?: number;
  status: string;
  supplier: any;
  created_at: string;
}

const orderStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待确认', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: '已确认', color: 'bg-blue-100 text-blue-800' },
  in_production: { label: '生产中', color: 'bg-indigo-100 text-indigo-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
};

const outsourceStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待接单', color: 'bg-yellow-100 text-yellow-800' },
  accepted: { label: '已接单', color: 'bg-blue-100 text-blue-800' },
  in_production: { label: '生产中', color: 'bg-indigo-100 text-indigo-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  rejected: { label: '已拒绝', color: 'bg-red-100 text-red-800' },
};

export default function AdminOrdersPage() {
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [outsourceOrders, setOutsourceOrders] = useState<OutsourceOrder[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // 筛选
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  // 外发表单
  const [outsourceForm, setOutsourceForm] = useState({
    supplier_id: '',
    unit_price: 0,
    plan_end_date: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, outRes, supRes] = await Promise.all([
        fetch('/api/production-orders'),
        fetch('/api/outsource-orders'),
        fetch('/api/suppliers'),
      ]);

      const [prodData, outData, supData] = await Promise.all([
        prodRes.json(),
        outRes.json(),
        supRes.json(),
      ]);

      if (prodData.success) setProductionOrders(prodData.data);
      if (outData.success) setOutsourceOrders(outData.data);
      if (supData.success) setSuppliers(supData.data.filter((s: any) => s.status === 'active'));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOutsource = async (order: ProductionOrder) => {
    setSelectedOrder(order);
    setOutsourceForm({
      supplier_id: '',
      unit_price: 0,
      plan_end_date: order.plan_end_date,
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleConfirmOutsource = async () => {
    if (!outsourceForm.supplier_id) {
      alert('请选择供应商');
      return;
    }

    try {
      const response = await fetch('/api/outsource-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: outsourceForm.supplier_id,
          production_order_id: selectedOrder.id,
          style_no: selectedOrder.style_no,
          style_name: selectedOrder.style_name,
          color: selectedOrder.color,
          size: selectedOrder.size,
          quantity: selectedOrder.quantity,
          unit_price: outsourceForm.unit_price,
          plan_end_date: outsourceForm.plan_end_date,
          notes: outsourceForm.notes,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setDialogOpen(false);
        fetchData();
        alert('外发订单已创建！');
      } else {
        alert(result.error || '创建失败');
      }
    } catch (error) {
      alert('创建失败');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('确定要取消此订单吗？')) return;

    try {
      const response = await fetch('/api/production-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          status: 'cancelled',
        }),
      });

      const result = await response.json();
      if (result.success) {
        fetchData();
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  const handleRestoreOrder = async (order: ProductionOrder) => {
    if (!confirm('确定要恢复此订单吗？')) return;

    try {
      const response = await fetch('/api/production-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: order.id,
          status: 'pending',
        }),
      });

      const result = await response.json();
      if (result.success) {
        fetchData();
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  // 筛选
  const filteredOrders = productionOrders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchText && !o.order_no.includes(searchText) && !o.style_no.includes(searchText)) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            订单管理
          </h1>
          <p className="text-gray-500 text-sm">管理生产订单和外发分配</p>
        </div>
      </div>

      <Tabs defaultValue="production">
        <TabsList>
          <TabsTrigger value="production">生产订单</TabsTrigger>
          <TabsTrigger value="outsource">外发订单</TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="space-y-4">
          {/* 筛选 */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索订单号/款号..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-48"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {Object.entries(orderStatusMap).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 订单列表 */}
          <Card>
            <CardContent className="pt-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">加载中...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>订单号</TableHead>
                      <TableHead>款号</TableHead>
                      <TableHead>款式名称</TableHead>
                      <TableHead>颜色/尺码</TableHead>
                      <TableHead>数量</TableHead>
                      <TableHead>完成数</TableHead>
                      <TableHead>交期</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.order_no}</TableCell>
                        <TableCell className="font-bold">{order.style_no}</TableCell>
                        <TableCell>{order.style_name}</TableCell>
                        <TableCell>{order.color}/{order.size}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>{order.completed_quantity || 0}</TableCell>
                        <TableCell>{order.plan_end_date}</TableCell>
                        <TableCell>
                          <Badge className={orderStatusMap[order.status]?.color}>
                            {orderStatusMap[order.status]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {['pending', 'confirmed'].includes(order.status) && (
                              <>
                                <Button 
                                  size="sm"
                                  onClick={() => handleOutsource(order)}
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  外发
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleCancelOrder(order.id)}
                                >
                                  取消
                                </Button>
                              </>
                            )}
                            {order.status === 'cancelled' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRestoreOrder(order)}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                恢复
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
        </TabsContent>

        <TabsContent value="outsource" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>外发单号</TableHead>
                    <TableHead>供应商</TableHead>
                    <TableHead>款号</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outsourceOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">{order.order_no}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4 text-blue-500" />
                          {order.supplier?.name}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{order.style_no}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>¥{order.total_amount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={outsourceStatusMap[order.status]?.color}>
                          {outsourceStatusMap[order.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 外发弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              外发订单
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>订单号: {selectedOrder.order_no}</div>
                <div>款号: {selectedOrder.style_no}</div>
                <div>数量: {selectedOrder.quantity}</div>
                <div>交期: {selectedOrder.plan_end_date}</div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>选择供应商 *</Label>
              <Select 
                value={outsourceForm.supplier_id} 
                onValueChange={(v) => setOutsourceForm({ ...outsourceForm, supplier_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择供应商" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>单价</Label>
                <Input
                  type="number"
                  value={outsourceForm.unit_price}
                  onChange={(e) => setOutsourceForm({ ...outsourceForm, unit_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>交期</Label>
                <Input
                  type="date"
                  value={outsourceForm.plan_end_date}
                  onChange={(e) => setOutsourceForm({ ...outsourceForm, plan_end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>备注</Label>
              <Input
                value={outsourceForm.notes}
                onChange={(e) => setOutsourceForm({ ...outsourceForm, notes: e.target.value })}
                placeholder="备注信息"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmOutsource}>
              确认外发
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
