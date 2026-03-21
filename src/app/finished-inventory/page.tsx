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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Box,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface FinishedInventoryItem {
  id: string;
  goodsId: string;
  warehouse: string;
  location: string | null;
  quantity: number;
  lockedQty: number;
  availableQty: number | null;
  batchNo: string | null;
  createdAt: string;
  updatedAt: string | null;
  // 成品信息
  sku: string;
  styleNo: string | null;
  styleName: string | null;
  color: string | null;
  size: string | null;
  unit: string | null;
  brand: string | null;
  costPrice: string | null;
  salePrice: string | null;
}

export default function FinishedInventoryPage() {
  const [inventory, setInventory] = useState<FinishedInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    goodsId: '',
    type: 'in' as 'in' | 'out',
    quantity: 0,
    warehouse: '成品仓',
    location: '',
    batchNo: '',
    notes: '',
  });

  // 成品列表（用于选择）
  const [goods, setGoods] = useState<any[]>([]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(search && { search }),
        ...(warehouseFilter !== 'all' && { warehouse: warehouseFilter }),
      });
      
      const response = await fetch(`/api/finished-inventory?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setInventory(result.data);
        setTotal(result.total);
      }
    } catch (error) {
      console.error('Failed to fetch finished inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoods = async () => {
    try {
      // 这里需要创建一个获取成品的API，暂时使用模拟数据
      setGoods([
        { id: '1', sku: 'FG001', styleNo: 'S2024001', styleName: '经典款T恤', color: '白色', size: 'M' },
        { id: '2', sku: 'FG002', styleNo: 'S2024002', styleName: '休闲裤', color: '黑色', size: 'L' },
      ]);
    } catch (error) {
      console.error('Failed to fetch goods:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchGoods();
  }, [page, warehouseFilter]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/finished-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      
      if (result.success) {
        setDialogOpen(false);
        fetchInventory();
        alert(result.message);
      } else {
        alert(result.error || '操作失败');
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 计算统计数据
  const totalQuantity = inventory.reduce((sum, item) => sum + Number(item.quantity), 0);
  const totalLocked = inventory.reduce((sum, item) => sum + Number(item.lockedQty), 0);
  const totalAvailable = inventory.reduce((sum, item) => sum + Number(item.availableQty || 0), 0);
  const lowStockItems = inventory.filter(item => Number(item.quantity) < 10);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">成衣库存</h1>
          <p className="text-muted-foreground">管理成品成衣库存、入库出库</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          入库/出库
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">款式数量</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总库存量</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {totalQuantity.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">可用库存</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {totalAvailable.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">锁定库存</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{totalLocked}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">库存列表</TabsTrigger>
          <TabsTrigger value="lowStock">库存预警</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          {/* Filters */}
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="搜索SKU、款号、款名..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchInventory()}
                  />
                </div>
                <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="仓库筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部仓库</SelectItem>
                    <SelectItem value="成品仓">成品仓</SelectItem>
                    <SelectItem value="发货仓">发货仓</SelectItem>
                    <SelectItem value="退货仓">退货仓</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchInventory}>查询</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : inventory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  暂无库存数据
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>款号</TableHead>
                      <TableHead>款名</TableHead>
                      <TableHead>颜色</TableHead>
                      <TableHead>尺码</TableHead>
                      <TableHead>仓库</TableHead>
                      <TableHead>库位</TableHead>
                      <TableHead>库存数量</TableHead>
                      <TableHead>锁定数量</TableHead>
                      <TableHead>可用数量</TableHead>
                      <TableHead>批次号</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => {
                      const isLowStock = Number(item.quantity) < 10;
                      
                      return (
                        <TableRow key={item.id} className={isLowStock ? 'bg-red-50' : ''}>
                          <TableCell className="font-medium">
                            {item.sku}
                            {isLowStock && (
                              <AlertTriangle className="inline ml-2 h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>{item.styleNo || '-'}</TableCell>
                          <TableCell>{item.styleName || '-'}</TableCell>
                          <TableCell>{item.color || '-'}</TableCell>
                          <TableCell>{item.size || '-'}</TableCell>
                          <TableCell>{item.warehouse}</TableCell>
                          <TableCell>{item.location || '-'}</TableCell>
                          <TableCell className="font-medium">{item.quantity}</TableCell>
                          <TableCell className="text-orange-500">{item.lockedQty}</TableCell>
                          <TableCell className="text-green-600">{item.availableQty || 0}</TableCell>
                          <TableCell>{item.batchNo || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lowStock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                库存预警列表
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  暂无库存预警
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>款号</TableHead>
                      <TableHead>款名</TableHead>
                      <TableHead>颜色</TableHead>
                      <TableHead>尺码</TableHead>
                      <TableHead>当前库存</TableHead>
                      <TableHead>仓库</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockItems.map((item) => (
                      <TableRow key={item.id} className="bg-red-50">
                        <TableCell className="font-medium">{item.sku}</TableCell>
                        <TableCell>{item.styleNo || '-'}</TableCell>
                        <TableCell>{item.styleName || '-'}</TableCell>
                        <TableCell>{item.color || '-'}</TableCell>
                        <TableCell>{item.size || '-'}</TableCell>
                        <TableCell className="text-red-600 font-medium">{item.quantity}</TableCell>
                        <TableCell>{item.warehouse}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 入库/出库弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>入库/出库</DialogTitle>
            <DialogDescription>
              选择成品并进行入库或出库操作
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>操作类型 *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v) => setFormData({ ...formData, type: v as 'in' | 'out' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">入库</SelectItem>
                  <SelectItem value="out">出库</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>成品 *</Label>
              <Input
                value={formData.goodsId}
                onChange={(e) => setFormData({ ...formData, goodsId: e.target.value })}
                placeholder="输入成品ID"
              />
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
                <Label>仓库</Label>
                <Select 
                  value={formData.warehouse} 
                  onValueChange={(v) => setFormData({ ...formData, warehouse: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="成品仓">成品仓</SelectItem>
                    <SelectItem value="发货仓">发货仓</SelectItem>
                    <SelectItem value="退货仓">退货仓</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>库位</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="例如：A区-1排-2层"
              />
            </div>
            <div className="space-y-2">
              <Label>批次号</Label>
              <Input
                value={formData.batchNo}
                onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                placeholder="例如：B20240115"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !formData.goodsId || formData.quantity <= 0}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认{formData.type === 'in' ? '入库' : '出库'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
