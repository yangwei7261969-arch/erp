import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取系统设置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const client = getSupabaseClient();
    
    let query = client
      .from('system_settings')
      .select('*')
      .order('key', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 转换为键值对格式
    const settings: Record<string, string> = {};
    data?.forEach(item => {
      settings[item.key] = item.value || '';
    });

    return NextResponse.json({
      success: true,
      data: settings,
      items: data,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
  }
}

// 更新系统设置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body; // { key: value, ... }
    
    const client = getSupabaseClient();

    // 逐个更新设置
    for (const [key, value] of Object.entries(settings)) {
      await client
        .from('system_settings')
        .upsert({
          key,
          value: value as string,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });
    }

    return NextResponse.json({ success: true, message: '设置已保存' });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
