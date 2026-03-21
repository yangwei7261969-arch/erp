'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Settings,
  Shield,
  Palette,
  Bell,
  Database,
  Key,
  Globe,
  Mail,
  Loader2,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    company_short_name: '',
    company_phone: '',
    company_fax: '',
    company_address: '',
    system_email: '',
    support_phone: '',
    theme_mode: 'light',
    theme_color: 'blue',
    backup_cycle: 'daily',
    log_retention_days: '90',
    session_timeout: '30',
    max_upload_size: '10',
    force_password_change: 'false',
    two_factor_auth: 'false',
    operation_log: 'true',
    notification_stock_warning: 'true',
    notification_order_overdue: 'true',
    notification_payment_due: 'true',
    notification_announcement: 'true',
    notification_ai_log: 'true',
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings');
      const result = await response.json();
      
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          ...result.data,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: formData }),
      });
      const result = await response.json();
      
      if (result.success) {
        alert('设置保存成功！');
      } else {
        alert('保存失败：' + result.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('确定要重置所有设置吗？')) {
      fetchSettings();
    }
  };

  const updateField = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
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
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">系统设置</h1>
        <p className="text-muted-foreground">管理系统配置、权限和主题</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">基本设置</TabsTrigger>
          <TabsTrigger value="permissions">权限管理</TabsTrigger>
          <TabsTrigger value="appearance">主题外观</TabsTrigger>
          <TabsTrigger value="notifications">通知设置</TabsTrigger>
          <TabsTrigger value="system">系统配置</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                企业信息
              </CardTitle>
              <CardDescription>配置企业基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>企业名称</Label>
                  <Input 
                    placeholder="输入企业名称" 
                    value={formData.company_name}
                    onChange={(e) => updateField('company_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>企业简称</Label>
                  <Input 
                    placeholder="输入企业简称" 
                    value={formData.company_short_name}
                    onChange={(e) => updateField('company_short_name', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>联系电话</Label>
                  <Input 
                    placeholder="联系电话" 
                    value={formData.company_phone}
                    onChange={(e) => updateField('company_phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>传真号码</Label>
                  <Input 
                    placeholder="传真号码" 
                    value={formData.company_fax}
                    onChange={(e) => updateField('company_fax', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>企业地址</Label>
                <Textarea 
                  placeholder="企业详细地址" 
                  value={formData.company_address}
                  onChange={(e) => updateField('company_address', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                联系方式配置
              </CardTitle>
              <CardDescription>配置系统通知邮箱和客服联系方式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>系统通知邮箱</Label>
                  <Input 
                    type="email" 
                    placeholder="system@company.com"
                    value={formData.system_email}
                    onChange={(e) => updateField('system_email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>客服电话</Label>
                  <Input 
                    placeholder="400-XXX-XXXX"
                    value={formData.support_phone}
                    onChange={(e) => updateField('support_phone', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                角色权限配置
              </CardTitle>
              <CardDescription>配置各角色的系统访问权限</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { role: '超级管理员', description: '拥有系统所有权限', level: 1 },
                  { role: '厂长', description: '管理生产、仓库、财务等核心模块', level: 2 },
                  { role: '生产主管', description: '管理生产订单和工序进度', level: 3 },
                  { role: '仓管员', description: '管理仓库库存和出入库', level: 4 },
                  { role: '财务', description: '管理账单、付款和发票', level: 3 },
                  { role: '人事', description: '管理员工信息和工资', level: 3 },
                  { role: '普通员工', description: '查看个人相关信息', level: 5 },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{item.role}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">权限级别: {item.level}</span>
                      <Button variant="outline" size="sm">配置权限</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                主题设置
              </CardTitle>
              <CardDescription>自定义系统外观</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>主题模式</Label>
                <Select 
                  value={formData.theme_mode} 
                  onValueChange={(v) => updateField('theme_mode', v)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">浅色模式</SelectItem>
                    <SelectItem value="dark">深色模式</SelectItem>
                    <SelectItem value="system">跟随系统</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>主题色</Label>
                <div className="flex gap-2">
                  {['blue', 'purple', 'green', 'orange', 'red'].map((color) => (
                    <button
                      key={color}
                      onClick={() => updateField('theme_color', color)}
                      className={`h-8 w-8 rounded-full bg-${color}-500 ring-offset-2 hover:ring-2 ${
                        formData.theme_color === color ? 'ring-2 ring-primary' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Logo 设置</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-32 rounded border flex items-center justify-center bg-muted">
                    Logo 预览
                  </div>
                  <Button variant="outline">上传 Logo</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                通知设置
              </CardTitle>
              <CardDescription>配置系统通知规则</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'notification_stock_warning', label: '库存预警通知', description: '当物料库存低于安全库存时通知' },
                { key: 'notification_order_overdue', label: '订单超期通知', description: '当生产订单超过计划完成日期时通知' },
                { key: 'notification_payment_due', label: '付款到期通知', description: '当应付账单即将到期时通知' },
                { key: 'notification_announcement', label: '系统公告推送', description: '有新公告时推送通知' },
                { key: 'notification_ai_log', label: 'AI 操作记录', description: '记录所有 AI 助手的操作日志' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch 
                    checked={formData[item.key as keyof typeof formData] === 'true'}
                    onCheckedChange={(checked) => updateField(item.key, checked ? 'true' : 'false')}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                系统配置
              </CardTitle>
              <CardDescription>系统级配置参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>数据备份周期</Label>
                  <Select 
                    value={formData.backup_cycle}
                    onValueChange={(v) => updateField('backup_cycle', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">每天</SelectItem>
                      <SelectItem value="weekly">每周</SelectItem>
                      <SelectItem value="monthly">每月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>日志保留天数</Label>
                  <Input 
                    type="number" 
                    value={formData.log_retention_days}
                    onChange={(e) => updateField('log_retention_days', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>会话超时时间（分钟）</Label>
                  <Input 
                    type="number" 
                    value={formData.session_timeout}
                    onChange={(e) => updateField('session_timeout', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>最大上传文件大小（MB）</Label>
                  <Input 
                    type="number" 
                    value={formData.max_upload_size}
                    onChange={(e) => updateField('max_upload_size', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                安全设置
              </CardTitle>
              <CardDescription>系统安全相关配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">强制密码修改</p>
                  <p className="text-sm text-muted-foreground">要求用户定期修改密码</p>
                </div>
                <Switch 
                  checked={formData.force_password_change === 'true'}
                  onCheckedChange={(checked) => updateField('force_password_change', checked ? 'true' : 'false')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">双因素认证</p>
                  <p className="text-sm text-muted-foreground">启用双因素认证增强安全性</p>
                </div>
                <Switch 
                  checked={formData.two_factor_auth === 'true'}
                  onCheckedChange={(checked) => updateField('two_factor_auth', checked ? 'true' : 'false')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">操作日志审计</p>
                  <p className="text-sm text-muted-foreground">记录所有用户操作日志</p>
                </div>
                <Switch 
                  checked={formData.operation_log === 'true'}
                  onCheckedChange={(checked) => updateField('operation_log', checked ? 'true' : 'false')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>重置</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          保存设置
        </Button>
      </div>
    </div>
  );
}
