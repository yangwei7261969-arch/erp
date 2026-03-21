import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取二次工艺列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productionOrderId = searchParams.get('productionOrderId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const client = getSupabaseClient();
    
    let query = client
      .from('craft_processes')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (productionOrderId) {
      query = query.eq('production_order_id', productionOrderId);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 获取生产订单信息
    let orders: Record<string, any> = {};
    if (data && data.length > 0) {
      const orderIds = [...new Set(data.map(c => c.production_order_id).filter(Boolean))];
      if (orderIds.length > 0) {
        const { data: orderData } = await client
          .from('production_orders')
          .select('id, order_no, style_no, style_name')
          .in('id', orderIds);
        
        if (orderData) {
          orderData.forEach(o => {
            orders[o.id] = o;
          });
        }
      }
    }

    const formattedData = data?.map(item => ({
      ...item,
      production_orders: orders[item.production_order_id] || null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      total: count,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Get craft processes error:', error);
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
  }
}

// 创建二次工艺
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('craft_processes')
      .insert({
        production_order_id: body.production_order_id,
        process_name: body.process_name,
        process_type: body.process_type,
        quantity: body.quantity,
        unit_price: body.unit_price,
        total_cost: body.quantity * body.unit_price,
        supplier_id: body.supplier_id,
        status: 'pending',
        notes: body.notes,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Create craft process error:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

// 更新二次工艺状态
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, completed_qty } = body;
    const client = getSupabaseClient();

    const updateData: any = { status };
    if (completed_qty !== undefined) {
      updateData.completed_qty = completed_qty;
    }

    const { data, error } = await client
      .from('craft_processes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Update craft process error:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}
