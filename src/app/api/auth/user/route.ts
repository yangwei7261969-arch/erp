import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 用户登录
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '请输入邮箱和密码' },
        { status: 400 }
      );
    }

    // 查询用户
    const { data: user, error } = await client
      .from('users')
      .select(`
        id, name, email, phone, department, position, status, avatar,
        user_roles!user_roles_user_id_fkey (
          role_id,
          roles!user_roles_role_id_fkey (
            id, name, display_name, level
          )
        )
      `)
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: '账户已被停用' },
        { status: 403 }
      );
    }

    // 更新最后登录时间
    await client
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // 获取用户权限
    const roles = user.user_roles?.map((ur: any) => ur.roles) || [];
    
    // 获取角色权限
    let permissions: string[] = [];
    if (roles.length > 0) {
      const roleIds = roles.map((r: any) => r.id);
      const { data: rolePerms } = await client
        .from('role_permissions')
        .select('permission_id, permissions(module, action)')
        .in('role_id', roleIds);
      
      permissions = rolePerms?.map((rp: any) => 
        `${rp.permissions?.module}:${rp.permissions?.action}`
      ).filter(Boolean) || [];
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        position: user.position,
        avatar: user.avatar,
        roles,
        permissions,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: '登录失败' },
      { status: 500 }
    );
  }
}

// 获取当前用户信息
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const { data: user, error } = await client
      .from('users')
      .select(`
        id, name, email, phone, department, position, status, avatar,
        user_roles!user_roles_user_id_fkey (
          role_id,
          roles!user_roles_role_id_fkey (
            id, name, display_name, level
          )
        )
      `)
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    const roles = user.user_roles?.map((ur: any) => ur.roles) || [];

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        position: user.position,
        avatar: user.avatar,
        roles,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
