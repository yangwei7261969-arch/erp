import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取角色列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const includePermissions = searchParams.get('include_permissions') === 'true';

    // 获取角色
    const { data: roles, error: rolesError } = await client
      .from('roles')
      .select('*')
      .order('level', { ascending: true });

    if (rolesError) {
      return NextResponse.json({ error: rolesError.message }, { status: 500 });
    }

    if (includePermissions) {
      // 获取角色权限
      const { data: rolePermissions } = await client
        .from('role_permissions')
        .select('role_id, permission_id, permissions(id, module, action, description)');

      // 获取所有权限
      const { data: allPermissions } = await client
        .from('permissions')
        .select('*')
        .order('module', { ascending: true });

      // 组装数据
      const result = roles?.map((role: any) => ({
        ...role,
        permissions: rolePermissions?.filter((rp: any) => rp.role_id === role.id)?.map((rp: any) => rp.permissions) || [],
      }));

      return NextResponse.json({
        success: true,
        data: result,
        allPermissions,
      });
    }

    return NextResponse.json({ success: true, data: roles });
  } catch (error) {
    console.error('Get roles error:', error);
    return NextResponse.json({ error: '获取角色失败' }, { status: 500 });
  }
}

// 更新角色权限
export async function PUT(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { role_id, permission_ids } = body;

    if (!role_id) {
      return NextResponse.json({ error: '缺少角色ID' }, { status: 400 });
    }

    // 检查是否为系统角色
    const { data: role } = await client
      .from('roles')
      .select('is_system')
      .eq('id', role_id)
      .single();

    if (role?.is_system) {
      return NextResponse.json({ error: '系统角色不允许修改权限' }, { status: 400 });
    }

    // 删除旧权限
    await client
      .from('role_permissions')
      .delete()
      .eq('role_id', role_id);

    // 插入新权限
    if (permission_ids && permission_ids.length > 0) {
      const records = permission_ids.map((perm_id: string) => ({
        id: `rp_${role_id}_${perm_id}`,
        role_id,
        permission_id: perm_id,
      }));

      const { error } = await client
        .from('role_permissions')
        .insert(records);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: '权限更新成功' });
  } catch (error) {
    console.error('Update role permissions error:', error);
    return NextResponse.json({ error: '更新权限失败' }, { status: 500 });
  }
}

// 创建自定义角色
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { name, display_name, description, level, permission_ids } = body;

    if (!name || !display_name) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 检查角色名是否已存在
    const { data: existing } = await client
      .from('roles')
      .select('id')
      .eq('name', name)
      .single();

    if (existing) {
      return NextResponse.json({ error: '角色名已存在' }, { status: 400 });
    }

    // 创建角色
    const { data: role, error: roleError } = await client
      .from('roles')
      .insert({
        name,
        display_name,
        description,
        level: level || 5,
        is_system: false,
      })
      .select()
      .single();

    if (roleError) {
      return NextResponse.json({ error: roleError.message }, { status: 500 });
    }

    // 分配权限
    if (permission_ids && permission_ids.length > 0) {
      const records = permission_ids.map((perm_id: string) => ({
        id: `rp_${role.id}_${perm_id}`,
        role_id: role.id,
        permission_id: perm_id,
      }));

      await client
        .from('role_permissions')
        .insert(records);
    }

    return NextResponse.json({ success: true, data: role, message: '角色创建成功' });
  } catch (error) {
    console.error('Create role error:', error);
    return NextResponse.json({ error: '创建角色失败' }, { status: 500 });
  }
}

// 删除角色
export async function DELETE(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少角色ID' }, { status: 400 });
    }

    // 检查是否为系统角色
    const { data: role } = await client
      .from('roles')
      .select('is_system')
      .eq('id', id)
      .single();

    if (role?.is_system) {
      return NextResponse.json({ error: '系统角色不允许删除' }, { status: 400 });
    }

    // 检查是否有用户使用此角色
    const { data: users } = await client
      .from('user_roles')
      .select('id')
      .eq('role_id', id)
      .limit(1);

    if (users && users.length > 0) {
      return NextResponse.json({ error: '该角色下有用户，无法删除' }, { status: 400 });
    }

    // 删除角色权限
    await client
      .from('role_permissions')
      .delete()
      .eq('role_id', id);

    // 删除角色
    const { error } = await client
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '角色删除成功' });
  } catch (error) {
    console.error('Delete role error:', error);
    return NextResponse.json({ error: '删除角色失败' }, { status: 500 });
  }
}
