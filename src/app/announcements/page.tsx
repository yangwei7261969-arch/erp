'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  Plus,
  Eye,
  Megaphone,
  AlertCircle,
  Info,
  Loader2,
  Trash2,
  Edit,
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  is_published: boolean;
  publish_at: string | null;
  expire_at: string | null;
  created_at: string;
}

const typeConfig: Record<string, { label: string; icon: typeof Info; className: string }> = {
  important: { label: '重要', icon: AlertCircle, className: 'bg-orange-500' },
  urgent: { label: '紧急', icon: AlertCircle, className: 'bg-red-500' },
  system: { label: '系统', icon: Info, className: 'bg-blue-500' },
  general: { label: '普通', icon: Megaphone, className: 'bg-gray-500' },
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    is_published: false,
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }
      
      const response = await fetch(`/api/announcements?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setAnnouncements(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [typeFilter]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      alert('请填写标题和内容');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      
      if (result.success) {
        setDialogOpen(false);
        setFormData({ title: '', content: '', type: 'general', is_published: false });
        fetchAnnouncements();
        alert('公告发布成功！');
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此公告吗？')) return;
    
    try {
      const response = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
      const result = await response.json();
      
      if (result.success) {
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleView = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setViewDialogOpen(true);
  };

  // 统计
  const publishedCount = announcements.filter(a => a.is_published).length;
  const draftCount = announcements.filter(a => !a.is_published).length;
  const urgentCount = announcements.filter(a => a.type === 'urgent').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">公告中心</h1>
          <p className="text-muted-foreground">发布和管理公司公告</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          发布公告
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">已发布公告</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCount}</div>
            <p className="text-xs text-muted-foreground">条公告</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待发布</CardTitle>
            <Bell className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{draftCount}</div>
            <p className="text-xs text-muted-foreground">草稿</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">紧急公告</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{urgentCount}</div>
            <p className="text-xs text-muted-foreground">条</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总公告数</CardTitle>
            <Megaphone className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">条公告</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={typeFilter} onValueChange={setTypeFilter}>
        <TabsList>
          <TabsTrigger value="all">全部公告</TabsTrigger>
          <TabsTrigger value="important">重要公告</TabsTrigger>
          <TabsTrigger value="urgent">紧急公告</TabsTrigger>
          <TabsTrigger value="system">系统公告</TabsTrigger>
        </TabsList>

        <TabsContent value={typeFilter}>
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : announcements.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  暂无公告
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>标题</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>内容预览</TableHead>
                      <TableHead>发布日期</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((announcement) => {
                      const config = typeConfig[announcement.type] || typeConfig.general;
                      return (
                        <TableRow key={announcement.id}>
                          <TableCell className="font-medium">{announcement.title}</TableCell>
                          <TableCell>
                            <Badge className={config.className}>
                              <config.icon className="mr-1 h-3 w-3" />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{announcement.content}</TableCell>
                          <TableCell>{announcement.created_at?.slice(0, 10)}</TableCell>
                          <TableCell>
                            <Badge variant={announcement.is_published ? 'default' : 'secondary'}>
                              {announcement.is_published ? '已发布' : '草稿'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleView(announcement)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(announcement.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 发布公告弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>发布公告</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>标题 *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="输入公告标题"
              />
            </div>
            <div className="space-y-2">
              <Label>类型</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">普通</SelectItem>
                  <SelectItem value="important">重要</SelectItem>
                  <SelectItem value="urgent">紧急</SelectItem>
                  <SelectItem value="system">系统</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>内容 *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="输入公告内容"
                rows={5}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              />
              <Label htmlFor="is_published">立即发布</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              发布
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看公告弹窗 */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge className={typeConfig[selectedAnnouncement?.type || 'general']?.className}>
                {typeConfig[selectedAnnouncement?.type || 'general']?.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {selectedAnnouncement?.created_at?.slice(0, 10)}
              </span>
            </div>
            <p className="whitespace-pre-wrap">{selectedAnnouncement?.content}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
