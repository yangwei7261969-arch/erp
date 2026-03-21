import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取裁床单列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const productionOrderId = searchParams.get('productionOrderId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const client = getSupabaseClient();
    
    let query = client
      .from('cutting_orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (productionOrderId) {
      query = query.eq('production_order_id', productionOrderId);
    }

    const { data, error, count } = await query
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      total: count,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Get cutting orders error:', error);
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
  }
}

// 创建裁床单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    // 生成裁床单号
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const { data: lastOrder } = await client
      .from('cutting_orders')
      .select('order_no')
      .like('order_no', `CT${dateStr}%`)
      .order('order_no', { ascending: false })
      .limit(1);

    let orderNo = `CT${dateStr}001`;
    if (lastOrder && lastOrder.length > 0) {
      const lastNo = parseInt(lastOrder[0].order_no.slice(-3));
      orderNo = `CT${dateStr}${String(lastNo + 1).padStart(3, '0')}`;
    }

    const { data, error } = await client
      .from('cutting_orders')
      .insert({
        ...body,
        order_no: orderNo,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 如果关联了生产订单，更新生产订单的完成数量
    if (body.production_order_id && body.completed_qty > 0) {
      await client.rpc('update_production_completed_qty', {
        order_id: body.production_order_id,
        qty: body.completed_qty,
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Create cutting order error:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
