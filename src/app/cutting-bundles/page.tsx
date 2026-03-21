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
  FileText,
  Layers,
  AlertCircle,
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
  size_breakdown?: Record<string, number>;
  bed_number?: number;
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

  // 选中的裁床单
  const [selectedCuttingOrder, setSelectedCuttingOrder] = useState<CuttingOrder | null>(null);
  
  // 分扎数据 - 每个尺码单独配置
  const [bundleConfig, setBundleConfig] = useState<{
    size: string;
    color: string;
    orderQty: number;
    piecesPerBundle: number;  // 每扎件数
    bundleCount: number;       // 扎数
  }[]>([]);

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
      const res = await fetch('/api/cutting-orders?pageSize=100');
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

  // 选择裁床单后初始化分扎配置
  const handleSelectCuttingOrder = (orderId: string) => {
    const order = cuttingOrders.find(o => o.id === orderId);
    if (!order) return;
    
    setSelectedCuttingOrder(order);
    
    // 根据尺码明细初始化分扎配置
    const sizeBreakdown = order.size_breakdown || { 'M': order.quantity };
    
    const config = Object.entries(sizeBreakdown).map(([size, qty]) => ({
      size,
      color: order.color,
      orderQty: qty as number,
      piecesPerBundle: 50,  // 默认每扎50件
      bundleCount: Math.ceil((qty as number) / 50),
    }));
    
    setBundleConfig(config);
  };

  // 更新分扎配置
  const updateBundleConfig = (index: number, field: string, value: number) => {
    const newConfig = [...bundleConfig];
    newConfig[index] = {
      ...newConfig[index],
      [field]: value,
    };
    
    // 如果修改了每扎件数，自动计算扎数
    if (field === 'piecesPerBundle' && value > 0) {
      newConfig[index].bundleCount = Math.ceil(newConfig[index].orderQty / value);
    }
    
    // 如果修改了扎数，自动计算每扎件数
    if (field === 'bundleCount' && value > 0) {
      newConfig[index].piecesPerBundle = Math.ceil(newConfig[index].orderQty / value);
    }
    
    setBundleConfig(newConfig);
  };

  const handleCreateBundles = async () => {
    if (!selectedCuttingOrder) return;
    
    try {
      // 构建分扎数据
      const bundles = bundleConfig.map(config => ({
        size: config.size,
        color: config.color,
        quantity: config.piecesPerBundle,
        bundle_count: config.bundleCount,
      })).filter(b => b.bundle_count > 0);

      const res = await fetch('/api/cutting-bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cutting_order_id: selectedCuttingOrder.id,
          bundles,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setCreateDialogOpen(false);
        setSelectedCuttingOrder(null);
        setBundleConfig([]);
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

  const handlePrintTickets = () => {
    if (!selectedBundle) return;
    
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

  // 计算分扎汇总
  const totalBundles = bundleConfig.reduce((sum, c) => sum + c.bundleCount, 0);
  const totalPieces = bundleConfig.reduce((sum, c) => sum + c.orderQty, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            裁床分扎管理
          </h1>
          <p className="text-gray-500 mt-1">按尺码分扎，每扎独立管理，带二维码追溯</p>
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
              {bundles.reduce((sum, b) => sum + b.quantity, 0)}
            </div>
            <div className="text-sm text-gray-500">总件数</div>
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
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="选择裁床单" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部裁床单</SelectItem>
                {cuttingOrders.map(order => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.order_no} - {order.style_no}
                    {order.bed_number && ` (第${order.bed_number}床)`}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              创建分扎
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* 选择裁床单 */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">选择裁床单 *</Label>
              <Select 
                value={selectedCuttingOrder?.id || ''} 
                onValueChange={handleSelectCuttingOrder}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择裁床单" />
                </SelectTrigger>
                <SelectContent>
                  {cuttingOrders.map(order => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.order_no} - {order.style_no} ({order.color})
                      {order.bed_number && ` - 第${order.bed_number}床`}
                      - {order.quantity}件
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCuttingOrder && (
              <>
                {/* 裁床单信息 */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">裁床单号：</span>
                        <span className="font-medium">{selectedCuttingOrder.order_no}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">款号：</span>
                        <span className="font-medium">{selectedCuttingOrder.style_no}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">颜色：</span>
                        <span className="font-medium">{selectedCuttingOrder.color}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">总数量：</span>
                        <span className="font-bold">{selectedCuttingOrder.quantity}</span> 件
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 分扎配置 */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">分扎配置（每码可自定义）</Label>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>尺码</TableHead>
                        <TableHead>颜色</TableHead>
                        <TableHead className="text-right">订单数量</TableHead>
                        <TableHead className="text-right">每扎件数</TableHead>
                        <TableHead className="text-right">扎数</TableHead>
                        <TableHead className="text-right">实际分扎件数</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bundleConfig.map((config, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{config.size}</TableCell>
                          <TableCell>{config.color}</TableCell>
                          <TableCell className="text-right">{config.orderQty}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="1"
                              value={config.piecesPerBundle}
                              onChange={(e) => updateBundleConfig(index, 'piecesPerBundle', parseInt(e.target.value) || 1)}
                              className="w-20 ml-auto text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="1"
                              value={config.bundleCount}
                              onChange={(e) => updateBundleConfig(index, 'bundleCount', parseInt(e.target.value) || 1)}
                              className="w-16 ml-auto text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={config.piecesPerBundle * config.bundleCount >= config.orderQty ? 'text-green-600' : 'text-orange-500'}>
                              {config.piecesPerBundle * config.bundleCount}
                            </span>
                            {config.piecesPerBundle * config.bundleCount < config.orderQty && (
                              <span className="text-orange-500 text-xs ml-1">
                                (少{config.orderQty - config.piecesPerBundle * config.bundleCount})
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-50 font-bold">
                        <TableCell>合计</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">{totalPieces}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">{totalBundles}</TableCell>
                        <TableCell className="text-right">
                          {bundleConfig.reduce((sum, c) => sum + c.piecesPerBundle * c.bundleCount, 0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>提示：每扎件数 × 扎数 应等于或略大于订单数量，剩余部分将合并到最后一扎</span>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setCreateDialogOpen(false);
                setSelectedCuttingOrder(null);
                setBundleConfig([]);
              }}>
                取消
              </Button>
              <Button 
                onClick={handleCreateBundles}
                disabled={!selectedCuttingOrder || bundleConfig.length === 0 || totalBundles === 0}
              >
                创建分扎 ({totalBundles}扎)
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
