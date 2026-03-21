import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取成品库存列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || '';
    const warehouse = searchParams.get('warehouse') || '';

    const offset = (page - 1) * pageSize;

    // 获取库存数据
    let query = client
      .from('finished_inventory')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (warehouse && warehouse !== 'all') {
      query = query.eq('warehouse', warehouse);
    }

    const { data: inventoryData, error, count } = await query
      .range(offset, offset + pageSize - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 获取成品信息
    let goodsMap: Record<string, any> = {};
    if (inventoryData && inventoryData.length > 0) {
      const goodsIds = [...new Set(inventoryData.map(i => i.goods_id).filter(Boolean))];
      if (goodsIds.length > 0) {
        const { data: goodsData } = await client
          .from('finished_goods')
          .select('*')
          .in('id', goodsIds);
        
        if (goodsData) {
          goodsData.forEach(g => {
            goodsMap[g.id] = g;
          });
        }
      }
    }

    // 组装返回数据
    const formattedData = inventoryData?.map(item => {
      const goods = goodsMap[item.goods_id] || {};
      return {
        id: item.id,
        goodsId: item.goods_id,
        warehouse: item.warehouse,
        location: item.location,
        quantity: item.quantity,
        lockedQty: item.locked_qty,
        availableQty: item.available_qty,
        batchNo: item.batch_no,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        // 成品信息
        sku: goods.sku,
        styleNo: goods.style_no,
        styleName: goods.style_name,
        color: goods.color,
        size: goods.size,
        unit: goods.unit,
        brand: goods.brand,
        costPrice: goods.cost_price,
        salePrice: goods.sale_price,
      };
    }) || [];

    // 搜索过滤
    let filteredData = formattedData;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = formattedData.filter(item => 
        item.sku?.toLowerCase().includes(searchLower) ||
        item.styleNo?.toLowerCase().includes(searchLower) ||
        item.styleName?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('获取成品库存失败:', error);
    return NextResponse.json(
      { success: false, error: '获取成品库存失败' },
      { status: 500 }
    );
  }
}

// POST - 入库/出库操作
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { goodsId, type, quantity, warehouse, location, batchNo, notes } = body;

    if (!goodsId || !type || !quantity || !warehouse) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 查找现有库存记录
    const { data: existing, error: queryError } = await client
      .from('finished_inventory')
      .select('*')
      .eq('goods_id', goodsId)
      .eq('warehouse', warehouse)
      .limit(1);

    if (queryError) {
      return NextResponse.json(
        { success: false, error: queryError.message },
        { status: 500 }
      );
    }

    if (!existing || existing.length === 0) {
      // 创建新库存记录
      const { data: newInventory, error: insertError } = await client
        .from('finished_inventory')
        .insert({
          goods_id: goodsId,
          warehouse,
          location: location || null,
          quantity: type === 'in' ? quantity : 0,
          locked_qty: 0,
          available_qty: type === 'in' ? quantity : 0,
          batch_no: batchNo || null,
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
        data: newInventory,
        message: type === 'in' ? '入库成功' : '出库失败，库存不足',
      });
    }

    // 更新现有库存
    const currentQty = Number(existing[0].quantity) || 0;
    let newQty = currentQty;

    if (type === 'in') {
      newQty = currentQty + quantity;
    } else {
      if (currentQty < quantity) {
        return NextResponse.json(
          { success: false, error: '库存不足' },
          { status: 400 }
        );
      }
      newQty = currentQty - quantity;
    }

    const { data: updated, error: updateError } = await client
      .from('finished_inventory')
      .update({
        quantity: newQty,
        available_qty: newQty - Number(existing[0].locked_qty || 0),
        location: location || existing[0].location,
        batch_no: batchNo || existing[0].batch_no,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing[0].id)
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
      message: type === 'in' ? '入库成功' : '出库成功',
    });
  } catch (error) {
    console.error('库存操作失败:', error);
    return NextResponse.json(
      { success: false, error: '库存操作失败' },
      { status: 500 }
    );
  }
}
