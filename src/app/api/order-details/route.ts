import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取生产订单明细（颜色+尺码配比）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');
    
    const client = getSupabaseClient();
    
    if (orderId) {
      // 获取单个订单的明细
      const { data: order } = await client
        .from('production_orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (!order) {
        return NextResponse.json({ error: '订单不存在' }, { status: 404 });
      }
      
      // 获取该订单已有的裁床记录
      const { data: cuttingOrders } = await client
        .from('cutting_orders')
        .select('id, cutting_qty, size_breakdown, status')
        .eq('production_order_id', orderId);
      
      // 计算已载数量
      const alreadyCut = (cuttingOrders || []).reduce((sum: number, co: any) => {
        return sum + (co.cutting_qty || 0);
      }, 0);
      
      // 计算各尺码已载数量
      const sizeAlreadyCut: Record<string, number> = {};
      (cuttingOrders || []).forEach((co: any) => {
        if (co.size_breakdown) {
          Object.entries(co.size_breakdown).forEach(([size, qty]) => {
            sizeAlreadyCut[size] = (sizeAlreadyCut[size] || 0) + (qty as number);
          });
        }
      });
      
      // 订单尺码明细（如果没有size_breakdown，则用默认值）
      const sizeBreakdown = order.size_breakdown || {
        'S': Math.floor(order.quantity / 4),
        'M': Math.floor(order.quantity / 4),
        'L': Math.floor(order.quantity / 4),
        'XL': order.quantity - Math.floor(order.quantity / 4) * 3,
      };
      
      // 计算各尺码剩余待载数量
      const sizeRemaining: Record<string, number> = {};
      Object.entries(sizeBreakdown).forEach(([size, qty]) => {
        sizeRemaining[size] = Math.max(0, (qty as number) - (sizeAlreadyCut[size] || 0));
      });
      
      return NextResponse.json({
        success: true,
        data: {
          order,
          size_breakdown: sizeBreakdown,
          already_cut: alreadyCut,
          size_already_cut: sizeAlreadyCut,
          size_remaining: sizeRemaining,
          remaining_qty: Math.max(0, order.quantity - alreadyCut),
          cutting_orders: cuttingOrders || [],
        }
      });
    }
    
    // 获取所有需要裁床的订单（未完成的）
    const { data, error } = await client
      .from('production_orders')
      .select('id, order_no, style_no, style_name, color, quantity, completed_quantity, status')
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get order details error:', error);
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
  }
}
