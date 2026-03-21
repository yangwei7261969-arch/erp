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
import {
  Shield,
  Users,
  Key,
  Activity,
  Lock,
  Unlock,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

// 模拟用户数据
const mockUsers = [
  { id: '1', username: 'admin', name: '管理员', role: 'admin', status: 'active', lastLogin: '2024-01-15 10:30' },
  { id: '2', username: 'boss', name: '老板', role: 'boss', status: 'active', lastLogin: '2024-01-15 09:15' },
  { id: '3', username: 'hr001', name: '人事小王', role: 'hr', status: 'active', lastLogin: '2024-01-14 17:00' },
  { id: '4', username: 'finance001', name: '财务小李', role: 'finance', status: 'active', lastLogin: '2024-01-15 08:45' },
  { id: '5', username: 'warehouse001', name: '仓库小张', role: 'warehouse', status: 'inactive', lastLogin: '2024-01-10 14:20' },
];

// 模拟角色数据
const mockRoles = [
  { id: '1', name: 'admin', displayName: '系统管理员', description: '拥有系统所有权限', userCount: 1 },
  { id: '2', name: 'boss', displayName: '老板', description: '查看所有数据和报表', userCount: 1 },
  { id: '3', name: 'hr', displayName: '人事', description: '管理员工和工资', userCount: 1 },
  { id: '4', name: 'finance', displayName: '财务', description: '管理财务和账单', userCount: 1 },
  { id: '5', name: 'warehouse', displayName: '仓库', description: '管理库存和出入库', userCount: 1 },
];

// 模拟操作日志
const mockLogs = [
  { id: '1', user: 'admin', action: '登录系统', ip: '192.168.1.100', time: '2024-01-15 10:30:00', status: 'success' },
  { id: '2', user: 'hr001', action: '添加员工', ip: '192.168.1.102', time: '2024-01-15 10:25:00', status: 'success' },
  { id: '3', user: 'finance001', action: '创建账单', ip: '192.168.1.103', time: '2024-01-15 10:20:00', status: 'success' },
  { id: '4', user: 'unknown', action: '登录尝试', ip: '192.168.1.200', time: '2024-01-15 10:15:00', status: 'failed' },
  { id: '5', user: 'boss', action: '查看报表', ip: '192.168.1.101', time: '2024-01-15 10:10:00', status: 'success' },
];

const roleNames: Record<string, string> = {
  admin: '系统管理员',
  boss: '老板',
  hr: '人事',
  finance: '财务',
  warehouse: '仓库',
  production_manager: '生产经理',
  purchase: '采购',
  cutting_manager: '裁床主管',
  craft: '工艺',
  support: '客服',
};

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'user' | 'role'>('user');
  
  const [userForm, setUserForm] = useState({
    username: '',
    name: '',
    role: '',
    password: '',
  });

  const handleAddUser = () => {
    setDialogType('user');
    setDialogOpen(true);
  };

  const handleAddRole = () => {
    setDialogType('role');
    setDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">安全中心</h1>
          <p className="text-muted-foreground">管理用户、角色权限和系统安全</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">用户总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUsers.length}</div>
            <p className="text-xs text-muted-foreground">活跃用户 {mockUsers.filter(u => u.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">角色数量</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockRoles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今日登录</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">23</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">安全警告</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">1</div>
            <p className="text-xs text-muted-foreground">异常登录尝试</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            用户管理
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            角色权限
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="h-4 w-4 mr-2" />
            操作日志
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Input placeholder="搜索用户..." className="w-64" />
              <Button variant="outline">搜索</Button>
            </div>
            <Button onClick={handleAddUser}>
              <Plus className="mr-2 h-4 w-4" />
              添加用户
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户名</TableHead>
                    <TableHead>姓名</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>最后登录</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{roleNames[user.role] || user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.status === 'active' ? (
                          <Badge className="bg-green-500">
                            <Unlock className="h-3 w-3 mr-1" />
                            正常
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <Lock className="h-3 w-3 mr-1" />
                            禁用
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Key className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            {user.status === 'active' ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleAddRole}>
              <Plus className="mr-2 h-4 w-4" />
              添加角色
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>角色名称</TableHead>
                    <TableHead>显示名称</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>用户数</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.displayName}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>{role.userCount}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" disabled={role.name === 'admin'}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="搜索日志..." className="w-64" />
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="success">成功</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">筛选</Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户</TableHead>
                    <TableHead>操作</TableHead>
                    <TableHead>IP地址</TableHead>
                    <TableHead>时间</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.ip}</TableCell>
                      <TableCell>{log.time}</TableCell>
                      <TableCell>
                        {log.status === 'success' ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            成功
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            失败
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 添加用户弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogType === 'user' ? '添加用户' : '添加角色'}</DialogTitle>
            <DialogDescription>
              {dialogType === 'user' ? '创建新的系统用户' : '创建新的角色'}
            </DialogDescription>
          </DialogHeader>
          {dialogType === 'user' ? (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>用户名 *</Label>
                <Input
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  placeholder="输入用户名"
                />
              </div>
              <div className="space-y-2">
                <Label>姓名 *</Label>
                <Input
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="输入姓名"
                />
              </div>
              <div className="space-y-2">
                <Label>角色 *</Label>
                <Select
                  value={userForm.role}
                  onValueChange={(v) => setUserForm({ ...userForm, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleNames).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>初始密码 *</Label>
                <Input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="输入初始密码"
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>角色名称 *</Label>
                <Input placeholder="例如：manager" />
              </div>
              <div className="space-y-2">
                <Label>显示名称 *</Label>
                <Input placeholder="例如：经理" />
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Input placeholder="角色描述" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={() => { setDialogOpen(false); alert('功能开发中'); }}>
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
