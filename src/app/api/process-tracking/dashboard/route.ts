import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取工序进度统计（用于生产看板）
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    
    // 获取所有工序跟踪记录
    const { data: tracking, error } = await client
      .from('process_tracking')
      .select(`
        id,
        process_name,
        status,
        quantity,
        bundle_id
      `);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 按工序名称分组统计
    const processStats: Record<string, { total: number; completed: number; inProgress: number; pending: number }> = {};

    tracking?.forEach(item => {
      const processName = item.process_name || '未知工序';
      if (!processStats[processName]) {
        processStats[processName] = { total: 0, completed: 0, inProgress: 0, pending: 0 };
      }
      processStats[processName].total += item.quantity || 0;
      
      switch (item.status) {
        case 'completed':
          processStats[processName].completed += item.quantity || 0;
          break;
        case 'in_progress':
          processStats[processName].inProgress += item.quantity || 0;
          break;
        default:
          processStats[processName].pending += item.quantity || 0;
      }
    });

    // 转换为数组并排序
    const result = Object.entries(processStats)
      .map(([processName, stats]) => ({
        processName,
        ...stats,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8); // 只显示前8个工序

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get process dashboard error:', error);
    return NextResponse.json({ error: '获取工序进度失败' }, { status: 500 });
  }
}
