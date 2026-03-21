'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Factory, User, Building2, AlertCircle, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 登录表单
  const [loginCode, setLoginCode] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginType, setLoginType] = useState<'supplier' | 'admin'>('supplier');

  // 注册表单
  const [regForm, setRegForm] = useState({
    code: '',
    name: '',
    short_name: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
    parent_id: '',
  });

  // 可选的上级供应商列表
  const [parentSuppliers, setParentSuppliers] = useState<any[]>([]);
  const [showParentSelect, setShowParentSelect] = useState(false);

  // 登录
  const handleLogin = async () => {
    if (!loginCode || !loginPassword) {
      setError('请输入账号和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (loginType === 'supplier') {
        const response = await fetch('/api/supplier-auth', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: loginCode, password: loginPassword }),
        });

        const result = await response.json();
        if (result.success) {
          // 保存登录信息到本地存储
          localStorage.setItem('supplier_info', JSON.stringify(result.data));
          localStorage.setItem('user_type', 'supplier');
          router.push('/supplier-workbench');
        } else {
          setError(result.error || '登录失败');
        }
      } else {
        // 管理员登录（简化处理，实际应接入用户系统）
        if (loginCode === 'admin' && loginPassword === 'admin123') {
          localStorage.setItem('user_type', 'admin');
          router.push('/');
        } else {
          setError('账号或密码错误');
        }
      }
    } catch (err) {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 注册
  const handleRegister = async () => {
    if (!regForm.code || !regForm.name || !regForm.phone || !regForm.password) {
      setError('请填写必填项');
      return;
    }

    if (regForm.password !== regForm.confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/supplier-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });

      const result = await response.json();
      if (result.success) {
        setSuccess('注册成功！请等待管理员审核后登录');
        setRegForm({
          code: '',
          name: '',
          short_name: '',
          contact: '',
          phone: '',
          email: '',
          address: '',
          password: '',
          confirmPassword: '',
          parent_id: '',
        });
      } else {
        setError(result.error || '注册失败');
      }
    } catch (err) {
      setError('注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 加载上级供应商列表
  const loadParentSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      const result = await response.json();
      if (result.success) {
        setParentSuppliers(result.data.filter((s: any) => s.status === 'active'));
      }
    } catch (err) {
      console.error('Failed to load suppliers');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center">
              <Factory className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">服装生产管理系统</CardTitle>
          <p className="text-gray-500 text-sm mt-1">外发生产协同平台</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">供应商注册</TabsTrigger>
            </TabsList>

            {/* 登录表单 */}
            <TabsContent value="login" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>登录身份</Label>
                <Select value={loginType} onValueChange={(v) => setLoginType(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        供应商
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        管理员
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>账号 {loginType === 'supplier' ? '(供应商编码)' : ''}</Label>
                <Input
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  placeholder={loginType === 'supplier' ? '输入供应商编码' : '输入管理员账号'}
                />
              </div>

              <div className="space-y-2">
                <Label>密码</Label>
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="输入密码"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                className="w-full" 
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </TabsContent>

            {/* 注册表单 */}
            <TabsContent value="register" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>供应商编码 *</Label>
                  <Input
                    value={regForm.code}
                    onChange={(e) => setRegForm({ ...regForm, code: e.target.value })}
                    placeholder="如: SUP001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>供应商名称 *</Label>
                  <Input
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    placeholder="公司全称"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>简称</Label>
                  <Input
                    value={regForm.short_name}
                    onChange={(e) => setRegForm({ ...regForm, short_name: e.target.value })}
                    placeholder="简称"
                  />
                </div>
                <div className="space-y-2">
                  <Label>联系人 *</Label>
                  <Input
                    value={regForm.contact}
                    onChange={(e) => setRegForm({ ...regForm, contact: e.target.value })}
                    placeholder="联系人姓名"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>联系电话 *</Label>
                  <Input
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="手机号"
                  />
                </div>
                <div className="space-y-2">
                  <Label>邮箱</Label>
                  <Input
                    type="email"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="邮箱地址"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>地址</Label>
                <Input
                  value={regForm.address}
                  onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                  placeholder="公司地址"
                />
              </div>

              {/* 上级供应商选择 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasParent"
                    checked={showParentSelect}
                    onChange={(e) => {
                      setShowParentSelect(e.target.checked);
                      if (e.target.checked) {
                        loadParentSuppliers();
                      } else {
                        setRegForm({ ...regForm, parent_id: '' });
                      }
                    }}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="hasParent" className="cursor-pointer">
                    我是下线供应商（选择上级）
                  </Label>
                </div>
                {showParentSelect && (
                  <Select 
                    value={regForm.parent_id} 
                    onValueChange={(v) => setRegForm({ ...regForm, parent_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择上级供应商" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentSuppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>密码 *</Label>
                  <Input
                    type="password"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="设置密码"
                  />
                </div>
                <div className="space-y-2">
                  <Label>确认密码 *</Label>
                  <Input
                    type="password"
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                    placeholder="再次输入密码"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}

              <Button 
                className="w-full" 
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? '注册中...' : '提交注册'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
