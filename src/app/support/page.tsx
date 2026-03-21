'use client';

import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Phone,
  Mail,
  User,
  Loader2,
} from 'lucide-react';

// 模拟工单数据
const mockTickets = [
  { id: 'T001', customer: '张三', phone: '13800138001', type: '订单问题', subject: '订单发货延迟', status: 'pending', priority: 'high', createdAt: '2024-01-15 10:30', handler: null },
  { id: 'T002', customer: '李四', phone: '13800138002', type: '质量问题', subject: '衣服有破损', status: 'processing', priority: 'medium', createdAt: '2024-01-15 09:20', handler: '客服小王' },
  { id: 'T003', customer: '王五', phone: '13800138003', type: '售后问题', subject: '申请退货退款', status: 'completed', priority: 'low', createdAt: '2024-01-14 15:00', handler: '客服小李' },
  { id: 'T004', customer: '赵六', phone: '13800138004', type: '物流问题', subject: '收货地址变更', status: 'completed', priority: 'low', createdAt: '2024-01-14 11:30', handler: '客服小王' },
  { id: 'T005', customer: '钱七', phone: '13800138005', type: '账户问题', subject: '无法登录账户', status: 'closed', priority: 'medium', createdAt: '2024-01-13 16:45', handler: '客服小李' },
];

const ticketTypes = [
  { value: 'order', label: '订单问题' },
  { value: 'quality', label: '质量问题' },
  { value: 'after_sale', label: '售后问题' },
  { value: 'logistics', label: '物流问题' },
  { value: 'account', label: '账户问题' },
  { value: 'other', label: '其他问题' },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: '待处理', color: 'secondary', icon: Clock },
  processing: { label: '处理中', color: 'default', icon: AlertCircle },
  completed: { label: '已完成', color: 'default', icon: CheckCircle },
  closed: { label: '已关闭', color: 'destructive', icon: XCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: '高', color: 'destructive' },
  medium: { label: '中', color: 'default' },
  low: { label: '低', color: 'secondary' },
};

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    customer: '',
    phone: '',
    type: '',
    subject: '',
    priority: 'medium',
    content: '',
  });

  const handleCreateTicket = async () => {
    setSubmitting(true);
    // 模拟创建工单
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitting(false);
    setDialogOpen(false);
    alert('工单创建成功！');
    setFormData({
      customer: '',
      phone: '',
      type: '',
      subject: '',
      priority: 'medium',
      content: '',
    });
  };

  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setTicketDialogOpen(true);
  };

  // 计算统计数据
  const pendingCount = mockTickets.filter(t => t.status === 'pending').length;
  const processingCount = mockTickets.filter(t => t.status === 'processing').length;
  const completedCount = mockTickets.filter(t => t.status === 'completed').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">客服中心</h1>
          <p className="text-muted-foreground">管理客户工单和问题反馈</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新建工单
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总工单数</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待处理</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">处理中</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{processingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{completedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tickets">
            <MessageSquare className="h-4 w-4 mr-2" />
            工单列表
          </TabsTrigger>
          <TabsTrigger value="faq">
            常见问题
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="搜索工单、客户..."
                    className="pl-10"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="状态筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="pending">待处理</SelectItem>
                    <SelectItem value="processing">处理中</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="closed">已关闭</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">筛选</Button>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>工单号</TableHead>
                    <TableHead>客户</TableHead>
                    <TableHead>联系方式</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>主题</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>处理人</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTickets.map((ticket) => {
                    const statusInfo = statusConfig[ticket.status];
                    const priorityInfo = priorityConfig[ticket.priority];
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {ticket.customer}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {ticket.phone}
                          </div>
                        </TableCell>
                        <TableCell>{ticket.type}</TableCell>
                        <TableCell>{ticket.subject}</TableCell>
                        <TableCell>
                          <Badge variant={priorityInfo.color as any}>
                            {priorityInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.color as any}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{ticket.handler || '-'}</TableCell>
                        <TableCell>{ticket.createdAt}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => handleViewTicket(ticket)}>
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>常见问题 FAQ</CardTitle>
              <CardDescription>客户常见问题及解答</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { q: '如何查询订单状态？', a: '登录账户后，在"我的订单"页面可以查看所有订单的状态。' },
                  { q: '退换货流程是什么？', a: '在订单详情页面点击"申请售后"，填写退换原因后提交即可。' },
                  { q: '多久可以发货？', a: '一般情况下，付款后48小时内发货，特殊情况会提前通知。' },
                  { q: '如何修改收货地址？', a: '订单未发货前可在订单详情页面修改收货地址。' },
                ].map((faq, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2">{faq.q}</h4>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 新建工单弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新建工单</DialogTitle>
            <DialogDescription>
              创建新的客户服务工单
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>客户姓名 *</Label>
                <Input
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  placeholder="客户姓名"
                />
              </div>
              <div className="space-y-2">
                <Label>联系电话 *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="联系电话"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>问题类型 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {ticketTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>优先级</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData({ ...formData, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>工单主题 *</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="简要描述问题"
              />
            </div>
            <div className="space-y-2">
              <Label>详细描述</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="详细描述客户问题..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button 
              onClick={handleCreateTicket}
              disabled={submitting || !formData.customer || !formData.phone || !formData.type || !formData.subject}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              创建工单
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看工单弹窗 */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>工单详情</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">工单号</Label>
                  <p className="font-medium">{selectedTicket.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">状态</Label>
                  <p>
                    <Badge variant={statusConfig[selectedTicket.status].color as any}>
                      {statusConfig[selectedTicket.status].label}
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">客户</Label>
                  <p className="font-medium">{selectedTicket.customer}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">联系电话</Label>
                  <p className="font-medium">{selectedTicket.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">问题类型</Label>
                  <p>{selectedTicket.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">优先级</Label>
                  <p>
                    <Badge variant={priorityConfig[selectedTicket.priority].color as any}>
                      {priorityConfig[selectedTicket.priority].label}
                    </Badge>
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">主题</Label>
                <p className="font-medium">{selectedTicket.subject}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">处理人</Label>
                <p>{selectedTicket.handler || '暂未分配'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">创建时间</Label>
                <p>{selectedTicket.createdAt}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTicketDialogOpen(false)}>关闭</Button>
            {selectedTicket?.status === 'pending' && (
              <Button>开始处理</Button>
            )}
            {selectedTicket?.status === 'processing' && (
              <Button>标记完成</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
