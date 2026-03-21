'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  QrCode, 
  Printer, 
  Package, 
  Plus, 
  Trash2, 
  Scissors,
  Search,
  FileText
} from 'lucide-react';

interface CuttingBundle {
  id: string;
  bundle_no: string;
  size: string;
  color: string;
  quantity: number;
  status: string;
  qr_code: string;
  current_process_id?: string;
  created_at: string;
  cutting_orders?: {
    order_no: string;
    style_no: string;
    color: string;
  };
}

interface CuttingOrder {
  id: string;
  order_no: string;
  style_no: string;
  color: string;
  quantity: number;
}

interface Process {
  id: string;
  name: string;
  code: string;
  category: string;
}

export default function CuttingBundlesPage() {
  const [bundles, setBundles] = useState<CuttingBundle[]>([]);
  const [cuttingOrders, setCuttingOrders] = useState<CuttingOrder[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<CuttingBundle | null>(null);
  const [printQuantity, setPrintQuantity] = useState(1);

  // 分扎表单
  const [bundleForm, setBundleForm] = useState({
    cutting_order_id: '',
    size: '',
    color: '',
    quantity: 50,
    bundle_count: 1,
  });
  const [bundleSizes, setBundleSizes] = useState<{ size: string; color: string; quantity: number; bundle_count: number }[]>([]);

  useEffect(() => {
    fetchBundles();
    fetchCuttingOrders();
    fetchProcesses();
  }, [selectedOrderId, filterStatus]);

  const fetchBundles = async () => {
    setLoading(true);
    try {
      let url = '/api/cutting-bundles?';
      if (selectedOrderId) url += `cutting_order_id=${selectedOrderId}&`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setBundles(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch bundles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCuttingOrders = async () => {
    try {
      const res = await fetch('/api/cutting-orders');
      const data = await res.json();
      if (data.success) {
        setCuttingOrders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch cutting orders:', error);
    }
  };

  const fetchProcesses = async () => {
    try {
      const res = await fetch('/api/processes');
      const data = await res.json();
      if (data.success) {
        setProcesses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch processes:', error);
    }
  };

  const handleCreateBundles = async () => {
    try {
      const res = await fetch('/api/cutting-bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cutting_order_id: bundleForm.cutting_order_id,
          bundles: bundleSizes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setCreateDialogOpen(false);
        setBundleSizes([]);
        fetchBundles();
      } else {
        alert(data.error || '创建失败');
      }
    } catch (error) {
      alert('创建失败');
    }
  };

  const handleDeleteBundle = async (id: string) => {
    if (!confirm('确定要删除此分扎吗？')) return;

    try {
      const res = await fetch(`/api/cutting-bundles?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchBundles();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleAddSize = () => {
    if (!bundleForm.size || bundleForm.quantity <= 0) {
      alert('请填写尺码和数量');
      return;
    }
    setBundleSizes([
      ...bundleSizes,
      {
        size: bundleForm.size,
        color: bundleForm.color,
        quantity: bundleForm.quantity,
        bundle_count: bundleForm.bundle_count,
      },
    ]);
    setBundleForm({ ...bundleForm, size: '', quantity: 50, bundle_count: 1 });
  };

  const handlePrintTickets = () => {
    if (!selectedBundle) return;
    
    // 生成打印内容
    const printContent = generatePrintContent(selectedBundle, printQuantity);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
    
    setPrintDialogOpen(false);
  };

  const generatePrintContent = (bundle: CuttingBundle, count: number) => {
    const tickets = [];
    for (let i = 0; i < count; i++) {
      tickets.push(`
        <div class="ticket" style="width: 8cm; height: 5cm; border: 2px solid #000; padding: 8px; margin: 5mm; display: inline-block; font-family: Arial, sans-serif;">
          <div style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
            <h2 style="margin: 0; font-size: 14px;">工票 / 扎票</h2>
          </div>
          <div style="font-size: 12px; line-height: 1.6;">
            <div><strong>扎号：</strong>${bundle.bundle_no}</div>
            <div><strong>款号：</strong>${bundle.cutting_orders?.style_no || '-'}</div>
            <div><strong>颜色：</strong>${bundle.color}</div>
            <div><strong>尺码：</strong>${bundle.size}</div>
            <div><strong>数量：</strong>${bundle.quantity} 件</div>
            <div><strong>工序：</strong>_____________</div>
            <div><strong>员工：</strong>_____________</div>
          </div>
          <div style="text-align: center; margin-top: 8px;">
            <div style="font-family: 'Courier New', monospace; font-size: 10px; background: #f0f0f0; padding: 5px;">
              ${bundle.qr_code}
            </div>
          </div>
        </div>
      `);
    }
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>工票打印 - ${bundle.bundle_no}</title>
        <style>
          @media print {
            body { margin: 0; }
            @page { size: auto; margin: 5mm; }
          }
        </style>
      </head>
      <body>
        ${tickets.join('')}
      </body>
      </html>
    `;
  };

  const filteredBundles = bundles.filter(bundle => {
    const matchesSearch = 
      bundle.bundle_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bundle.cutting_orders?.style_no?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bundle.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: '待处理', className: 'bg-gray-100 text-gray-800' },
      in_progress: { label: '生产中', className: 'bg-blue-100 text-blue-800' },
      completed: { label: '已完成', className: 'bg-green-100 text-green-800' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            裁床分扎管理
          </h1>
          <p className="text-gray-500 mt-1">管理裁床分扎、打印工票</p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            创建分扎
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{bundles.length}</div>
            <div className="text-sm text-gray-500">总分扎数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {bundles.filter(b => b.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-500">待处理</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {bundles.filter(b => b.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-500">生产中</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {bundles.filter(b => b.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-500">已完成</div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索扎号、款号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="选择裁床单" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部裁床单</SelectItem>
                {cuttingOrders.map(order => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.order_no} - {order.style_no}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="in_progress">生产中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 分扎列表 */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>扎号</TableHead>
                <TableHead>款号</TableHead>
                <TableHead>颜色</TableHead>
                <TableHead>尺码</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredBundles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredBundles.map((bundle) => (
                  <TableRow key={bundle.id}>
                    <TableCell className="font-mono font-bold">{bundle.bundle_no}</TableCell>
                    <TableCell>{bundle.cutting_orders?.style_no || '-'}</TableCell>
                    <TableCell>{bundle.color}</TableCell>
                    <TableCell>{bundle.size}</TableCell>
                    <TableCell>{bundle.quantity}</TableCell>
                    <TableCell>{getStatusBadge(bundle.status)}</TableCell>
                    <TableCell>{new Date(bundle.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedBundle(bundle);
                            setPrintDialogOpen(true);
                          }}
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          打菲
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `/process-tracking?bundle_no=${bundle.bundle_no}`}
                        >
                          <QrCode className="h-4 w-4 mr-1" />
                          追溯
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteBundle(bundle.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 创建分扎对话框 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5" />
              创建分扎
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>选择裁床单</Label>
                <Select 
                  value={bundleForm.cutting_order_id} 
                  onValueChange={(value) => {
                    const order = cuttingOrders.find(o => o.id === value);
                    setBundleForm({ 
                      ...bundleForm, 
                      cutting_order_id: value,
                      color: order?.color || ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择裁床单" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuttingOrders.map(order => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.order_no} - {order.style_no}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">添加尺码分扎</h4>
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label>尺码</Label>
                  <Input 
                    value={bundleForm.size}
                    onChange={(e) => setBundleForm({ ...bundleForm, size: e.target.value })}
                    placeholder="如: M"
                  />
                </div>
                <div className="space-y-2">
                  <Label>颜色</Label>
                  <Input 
                    value={bundleForm.color}
                    onChange={(e) => setBundleForm({ ...bundleForm, color: e.target.value })}
                    placeholder="颜色"
                  />
                </div>
                <div className="space-y-2">
                  <Label>每扎数量</Label>
                  <Input 
                    type="number"
                    value={bundleForm.quantity}
                    onChange={(e) => setBundleForm({ ...bundleForm, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>扎数</Label>
                  <Input 
                    type="number"
                    value={bundleForm.bundle_count}
                    onChange={(e) => setBundleForm({ ...bundleForm, bundle_count: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <Button onClick={handleAddSize} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                添加
              </Button>
            </div>

            {bundleSizes.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">待创建分扎列表</h4>
                <div className="space-y-2">
                  {bundleSizes.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>{item.size} - {item.color} - {item.quantity}件 × {item.bundle_count}扎</span>
                      <span className="text-sm text-gray-500">
                        共 {item.quantity * item.bundle_count} 件
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t text-right font-medium">
                  总计: {bundleSizes.reduce((sum, item) => sum + item.quantity * item.bundle_count, 0)} 件，
                  {bundleSizes.reduce((sum, item) => sum + item.bundle_count, 0)} 扎
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                取消
              </Button>
              <Button 
                onClick={handleCreateBundles}
                disabled={!bundleForm.cutting_order_id || bundleSizes.length === 0}
              >
                创建分扎
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 打菲对话框 */}
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              打菲（打印工票）
            </DialogTitle>
          </DialogHeader>
          
          {selectedBundle && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>扎号：</strong>{selectedBundle.bundle_no}</div>
                  <div><strong>数量：</strong>{selectedBundle.quantity}件</div>
                  <div><strong>颜色：</strong>{selectedBundle.color}</div>
                  <div><strong>尺码：</strong>{selectedBundle.size}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>打印数量</Label>
                <Input 
                  type="number"
                  value={printQuantity}
                  onChange={(e) => setPrintQuantity(parseInt(e.target.value) || 1)}
                  min={1}
                  max={20}
                />
                <p className="text-sm text-gray-500">建议每扎打印1-3张工票</p>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setPrintDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handlePrintTickets}>
                  <Printer className="h-4 w-4 mr-2" />
                  打印
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
