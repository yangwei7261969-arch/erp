import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取二次工艺列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const offset = (page - 1) * pageSize;

    // 获取工艺数据
    let query = client
      .from('craft_processes')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: craftData, error, count } = await query
      .range(offset, offset + pageSize - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 获取生产订单信息
    let ordersMap: Record<string, any> = {};
    if (craftData && craftData.length > 0) {
      const orderIds = [...new Set(craftData.map(c => c.production_order_id).filter(Boolean))];
      if (orderIds.length > 0) {
        const { data: ordersData } = await client
          .from('production_orders')
          .select('*')
          .in('id', orderIds);
        
        if (ordersData) {
          ordersData.forEach(o => {
            ordersMap[o.id] = o;
          });
        }
      }
    }

    // 组装返回数据
    let formattedData = craftData?.map(item => {
      const order = ordersMap[item.production_order_id] || {};
      return {
        id: item.id,
        productionOrderId: item.production_order_id,
        processName: item.process_name,
        processType: item.process_type,
        quantity: item.quantity,
        completedQty: item.completed_qty,
        unitPrice: item.unit_price,
        totalCost: item.total_cost,
        supplierId: item.supplier_id,
        status: item.status,
        startDate: item.start_date,
        endDate: item.end_date,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        // 关联生产订单信息
        orderNo: order.order_no,
        styleNo: order.style_no,
        styleName: order.style_name,
      };
    }) || [];

    // 搜索过滤
    if (search) {
      const searchLower = search.toLowerCase();
      formattedData = formattedData.filter(item => 
        item.processName?.toLowerCase().includes(searchLower) ||
        item.processType?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: formattedData,
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('获取二次工艺列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取二次工艺列表失败' },
      { status: 500 }
    );
  }
}

// POST - 创建二次工艺
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const {
      productionOrderId,
      processName,
      processType,
      quantity,
      unitPrice,
      supplierId,
      startDate,
      endDate,
      notes,
    } = body;

    if (!productionOrderId || !processName || !quantity) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const totalCost = unitPrice ? Number(unitPrice) * Number(quantity) : null;

    const { data: newCraft, error: insertError } = await client
      .from('craft_processes')
      .insert({
        production_order_id: productionOrderId,
        process_name: processName,
        process_type: processType || null,
        quantity,
        completed_qty: 0,
        unit_price: unitPrice || null,
        total_cost: totalCost,
        supplier_id: supplierId || null,
        status: 'pending',
        start_date: startDate || null,
        end_date: endDate || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newCraft,
      message: '创建成功',
    });
  } catch (error) {
    console.error('创建二次工艺失败:', error);
    return NextResponse.json(
      { success: false, error: '创建二次工艺失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新二次工艺状态
export async function PUT(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { id, status, completedQty } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少工艺ID' },
        { status: 400 }
      );
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (completedQty !== undefined) updateData.completed_qty = completedQty;

    const { data: updated, error: updateError } = await client
      .from('craft_processes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: '更新成功',
    });
  } catch (error) {
    console.error('更新二次工艺失败:', error);
    return NextResponse.json(
      { success: false, error: '更新二次工艺失败' },
      { status: 500 }
    );
  }
}
