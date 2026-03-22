import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 延迟创建客户端，仅在需要时创建
const getSupabase = () => {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseKey);
};

// GET - 获取编菲列表
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      // 数据库未配置，返回空数据
      return NextResponse.json({ 
        success: true, 
        data: [] 
      });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (id) {
      // 获取单个编菲详情
      const { data: bianfei, error } = await supabase
        .from('bianfei_records')
        .select(`
          *,
          bianfei_items (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // 表不存在，返回空数据
          return NextResponse.json({ 
            success: true, 
            data: null 
          });
        }
        throw error;
      }
      
      return NextResponse.json({ success: true, data: bianfei });
    }
    
    // 获取编菲列表
    const { data, error } = await supabase
      .from('bianfei_records')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        // 表不存在，返回空数据
        return NextResponse.json({ 
          success: true, 
          data: [] 
        });
      }
      throw error;
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Get bianfei error:', error);
    return NextResponse.json({ 
      success: true, 
      data: [] 
    });
  }
}

// POST - 创建新编菲
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        error: '数据库未配置' 
      });
    }
    
    const body = await request.json();
    const { 
      order_no,
      style_name,
      style_code,
      color,
      sizes,
      items,
      quick_mode,
      merge_same,
      auto_increment,
      remark
    } = body;
    
    // 生成编菲单号
    const bianfeiNo = `BF-${Date.now().toString(36).toUpperCase()}`;
    
    // 创建编菲主记录
    const { data: bianfei, error: bianfeiError } = await supabase
      .from('bianfei_records')
      .insert({
        bianfei_no: bianfeiNo,
        order_no,
        style_name,
        style_code,
        color,
        sizes: JSON.stringify(sizes),
        quick_mode,
        merge_same,
        auto_increment,
        remark,
        status: 'pending',
        total_quantity: items.reduce((sum: number, item: any) => 
          sum + Object.values(item.quantities || {}).reduce((s: number, q: any) => s + (Number(q) || 0), 0), 0)
      })
      .select()
      .single();
    
    if (bianfeiError) throw bianfeiError;
    
    // 创建编菲明细
    if (items && items.length > 0) {
      const bianfeiItems = items.map((item: any, index: number) => ({
        bianfei_id: bianfei.id,
        item_no: index + 1,
        item_name: item.name || `条目${index + 1}`,
        quantities: JSON.stringify(item.quantities || {}),
        total: Object.values(item.quantities || {}).reduce((s: number, q: any) => s + (Number(q) || 0), 0)
      }));
      
      const { error: itemsError } = await supabase
        .from('bianfei_items')
        .insert(bianfeiItems);
      
      if (itemsError) throw itemsError;
    }
    
    return NextResponse.json({ success: true, data: bianfei });
  } catch (error: any) {
    console.error('Create bianfei error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || '创建编菲失败' 
    });
  }
}

// PUT - 更新编菲
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        error: '数据库未配置' 
      });
    }
    
    const body = await request.json();
    const { id, ...updates } = body;
    
    const { data, error } = await supabase
      .from('bianfei_records')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Update bianfei error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || '更新编菲失败' 
    });
  }
}

// DELETE - 删除编菲
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        error: '数据库未配置' 
      });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少编菲ID' 
      });
    }
    
    // 先删除明细
    await supabase
      .from('bianfei_items')
      .delete()
      .eq('bianfei_id', id);
    
    // 再删除主记录
    const { error } = await supabase
      .from('bianfei_records')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete bianfei error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || '删除编菲失败' 
    });
  }
}
