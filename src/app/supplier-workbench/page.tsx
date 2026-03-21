'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Factory,
  Package,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  ArrowRight,
  Play,
  LogOut,
  Building2,
} from 'lucide-react';

interface OutsourceOrder {
  id: string;
  order_no: string;
  style_no: string;
  style_name: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  plan_start_date: string;
  plan_end_date: string;
  notes: string;
  supplier: any;
}

interface Progress {
  id: string;
  stage: string;
  stage_name: string;
  quantity: number;
  completed_qty: number;
  status: string;
  start_date: string;
  end_date: string;
  notes: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待接单', color: 'bg-yellow-100 text-yellow-800' },
  accepted: { label: '已接单', color: 'bg-blue-100 text-blue-800' },
  in_production: { label: '生产中', color: 'bg-indigo-100 text-indigo-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  rejected: { label: '已拒绝', color: 'bg-red-100 text-red-800' },
};

const stageOrder = ['production_prep', 'cutting', 'craft', 'workshop', 'finishing', 'shipping'];

export default function SupplierWorkbenchPage() {
  const router = useRouter();
  const [supplierInfo, setSupplierInfo] = useState<any>(null);
  const [orders, setOrders] = useState<OutsourceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OutsourceOrder | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);

  useEffect(() => {
    // 检查登录状态
    const supplierInfoStr = localStorage.getItem('supplier_info');
    const userType = localStorage.getItem('user_type');
    
    if (!supplierInfoStr || userType !== 'supplier') {
      router.push('/login');
      return;
    }

    setSupplierInfo(JSON.parse(supplierInfoStr));
  }, [router]);

  useEffect(() => {
    if (supplierInfo) {
      fetchOrders();
    }
  }, [supplierInfo]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/outsource-orders?supplier_id=${supplierInfo.id}`);
      const result = await response.json();
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const response = await fetch('/api/outsource-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: 'accepted' }),
      });

      const result = await response.json();
      if (result.success) {
        fetchOrders();
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!confirm('确定要拒绝此订单吗？')) return;

    try {
      const response = await fetch('/api/outsource-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: 'rejected' }),
      });

      const result = await response.json();
      if (result.success) {
        fetchOrders();
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  const handleViewProgress = async (order: OutsourceOrder) => {
    setSelectedOrder(order);
    try {
      const response = await fetch(`/api/outsource-progress?outsource_order_id=${order.id}`);
      const result = await response.json();
      if (result.success) {
        // 按阶段顺序排序
        const sorted = stageOrder.map(stage => 
          result.data.find((p: Progress) => p.stage === stage)
        ).filter(Boolean);
        setProgress(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
    setProgressDialogOpen(true);
  };

  const handleUpdateProgress = async (progressId: string, status: string, orderId: string) => {
    try {
      const response = await fetch('/api/outsource-progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: progressId, 
          status,
          outsource_order_id: orderId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        // 刷新进度
        handleViewProgress(selectedOrder!);
        fetchOrders();
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('supplier_info');
    localStorage.removeItem('user_type');
    router.push('/login');
  };

  // 统计数据
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const acceptedCount = orders.filter(o => o.status === 'accepted').length;
  const inProgressCount = orders.filter(o => o.status === 'in_production').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  if (!supplierInfo) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
              <Factory className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">供应商工作台</h1>
              <p className="text-sm text-gray-500">{supplierInfo.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {supplierInfo.code}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              退出
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{pendingCount}</div>
                  <div className="text-sm text-gray-500">待接单</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{acceptedCount}</div>
                  <div className="text-sm text-gray-500">已接单</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Play className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{inProgressCount}</div>
                  <div className="text-sm text-gray-500">生产中</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{completedCount}</div>
                  <div className="text-sm text-gray-500">已完成</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 订单列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              外发订单
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">加载中...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无订单</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单号</TableHead>
                    <TableHead>款号</TableHead>
                    <TableHead>款式名称</TableHead>
                    <TableHead>颜色/尺码</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>交期</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">{order.order_no}</TableCell>
                      <TableCell className="font-bold">{order.style_no}</TableCell>
                      <TableCell>{order.style_name}</TableCell>
                      <TableCell>{order.color}/{order.size}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>¥{order.total_amount?.toLocaleString()}</TableCell>
                      <TableCell>{order.plan_end_date}</TableCell>
                      <TableCell>
                        <Badge className={statusMap[order.status]?.color}>
                          {statusMap[order.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {order.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleAcceptOrder(order.id)}
                              >
                                接单
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRejectOrder(order.id)}
                              >
                                拒绝
                              </Button>
                            </>
                          )}
                          {order.status !== 'pending' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewProgress(order)}
                            >
                              进度管理
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
      </div>

      {/* 进度管理弹窗 */}
      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              生产进度管理
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">订单号：</span>
                  <span className="font-mono">{selectedOrder.order_no}</span>
                </div>
                <div>
                  <span className="text-gray-500">款号：</span>
                  <span className="font-bold">{selectedOrder.style_no}</span>
                </div>
                <div>
                  <span className="text-gray-500">数量：</span>
                  <span>{selectedOrder.quantity}</span>
                </div>
                <div>
                  <span className="text-gray-500">交期：</span>
                  <span>{selectedOrder.plan_end_date}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {progress.map((p, index) => {
              const isCurrent = p.status === 'in_progress';
              const isCompleted = p.status === 'completed';
              const prevCompleted = index === 0 || progress[index - 1]?.status === 'completed';
              const canStart = prevCompleted && p.status === 'pending';

              return (
                <div 
                  key={p.id} 
                  className={`p-4 border rounded-lg ${isCompleted ? 'bg-green-50 border-green-200' : isCurrent ? 'bg-blue-50 border-blue-200' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-200'
                      }`}>
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{p.stage_name}</div>
                        <div className="text-sm text-gray-500">
                          {isCompleted ? `完成时间: ${p.end_date}` : isCurrent ? '进行中' : '待开始'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.status === 'pending' && (
                        <Badge variant="outline">待开始</Badge>
                      )}
                      {p.status === 'in_progress' && (
                        <>
                          <Badge className="bg-blue-100 text-blue-800">进行中</Badge>
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateProgress(p.id, 'completed', selectedOrder!.id)}
                          >
                            完成此阶段
                          </Button>
                        </>
                      )}
                      {p.status === 'completed' && (
                        <Badge className="bg-green-100 text-green-800">已完成</Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProgressDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
