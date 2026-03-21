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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  Truck,
  Eye,
  Search,
  ArrowLeftRight,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

interface OutsourceRecord {
  id: string;
  outsource_no: string;
  bundle_id: string;
  cutting_order_id: string;
  supplier_id: string;
  supplier_level: number;
  quantity: number;
  process_type: string;
  process_name: string;
  send_date: string;
  expected_return_date: string | null;
  actual_return_date: string | null;
  unit_price: number;
  total_price: number;
  status: string;
  notes: string | null;
  style_no: string;
  size: string;
  color: string;
  created_at: string;
  suppliers: {
    id: string;
    name: string;
    level: number;
  };
  cutting_bundles: {
    bundle_no: string;
  };
}

export default function OutsourceTrackingPage() {
  const [records, setRecords] = useState<OutsourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<OutsourceRecord | null>(null);
  const [returnForm, setReturnForm] = useState({
    quantity: 0,
    quality: 'good',
    notes: '',
  });

  useEffect(() => {
    fetchRecords();
  }, [activeTab]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      let url = '/api/bundle-outsource?';
      if (activeTab !== 'all') {
        url += `status=${activeTab}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      pending: { label: '待发货', className: 'bg-gray-100 text-gray-800', icon: <Clock className="h-3 w-3" /> },
      shipped: { label: '已发货', className: 'bg-blue-100 text-blue-800', icon: <Truck className="h-3 w-3" /> },
      in_production: { label: '生产中', className: 'bg-yellow-100 text-yellow-800', icon: <Package className="h-3 w-3" /> },
      completed: { label: '已完成', className: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      delayed: { label: '延期', className: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-3 w-3" /> },
    };
    const { label, className, icon } = config[status] || config.pending;
    return (
      <Badge className={`${className} flex items-center gap-1`}>
        {icon}
        {label}
      </Badge>
    );
  };

  const getLevelBadge = (level: number) => {
    const className = level === 1 ? 'bg-yellow-100 text-yellow-800' :
                      level === 2 ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800';
    return <Badge className={className}>{level}级</Badge>;
  };

  const handleOpenDetail = (record: OutsourceRecord) => {
    setSelectedRecord(record);
    setDetailDialogOpen(true);
  };

  const handleOpenReturn = (record: OutsourceRecord) => {
    setSelectedRecord(record);
    setReturnForm({
      quantity: record.quantity,
      quality: 'good',
      notes: '',
    });
    setReturnDialogOpen(true);
  };

  const handleReturn = async () => {
    if (!selectedRecord) return;

    try {
      const res = await fetch('/api/bundle-outsource/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outsource_id: selectedRecord.id,
          bundle_id: selectedRecord.bundle_id,
          quantity: returnForm.quantity,
          quality: returnForm.quality,
          notes: returnForm.notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('回货登记成功！');
        setReturnDialogOpen(false);
        fetchRecords();
      } else {
        alert(data.error || '回货登记失败');
      }
    } catch (error) {
      alert('回货登记失败');
    }
  };

  const handleShip = async (record: OutsourceRecord) => {
    try {
      const res = await fetch('/api/bundle-outsource/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: record.id,
          status: 'shipped',
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchRecords();
      } else {
        alert(data.error || '状态更新失败');
      }
    } catch (error) {
      alert('状态更新失败');
    }
  };

  const filteredRecords = records.filter(r => 
    r.outsource_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.style_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.suppliers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 统计数据
  const stats = {
    total: records.length,
    pending: records.filter(r => r.status === 'pending').length,
    inProgress: records.filter(r => ['shipped', 'in_production'].includes(r.status)).length,
    completed: records.filter(r => r.status === 'completed').length,
    delayed: records.filter(r => r.status === 'delayed').length,
  };

  // 检查延期
  const checkDelayed = (record: OutsourceRecord) => {
    if (record.status === 'completed') return false;
    if (!record.expected_return_date) return false;
    return new Date(record.expected_return_date) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/cutting-bundles">
            <Button variant="outline" size="sm">
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              返回裁床管理
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">外发跟踪</h1>
            <p className="text-gray-500">跟踪裁片外发加工进度</p>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-500">总外发数</div>
              </div>
              <Send className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-sm text-gray-500">待发货</div>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <div className="text-sm text-gray-500">进行中</div>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-500">已完成</div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.delayed}</div>
                <div className="text-sm text-gray-500">延期</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主内容区 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>外发记录</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10 w-64"
                  placeholder="搜索单号/款号/供应商..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* 标签页 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="pending">待发货</TabsTrigger>
              <TabsTrigger value="shipped">已发货</TabsTrigger>
              <TabsTrigger value="in_production">生产中</TabsTrigger>
              <TabsTrigger value="completed">已完成</TabsTrigger>
              <TabsTrigger value="delayed">延期</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>外发单号</TableHead>
                <TableHead>扎号</TableHead>
                <TableHead>款号</TableHead>
                <TableHead>颜色/尺码</TableHead>
                <TableHead>供应商</TableHead>
                <TableHead>工序</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>发货日期</TableHead>
                <TableHead>预计回货</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                    暂无外发记录
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow 
                    key={record.id}
                    className={checkDelayed(record) ? 'bg-red-50' : ''}
                  >
                    <TableCell className="font-mono">{record.outsource_no}</TableCell>
                    <TableCell>{record.cutting_bundles?.bundle_no}</TableCell>
                    <TableCell className="font-medium">{record.style_no}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{record.color}</div>
                        <div className="text-gray-500">{record.size}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {record.suppliers?.name}
                        {record.suppliers?.level && getLevelBadge(record.suppliers.level)}
                      </div>
                    </TableCell>
                    <TableCell>{record.process_name}</TableCell>
                    <TableCell>{record.quantity}件</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>{record.send_date}</TableCell>
                    <TableCell>
                      {record.expected_return_date || '-'}
                      {checkDelayed(record) && (
                        <Badge className="ml-2 bg-red-500 text-white text-xs">超期</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDetail(record)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          详情
                        </Button>
                        {record.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleShip(record)}
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            发货
                          </Button>
                        )}
                        {['shipped', 'in_production'].includes(record.status) && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenReturn(record)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            回货
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>外发详情</DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><strong>外发单号：</strong>{selectedRecord.outsource_no}</div>
                  <div><strong>扎号：</strong>{selectedRecord.cutting_bundles?.bundle_no}</div>
                  <div><strong>款号：</strong>{selectedRecord.style_no}</div>
                  <div><strong>数量：</strong>{selectedRecord.quantity}件</div>
                  <div><strong>颜色：</strong>{selectedRecord.color}</div>
                  <div><strong>尺码：</strong>{selectedRecord.size}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">供应商</div>
                  <div className="flex items-center gap-2">
                    {selectedRecord.suppliers?.name}
                    {selectedRecord.suppliers?.level && getLevelBadge(selectedRecord.suppliers.level)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">工序</div>
                  <div>{selectedRecord.process_name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">单价</div>
                  <div>¥{selectedRecord.unit_price}/件</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">总价</div>
                  <div className="font-medium text-orange-600">¥{selectedRecord.total_price}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">发货日期</div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {selectedRecord.send_date}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">预计回货</div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {selectedRecord.expected_return_date || '-'}
                  </div>
                </div>
                {selectedRecord.actual_return_date && (
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">实际回货</div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {selectedRecord.actual_return_date}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-gray-500">状态</span>
                {getStatusBadge(selectedRecord.status)}
              </div>
              
              {selectedRecord.notes && (
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">备注</div>
                  <div className="text-sm bg-gray-50 p-3 rounded">{selectedRecord.notes}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 回货对话框 */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              回货登记
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-sm">
                  <strong>外发单号：</strong>{selectedRecord.outsource_no} | 
                  <strong> 外发数量：</strong>{selectedRecord.quantity}件
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>回货数量</Label>
                <Input
                  type="number"
                  value={returnForm.quantity}
                  onChange={(e) => setReturnForm({...returnForm, quantity: parseInt(e.target.value) || 0})}
                  max={selectedRecord.quantity}
                />
              </div>
              
              <div className="space-y-2">
                <Label>质量状态</Label>
                <Select
                  value={returnForm.quality}
                  onValueChange={(v) => setReturnForm({...returnForm, quality: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">合格</SelectItem>
                    <SelectItem value="partial">部分合格</SelectItem>
                    <SelectItem value="reject">不合格</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>备注</Label>
                <Textarea
                  value={returnForm.notes}
                  onChange={(e) => setReturnForm({...returnForm, notes: e.target.value})}
                  placeholder="回货备注..."
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleReturn}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  确认回货
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
