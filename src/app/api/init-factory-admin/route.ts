import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 初始化分厂主账户
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { name, email, phone, password, factory_name } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 检查邮箱是否已存在
    const { data: existingUser } = await client
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: '邮箱已被使用' }, { status: 400 });
    }

    // 检查是否已有分厂主账户
    const { data: existingFactoryAdmin } = await client
      .from('user_roles')
      .select('id')
      .eq('role_id', 'role_factory_admin')
      .limit(1);

    if (existingFactoryAdmin && existingFactoryAdmin.length > 0) {
      return NextResponse.json({ error: '分厂主账户已存在，无法重复创建' }, { status: 400 });
    }

    // 创建用户
    const { data: user, error: userError } = await client
      .from('users')
      .insert({
        name,
        email,
        phone,
        password, // 实际应该加密存储
        department: factory_name || '分厂',
        position: '分厂主账户',
        status: 'active',
      })
      .select()
      .single();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // 分配分厂主账户角色
    const { error: roleError } = await client
      .from('user_roles')
      .insert({
        id: `ur_${user.id}_role_factory_admin`,
        user_id: user.id,
        role_id: 'role_factory_admin',
      });

    if (roleError) {
      console.error('Assign role error:', roleError);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: '分厂主账户',
      },
      message: '分厂主账户创建成功',
    });
  } catch (error) {
    console.error('Create factory admin error:', error);
    return NextResponse.json({ error: '创建分厂主账户失败' }, { status: 500 });
  }
}

// 检查分厂主账户状态
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 查询分厂主账户
    const { data: factoryAdmins, error } = await client
      .from('user_roles')
      .select(`
        id,
        user_id,
        users(id, name, email, phone, department, status, created_at)
      `)
      .eq('role_id', 'role_factory_admin');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = factoryAdmins?.map((fa: any) => ({
      id: fa.users?.id,
      name: fa.users?.name,
      email: fa.users?.email,
      phone: fa.users?.phone,
      department: fa.users?.department,
      status: fa.users?.status,
      created_at: fa.users?.created_at,
      is_factory_admin: true,
    })) || [];

    return NextResponse.json({
      success: true,
      data: result,
      exists: result.length > 0,
    });
  } catch (error) {
    console.error('Check factory admin error:', error);
    return NextResponse.json({ error: '检查分厂主账户失败' }, { status: 500 });
  }
}
