'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import PrintTicketsDialog from '@/components/print-tickets-dialog';
import { ExportButton } from '@/components/export-button';
import { getColorValue } from '@/lib/color-utils';
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
  Send,
  Building2,
  Download,
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
  cutting_order_id?: string;
  created_at: string;
  cutting_orders?: {
    order_no: string;
    style_no: string;
    color: string;
    bed_number?: number;
    total_beds?: number;
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

interface Supplier {
  id: string;
  code: string;
  name: string;
  type: string;
  supplier_level: number;
  contact: string;
  phone: string;
}

export default function CuttingBundlesPage() {
  const [bundles, setBundles] = useState<CuttingBundle[]>([]);
  const [cuttingOrders, setCuttingOrders] = useState<CuttingOrder[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [outsourceDialogOpen, setOutsourceDialogOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<CuttingBundle | null>(null);
  
  // 批量打印相关状态
  const [batchPrintOpen, setBatchPrintOpen] = useState(false);
  const [selectedBundleIds, setSelectedBundleIds] = useState<string[]>([]);
  const [craftProcesses, setCraftProcesses] = useState<any[]>([]);
  
  // 外发表单
  const [outsourceForm, setOutsourceForm] = useState({
    supplier_id: '',
    supplier_level: 1,
    quantity: 0,
    process_type: '',
    process_name: '',
    send_date: new Date().toISOString().split('T')[0],
    expected_return_date: '',
    unit_price: 0,
    notes: '',
  });
  const [printQuantity, setPrintQuantity] = useState(1);

  // 选中的裁床单
  const [selectedCuttingOrder, setSelectedCuttingOrder] = useState<CuttingOrder | null>(null);
  
  // 新建裁床单模式
  const [createNewCuttingOrder, setCreateNewCuttingOrder] = useState(false);
  const [newCuttingOrderForm, setNewCuttingOrderForm] = useState({
    style_no: '',
    color: '',
    quantity: 0,
    size_breakdown: '',
    cutting_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  
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
    fetchSuppliers();
    fetchCraftProcesses();
  }, [selectedOrderId, filterStatus]);

  // 获取二次工艺信息
  const fetchCraftProcesses = async () => {
    try {
      const res = await fetch('/api/craft-processes?pageSize=200');
      const data = await res.json();
      if (data.success) {
        setCraftProcesses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch craft processes:', error);
    }
  };

  const fetchBundles = async () => {
    setLoading(true);
    try {
      let url = '/api/cutting-bundles?';
      if (selectedOrderId && selectedOrderId !== 'all') {
        url += `cutting_order_id=${selectedOrderId}&`;
      }
      
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

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers?status=approved&pageSize=100');
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
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
    setCreateNewCuttingOrder(false);
    
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

  // 初始化新裁床单的分扎配置
  const initNewCuttingOrderBundles = () => {
    // 解析尺码明细 (格式: "S:100,M:200,L:150")
    const sizeBreakdown: Record<string, number> = {};
    if (newCuttingOrderForm.size_breakdown) {
      newCuttingOrderForm.size_breakdown.split(',').forEach(item => {
        const [size, qty] = item.trim().split(':');
        if (size && qty) {
          sizeBreakdown[size.trim()] = parseInt(qty.trim()) || 0;
        }
      });
    }
    
    // 如果没有填写尺码明细，使用总数量
    if (Object.keys(sizeBreakdown).length === 0 && newCuttingOrderForm.quantity > 0) {
      sizeBreakdown['均码'] = newCuttingOrderForm.quantity;
    }
    
    const config = Object.entries(sizeBreakdown).map(([size, qty]) => ({
      size,
      color: newCuttingOrderForm.color,
      orderQty: qty,
      piecesPerBundle: 50,
      bundleCount: Math.ceil(qty / 50),
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
    // 如果是新建裁床单模式
    if (createNewCuttingOrder) {
      if (!newCuttingOrderForm.style_no || !newCuttingOrderForm.color || !newCuttingOrderForm.quantity) {
        alert('请填写完整的裁床单信息');
        return;
      }
      
      try {
        // 1. 先创建裁床单
        const cuttingOrderRes = await fetch('/api/cutting-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            style_no: newCuttingOrderForm.style_no,
            color: newCuttingOrderForm.color,
            cutting_qty: newCuttingOrderForm.quantity,
            size_breakdown: newCuttingOrderForm.size_breakdown 
              ? Object.fromEntries(newCuttingOrderForm.size_breakdown.split(',').map(item => {
                  const [size, qty] = item.trim().split(':');
                  return [size.trim(), parseInt(qty.trim()) || 0];
                }))
              : { '均码': newCuttingOrderForm.quantity },
            cutting_date: newCuttingOrderForm.cutting_date,
            notes: newCuttingOrderForm.notes,
          }),
        });
        
        const cuttingOrderData = await cuttingOrderRes.json();
        if (!cuttingOrderData.success) {
          alert(cuttingOrderData.error || '创建裁床单失败');
          return;
        }
        
        const newCuttingOrderId = cuttingOrderData.data.id;
        
        // 2. 创建分扎
        const bundles = bundleConfig.map(config => ({
          size: config.size,
          color: config.color,
          quantity: config.piecesPerBundle,
          bundle_count: config.bundleCount,
        })).filter(b => b.bundle_count > 0);
        
        const bundleRes = await fetch('/api/cutting-bundles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cutting_order_id: newCuttingOrderId,
            bundles,
          }),
        });
        
        const bundleData = await bundleRes.json();
        if (bundleData.success) {
          alert(`裁床单 ${cuttingOrderData.data.order_no} 创建成功，${bundleData.message}`);
          setCreateDialogOpen(false);
          setCreateNewCuttingOrder(false);
          setNewCuttingOrderForm({
            style_no: '',
            color: '',
            quantity: 0,
            size_breakdown: '',
            cutting_date: new Date().toISOString().split('T')[0],
            notes: '',
          });
          setBundleConfig([]);
          fetchBundles();
          fetchCuttingOrders();
        } else {
          alert(bundleData.error || '创建分扎失败');
        }
      } catch (error) {
        alert('创建失败');
      }
      return;
    }
    
    // 已有裁床单模式
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

  const handleOpenOutsource = (bundle: CuttingBundle) => {
    setSelectedBundle(bundle);
    setOutsourceForm({
      supplier_id: '',
      supplier_level: 1,
      quantity: bundle.quantity,
      process_type: '',
      process_name: '',
      send_date: new Date().toISOString().split('T')[0],
      expected_return_date: '',
      unit_price: 0,
      notes: '',
    });
    setOutsourceDialogOpen(true);
  };

  const handleOutsource = async () => {
    if (!selectedBundle) return;
    if (!outsourceForm.supplier_id) {
      alert('请选择供应商');
      return;
    }
    if (!outsourceForm.process_type) {
      alert('请选择外发工序');
      return;
    }

    try {
      const res = await fetch('/api/bundle-outsource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundle_id: selectedBundle.id,
          cutting_order_id: selectedBundle.cutting_order_id,
          ...outsourceForm,
          style_no: selectedBundle.cutting_orders?.style_no,
          size: selectedBundle.size,
          color: selectedBundle.color,
          process_name: outsourceForm.process_type === 'sewing' ? '缝制' :
                        outsourceForm.process_type === 'embroidery' ? '刺绣' :
                        outsourceForm.process_type === 'printing' ? '印花' :
                        outsourceForm.process_type === 'washing' ? '水洗' : '其他',
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('外发成功！');
        setOutsourceDialogOpen(false);
        fetchBundles();
      } else {
        alert(data.error || '外发失败');
      }
    } catch (error) {
      alert('外发失败');
    }
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
      outsourced: { label: '外发中', className: 'bg-orange-100 text-orange-800' },
      completed: { label: '已完成', className: 'bg-green-100 text-green-800' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge className={className}>{label}</Badge>;
  };

  // 批量选择功能
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBundleIds(filteredBundles.map(b => b.id));
    } else {
      setSelectedBundleIds([]);
    }
  };

  const handleSelectBundle = (bundleId: string, checked: boolean) => {
    if (checked) {
      setSelectedBundleIds(prev => [...prev, bundleId]);
    } else {
      setSelectedBundleIds(prev => prev.filter(id => id !== bundleId));
    }
  };

  // 批量打印
  const handleBatchPrint = () => {
    if (selectedBundleIds.length === 0) {
      alert('请先选择要打印的扎包');
      return;
    }
    setBatchPrintOpen(true);
  };

  // 获取选中的扎包用于打印
  const getSelectedBundlesForPrint = () => {
    return bundles.filter(b => selectedBundleIds.includes(b.id));
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
          <ExportButton dataType="cutting_bundles" />
          <Button 
            variant="outline"
            onClick={handleBatchPrint}
            disabled={selectedBundleIds.length === 0}
          >
            <Printer className="h-4 w-4 mr-2" />
            批量打菲 ({selectedBundleIds.length})
          </Button>
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
                <SelectItem value="all">全部裁床单</SelectItem>
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
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedBundleIds.length === filteredBundles.length && filteredBundles.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
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
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredBundles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredBundles.map((bundle) => (
                  <TableRow key={bundle.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedBundleIds.includes(bundle.id)}
                        onCheckedChange={(checked) => handleSelectBundle(bundle.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-mono font-bold">{bundle.bundle_no}</TableCell>
                    <TableCell>{bundle.cutting_orders?.style_no || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: getColorValue(bundle.color) }}
                        />
                        <span className="font-medium">{bundle.color}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">{bundle.size}</TableCell>
                    <TableCell className="font-bold text-blue-600">{bundle.quantity}</TableCell>
                    <TableCell>{getStatusBadge(bundle.status)}</TableCell>
                    <TableCell>{new Date(bundle.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedBundleIds([bundle.id]);
                            setBatchPrintOpen(true);
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
                        {bundle.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleOpenOutsource(bundle)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            外发
                          </Button>
                        )}
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
      <Dialog open={createDialogOpen} onOpenChange={(open) => {
        setCreateDialogOpen(open);
        if (!open) {
          setCreateNewCuttingOrder(false);
          setSelectedCuttingOrder(null);
          setBundleConfig([]);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              创建分扎
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* 模式切换 */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <Button
                variant={!createNewCuttingOrder ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setCreateNewCuttingOrder(false);
                  setBundleConfig([]);
                }}
                className="flex-1"
              >
                选择已有裁床单
              </Button>
              <Button
                variant={createNewCuttingOrder ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setCreateNewCuttingOrder(true);
                  setSelectedCuttingOrder(null);
                  setBundleConfig([]);
                }}
                className="flex-1"
              >
                新建裁床单并分扎
              </Button>
            </div>

            {/* 选择已有裁床单模式 */}
            {!createNewCuttingOrder && (
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
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                            style={{ backgroundColor: getColorValue(order.color) }}
                          />
                          <span>{order.order_no} - {order.style_no} ({order.color})</span>
                          {order.bed_number && <span className="text-muted-foreground">- 第{order.bed_number}床</span>}
                          - <span className="font-bold">{order.quantity}件</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 新建裁床单模式 */}
            {createNewCuttingOrder && (
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">新建裁床单</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>款号 *</Label>
                      <Input
                        value={newCuttingOrderForm.style_no}
                        onChange={(e) => setNewCuttingOrderForm(prev => ({ ...prev, style_no: e.target.value }))}
                        placeholder="如: STYLE-2024-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>颜色 *</Label>
                      <Input
                        value={newCuttingOrderForm.color}
                        onChange={(e) => setNewCuttingOrderForm(prev => ({ ...prev, color: e.target.value }))}
                        placeholder="如: 黑色"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>总数量 *</Label>
                      <Input
                        type="number"
                        value={newCuttingOrderForm.quantity || ''}
                        onChange={(e) => setNewCuttingOrderForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                        placeholder="总件数"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>裁床日期</Label>
                      <Input
                        type="date"
                        value={newCuttingOrderForm.cutting_date}
                        onChange={(e) => setNewCuttingOrderForm(prev => ({ ...prev, cutting_date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>尺码明细（可选）</Label>
                    <Input
                      value={newCuttingOrderForm.size_breakdown}
                      onChange={(e) => setNewCuttingOrderForm(prev => ({ ...prev, size_breakdown: e.target.value }))}
                      placeholder="格式: S:50,M:100,L:80,XL:60"
                    />
                    <p className="text-xs text-muted-foreground">
                      不填写则按总数量生成均码
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>备注</Label>
                    <Input
                      value={newCuttingOrderForm.notes}
                      onChange={(e) => setNewCuttingOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="备注信息"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={initNewCuttingOrderBundles}
                    disabled={!newCuttingOrderForm.style_no || !newCuttingOrderForm.color || !newCuttingOrderForm.quantity}
                  >
                    生成预览分扎配置
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 分扎配置预览 */}
            {bundleConfig.length > 0 && (
              <>
                {/* 裁床单信息（已有模式） */}
                {selectedCuttingOrder && !createNewCuttingOrder && (
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
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-5 h-5 rounded-full border border-gray-200 shadow-sm"
                              style={{ backgroundColor: getColorValue(selectedCuttingOrder.color) }}
                            />
                            <span className="font-bold text-base">{selectedCuttingOrder.color}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">总数量：</span>
                          <span className="font-bold">{selectedCuttingOrder.quantity}</span> 件
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 分扎配置表格 */}
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
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-200"
                                style={{ backgroundColor: getColorValue(config.color) }}
                              />
                              <span className="font-medium">{config.color}</span>
                            </div>
                          </TableCell>
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

            {/* 底部按钮 */}
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
                disabled={bundleConfig.length === 0 || totalBundles === 0}
              >
                {createNewCuttingOrder ? '创建裁床单并分扎' : `创建分扎 (${totalBundles}扎)`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 批量打印对话框 */}
      <PrintTicketsDialog
        open={batchPrintOpen}
        onOpenChange={(open) => {
          setBatchPrintOpen(open);
          if (!open) {
            setSelectedBundleIds([]);
          }
        }}
        bundles={getSelectedBundlesForPrint()}
        craftProcesses={craftProcesses}
      />

      {/* 外发对话框 */}
      <Dialog open={outsourceDialogOpen} onOpenChange={setOutsourceDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              外发加工
            </DialogTitle>
          </DialogHeader>
          
          {selectedBundle && (
            <div className="space-y-4 py-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>扎号：</strong>{selectedBundle.bundle_no}</div>
                  <div><strong>数量：</strong>{selectedBundle.quantity}件</div>
                  <div><strong>颜色：</strong>{selectedBundle.color}</div>
                  <div><strong>尺码：</strong>{selectedBundle.size}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>供应商 *</Label>
                  <Select 
                    value={outsourceForm.supplier_id} 
                    onValueChange={(v) => setOutsourceForm({...outsourceForm, supplier_id: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择供应商" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.supplier_level}级)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>外发工序 *</Label>
                  <Select 
                    value={outsourceForm.process_type} 
                    onValueChange={(v) => setOutsourceForm({...outsourceForm, process_type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择工序" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sewing">缝制</SelectItem>
                      <SelectItem value="embroidery">刺绣</SelectItem>
                      <SelectItem value="printing">印花</SelectItem>
                      <SelectItem value="washing">水洗</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>外发数量</Label>
                  <Input 
                    type="number"
                    value={outsourceForm.quantity}
                    onChange={(e) => setOutsourceForm({...outsourceForm, quantity: parseInt(e.target.value) || 0})}
                    max={selectedBundle.quantity}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>单价 (元)</Label>
                  <Input 
                    type="number"
                    value={outsourceForm.unit_price}
                    onChange={(e) => setOutsourceForm({...outsourceForm, unit_price: parseFloat(e.target.value) || 0})}
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>发送日期</Label>
                  <Input 
                    type="date"
                    value={outsourceForm.send_date}
                    onChange={(e) => setOutsourceForm({...outsourceForm, send_date: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>预计回货日期</Label>
                  <Input 
                    type="date"
                    value={outsourceForm.expected_return_date}
                    onChange={(e) => setOutsourceForm({...outsourceForm, expected_return_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>备注</Label>
                <Textarea 
                  value={outsourceForm.notes}
                  onChange={(e) => setOutsourceForm({...outsourceForm, notes: e.target.value})}
                  placeholder="外发备注信息..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setOutsourceDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleOutsource}>
                  <Send className="h-4 w-4 mr-2" />
                  确认外发
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
