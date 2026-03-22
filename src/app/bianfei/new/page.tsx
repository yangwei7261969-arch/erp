'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';

// 常用颜色选项
const colorOptions = [
  { value: '白色', label: '白色' },
  { value: '黑色', label: '黑色' },
  { value: '红色', label: '红色' },
  { value: '蓝色', label: '蓝色' },
  { value: '灰色', label: '灰色' },
  { value: '绿色', label: '绿色' },
  { value: '黄色', label: '黄色' },
  { value: '粉色', label: '粉色' },
  { value: '紫色', label: '紫色' },
  { value: '卡其色', label: '卡其色' },
  { value: '藏青色', label: '藏青色' },
  { value: '军绿色', label: '军绿色' },
];

// 常用尺码选项
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2XL', '3XL', '4XL', '5XL', '28', '29', '30', '31', '32', '33', '34', '36', '38', '40', '42', '44', '46', '48', '50'];

interface BianfeiItem {
  id: string;
  name: string;
  quantities: Record<string, number>;
}

export default function NewBianfeiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = !!editId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 表单数据
  const [orderNo, setOrderNo] = useState('');
  const [styleName, setStyleName] = useState('');
  const [styleCode, setStyleCode] = useState('');
  const [color, setColor] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [quickMode, setQuickMode] = useState(false);
  const [mergeSame, setMergeSame] = useState(false);
  const [autoIncrement, setAutoIncrement] = useState(false);
  const [remark, setRemark] = useState('');
  
  // 编菲条目
  const [items, setItems] = useState<BianfeiItem[]>([
    { id: '1', name: '条目1', quantities: {} }
  ]);

  // 加载编辑数据
  useEffect(() => {
    if (editId) {
      loadBianfei(editId);
    }
  }, [editId]);

  const loadBianfei = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bianfei?id=${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        const record = data.data;
        setOrderNo(record.order_no || '');
        setStyleName(record.style_name || '');
        setStyleCode(record.style_code || '');
        setColor(record.color || '');
        setSelectedSizes(JSON.parse(record.sizes || '[]'));
        setQuickMode(record.quick_mode || false);
        setMergeSame(record.merge_same || false);
        setAutoIncrement(record.auto_increment || false);
        setRemark(record.remark || '');
        
        if (record.bianfei_items) {
          setItems(record.bianfei_items.map((item: any) => ({
            id: item.id,
            name: item.item_name,
            quantities: JSON.parse(item.quantities || '{}')
          })));
        }
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 尺码选择
  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handleSelectAllSizes = () => {
    setSelectedSizes(sizeOptions);
  };

  const handleClearSizes = () => {
    setSelectedSizes([]);
  };

  // 条目管理
  const addItem = () => {
    setItems(prev => [
      ...prev,
      { id: Date.now().toString(), name: `条目${prev.length + 1}`, quantities: {} }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateItemName = (id: string, name: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, name } : item
    ));
  };

  const updateQuantity = (itemId: string, size: string, value: string) => {
    const qty = parseInt(value) || 0;
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantities: { ...item.quantities, [size]: qty }
        };
      }
      return item;
    }));
  };

  // 计算行合计
  const getRowTotal = (item: BianfeiItem) => {
    return Object.values(item.quantities).reduce((sum, q) => sum + (q || 0), 0);
  };

  // 计算列合计
  const getColumnTotal = (size: string) => {
    return items.reduce((sum, item) => sum + (item.quantities[size] || 0), 0);
  };

  // 计算总计
  const getGrandTotal = () => {
    return items.reduce((sum, item) => sum + getRowTotal(item), 0);
  };

  // 快选模式：快速填充
  const handleQuickFill = (itemId: string, value: string) => {
    const qty = parseInt(value) || 0;
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQuantities: Record<string, number> = {};
        selectedSizes.forEach(size => {
          newQuantities[size] = qty;
        });
        return { ...item, quantities: newQuantities };
      }
      return item;
    }));
  };

  // 保存
  const handleSave = async () => {
    if (!orderNo.trim()) {
      alert('请输入订单号');
      return;
    }
    if (!color) {
      alert('请选择颜色');
      return;
    }
    if (selectedSizes.length === 0) {
      alert('请选择至少一个尺码');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/bianfei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_no: orderNo,
          style_name: styleName,
          style_code: styleCode,
          color,
          sizes: selectedSizes,
          items,
          quick_mode: quickMode,
          merge_same: mergeSame,
          auto_increment: autoIncrement,
          remark
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('保存成功！');
        router.push('/bianfei');
      } else {
        alert(data.error || '保存失败');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 新增（清空表单继续添加）
  const handleAddNew = async () => {
    await handleSave();
    if (!saving) {
      // 清空表单
      setOrderNo('');
      setStyleName('');
      setStyleCode('');
      setColor('');
      setSelectedSizes([]);
      setRemark('');
      setItems([{ id: '1', name: '条目1', quantities: {} }]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 标题区域 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push('/bianfei')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold">{isEdit ? '编辑编菲' : '新增编菲'}</h1>
              <p className="text-muted-foreground">录入编菲详细信息</p>
            </div>
          </div>
        </div>
      </div>

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                订单号 <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="请输入订单号"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>款名</Label>
              <Input
                placeholder="请输入款名"
                value={styleName}
                onChange={(e) => setStyleName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>款号</Label>
              <Input
                placeholder="请输入款号"
                value={styleCode}
                onChange={(e) => setStyleCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                颜色 <span className="text-red-500">*</span>
              </Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择颜色" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 尺码选择 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">尺码选择</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAllSizes}>
                全选
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearSizes}>
                清空
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map(size => (
              <Badge
                key={size}
                variant={selectedSizes.includes(size) ? 'default' : 'outline'}
                className={`cursor-pointer px-3 py-1.5 text-sm transition-colors ${
                  selectedSizes.includes(size) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleSizeToggle(size)}
              >
                {size}
                {selectedSizes.includes(size) && (
                  <X className="h-3 w-3 ml-1" onClick={(e) => {
                    e.stopPropagation();
                    handleSizeToggle(size);
                  }} />
                )}
              </Badge>
            ))}
          </div>
          {selectedSizes.length > 0 && (
            <div className="mt-3 text-sm text-muted-foreground">
              已选择 {selectedSizes.length} 个尺码：{selectedSizes.join(', ')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 高级设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">高级设置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={quickMode}
                onCheckedChange={setQuickMode}
              />
              <Label>快选模式</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={mergeSame}
                onCheckedChange={setMergeSame}
              />
              <Label>合并相同条目</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={autoIncrement}
                onCheckedChange={setAutoIncrement}
              />
              <Label>自动递增序号</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数量录入表格 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">数量录入</CardTitle>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" />
              添加条目
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {selectedSizes.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <AlertCircle className="h-5 w-5 mr-2" />
              请先选择尺码
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border p-2 text-left w-12">序号</th>
                    <th className="border p-2 text-left w-32">条目名称</th>
                    {selectedSizes.map(size => (
                      <th key={size} className="border p-2 text-center w-24">
                        {size}
                        {quickMode && (
                          <div className="mt-1">
                            <input
                              type="number"
                              placeholder="快填"
                              className="w-full px-1 py-0.5 text-xs border rounded"
                              onChange={(e) => {
                                items.forEach(item => handleQuickFill(item.id, e.target.value));
                              }}
                            />
                          </div>
                        )}
                      </th>
                    ))}
                    <th className="border p-2 text-center w-20">合计</th>
                    <th className="border p-2 w-16">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border p-2 text-center">{index + 1}</td>
                      <td className="border p-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItemName(item.id, e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                          placeholder="条目名称"
                        />
                      </td>
                      {selectedSizes.map(size => (
                        <td key={size} className="border p-1">
                          <input
                            type="number"
                            value={item.quantities[size] || ''}
                            onChange={(e) => updateQuantity(item.id, size, e.target.value)}
                            className="w-full px-2 py-1 border rounded text-center"
                            placeholder="数量"
                            min="0"
                          />
                        </td>
                      ))}
                      <td className="border p-2 text-center font-medium">
                        {getRowTotal(item)}
                      </td>
                      <td className="border p-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {/* 合计行 */}
                  <tr className="bg-muted/30 font-medium">
                    <td className="border p-2" colSpan={2}>合计</td>
                    {selectedSizes.map(size => (
                      <td key={size} className="border p-2 text-center">
                        {getColumnTotal(size)}
                      </td>
                    ))}
                    <td className="border p-2 text-center text-primary font-bold">
                      {getGrandTotal()}
                    </td>
                    <td className="border p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 备注 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">备注</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="输入备注信息..."
            className="w-full min-h-24 p-3 border rounded-lg resize-none"
          />
        </CardContent>
      </Card>

      {/* 底部操作按钮 */}
      <div className="sticky bottom-4 flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={() => router.push('/bianfei')}>
          取消
        </Button>
        <Button size="lg" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          保存编菲
        </Button>
        {!isEdit && (
          <Button variant="secondary" size="lg" onClick={handleAddNew} disabled={saving}>
            <Plus className="h-4 w-4 mr-2" />
            新增编菲
          </Button>
        )}
      </div>
    </div>
  );
}
