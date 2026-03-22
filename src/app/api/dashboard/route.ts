import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 老板驾驶舱API
 * 
 * 一键看到：
 * • 今日产量
 * • 延期订单
 * • 利润
 * • 工厂效率
 * • KPI排行榜
 * • 预警信息
 */

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // 并行获取所有数据
    const [
      todayProduction,
      delayedOrders,
      profitSummary,
      efficiencyData,
      kpiLeaderboard,
      alerts,
      lineStatus,
      qualityStats
    ] = await Promise.all([
      getTodayProduction(client, date),
      getDelayedOrders(client),
      getProfitSummary(client, date),
      getEfficiencyData(client, date),
      getKPILeaderboard(client, date),
      getAlerts(client),
      getLineStatus(client),
      getQualityStats(client, date)
    ]);

    // 计算综合评分
    const overallScore = calculateOverallScore({
      efficiency: efficiencyData.avgEfficiency,
      quality: qualityStats.passRate,
      onTime: delayedOrders.rate,
      profit: profitSummary.profitRate
    });

    return NextResponse.json({
      success: true,
      data: {
        date,
        overallScore,
        
        // 核心指标
        coreMetrics: {
          todayProduction: todayProduction.totalQuantity,
          yesterdayComparison: todayProduction.comparison,
          delayedOrders: delayedOrders.count,
          delayRate: delayedOrders.rate,
          todayRevenue: profitSummary.todayRevenue,
          todayProfit: profitSummary.todayProfit,
          profitRate: profitSummary.profitRate,
          avgEfficiency: efficiencyData.avgEfficiency
        },

        // 今日产量
        production: todayProduction,

        // 延期订单
        delays: delayedOrders,

        // 利润数据
        profit: profitSummary,

        // 效率数据
        efficiency: efficiencyData,

        // KPI排行榜
        leaderboard: kpiLeaderboard,

        // 预警信息
        alerts,

        // 产线状态
        lineStatus,

        // 质量统计
        quality: qualityStats,

        // 趋势数据（最近7天）
        trends: await getTrends(client, 7)
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ success: false, error: '获取驾驶舱数据失败' }, { status: 500 });
  }
}

/**
 * 获取今日产量
 */
async function getTodayProduction(client: any, date: string) {
  const startDate = `${date}T00:00:00Z`;
  const endDate = `${date}T23:59:59Z`;

  // 今日完成数量
  const { data: todayData } = await client
    .from('process_tracking')
    .select('quantity_completed')
    .gte('end_time', startDate)
    .lte('end_time', endDate)
    .eq('status', 'completed');

  const totalQuantity = todayData?.reduce((sum: number, t: any) => 
    sum + (t.quantity_completed || 0), 0) || 0;

  // 昨日同期
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdayStart = `${yesterdayStr}T00:00:00Z`;
  const yesterdayEnd = `${yesterdayStr}T23:59:59Z`;

  const { data: yesterdayData } = await client
    .from('process_tracking')
    .select('quantity_completed')
    .gte('end_time', yesterdayStart)
    .lte('end_time', yesterdayEnd)
    .eq('status', 'completed');

  const yesterdayQuantity = yesterdayData?.reduce((sum: number, t: any) => 
    sum + (t.quantity_completed || 0), 0) || 0;

  const comparison = yesterdayQuantity > 0 
    ? Math.round((totalQuantity - yesterdayQuantity) / yesterdayQuantity * 100)
    : 0;

  // 按产线统计
  const { data: lineData } = await client
    .from('process_tracking')
    .select(`
      quantity_completed,
      employees (production_line_id, production_lines (name))
    `)
    .gte('end_time', startDate)
    .lte('end_time', endDate)
    .eq('status', 'completed');

  const byLine: Record<string, number> = {};
  lineData?.forEach((item: any) => {
    const lineName = item.employees?.production_lines?.name || '未分配';
    byLine[lineName] = (byLine[lineName] || 0) + (item.quantity_completed || 0);
  });

  return {
    totalQuantity,
    yesterdayQuantity,
    comparison,
    byLine,
    hourly: await getHourlyProduction(client, date)
  };
}

/**
 * 获取每小时产量
 */
async function getHourlyProduction(client: any, date: string) {
  const { data } = await client
    .from('process_tracking')
    .select('quantity_completed, end_time')
    .gte('end_time', `${date}T00:00:00Z`)
    .lte('end_time', `${date}T23:59:59Z`)
    .eq('status', 'completed');

  const hourly: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hourly[i] = 0;

  data?.forEach((item: any) => {
    if (item.end_time) {
      const hour = new Date(item.end_time).getHours();
      hourly[hour] += item.quantity_completed || 0;
    }
  });

  return Object.entries(hourly).map(([hour, qty]) => ({
    hour: parseInt(hour),
    quantity: qty
  }));
}

/**
 * 获取延期订单
 */
async function getDelayedOrders(client: any) {
  const today = new Date().toISOString().split('T')[0];

  // 未完成且已过交期的订单
  const { data: delayed } = await client
    .from('production_orders')
    .select(`
      id,
      order_code,
      delivery_date,
      status,
      customers (name),
      styles (style_name)
    `)
    .lt('delivery_date', today)
    .not('status', 'eq', 'completed');

  // 即将到期的订单（3天内）
  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  
  const { data: upcoming } = await client
    .from('production_orders')
    .select(`
      id,
      order_code,
      delivery_date,
      status,
      progress,
      customers (name),
      styles (style_name)
    `)
    .gte('delivery_date', today)
    .lte('delivery_date', threeDaysLater.toISOString().split('T')[0])
    .not('status', 'eq', 'completed');

  // 统计总订单数
  const { count: total } = await client
    .from('production_orders')
    .select('*', { count: 'exact', head: true });

  const delayedCount = delayed?.length || 0;
  const rate = total ? Math.round(delayedCount / total * 100) : 0;

  return {
    count: delayedCount,
    rate,
    delayed: delayed?.slice(0, 10) || [],
    upcoming: upcoming?.slice(0, 10) || []
  };
}

/**
 * 获取利润汇总
 */
async function getProfitSummary(client: any, date: string) {
  // 今日利润
  const { data: todayCosts } = await client
    .from('order_costs')
    .select('gross_profit, order_amount, profit_rate')
    .gte('created_at', `${date}T00:00:00Z`)
    .lte('created_at', `${date}T23:59:59Z`);

  const todayRevenue = todayCosts?.reduce((sum: number, c: any) => 
    sum + (c.order_amount || 0), 0) || 0;
  const todayProfit = todayCosts?.reduce((sum: number, c: any) => 
    sum + (c.gross_profit || 0), 0) || 0;
  const profitRate = todayRevenue > 0 ? Math.round(todayProfit / todayRevenue * 100) : 0;

  // 本月利润
  const monthStart = date.substring(0, 7) + '-01';
  const { data: monthCosts } = await client
    .from('order_costs')
    .select('gross_profit, order_amount')
    .gte('created_at', `${monthStart}T00:00:00Z`);

  const monthRevenue = monthCosts?.reduce((sum: number, c: any) => 
    sum + (c.order_amount || 0), 0) || 0;
  const monthProfit = monthCosts?.reduce((sum: number, c: any) => 
    sum + (c.gross_profit || 0), 0) || 0;

  // 成本构成
  const { data: costBreakdown } = await client
    .from('order_costs')
    .select('material_cost, labor_cost, outsource_cost, shipping_cost')
    .gte('created_at', `${monthStart}T00:00:00Z`);

  const breakdown = {
    material: 0,
    labor: 0,
    outsource: 0,
    shipping: 0
  };

  costBreakdown?.forEach((c: any) => {
    breakdown.material += c.material_cost || 0;
    breakdown.labor += c.labor_cost || 0;
    breakdown.outsource += c.outsource_cost || 0;
    breakdown.shipping += c.shipping_cost || 0;
  });

  return {
    todayRevenue,
    todayProfit,
    profitRate,
    monthRevenue,
    monthProfit,
    breakdown
  };
}

/**
 * 获取效率数据
 */
async function getEfficiencyData(client: any, date: string) {
  const { data: kpiData } = await client
    .from('employee_kpi_daily')
    .select('efficiency_rate, quality_rate, total_quantity')
    .eq('date', date);

  if (!kpiData || kpiData.length === 0) {
    return {
      avgEfficiency: 0,
      avgQuality: 0,
      totalWorkers: 0,
      topPerformers: [],
      lowPerformers: []
    };
  }

  const avgEfficiency = kpiData.reduce((sum: number, k: any) => 
    sum + (k.efficiency_rate || 0), 0) / kpiData.length;
  
  const avgQuality = kpiData.reduce((sum: number, k: any) => 
    sum + (k.quality_rate || 0), 0) / kpiData.length;

  // 获取详细数据（包含员工信息）
  const { data: detailedKpi } = await client
    .from('employee_kpi_daily')
    .select(`
      efficiency_rate,
      total_quantity,
      employees (name)
    `)
    .eq('date', date)
    .order('efficiency_rate', { ascending: false });

  const topPerformers = detailedKpi?.slice(0, 5).map((k: any) => ({
    name: k.employees?.name,
    efficiency: Math.round(k.efficiency_rate * 100) / 100,
    quantity: k.total_quantity
  })) || [];

  const lowPerformers = detailedKpi?.slice(-5).reverse().map((k: any) => ({
    name: k.employees?.name,
    efficiency: Math.round(k.efficiency_rate * 100) / 100,
    quantity: k.total_quantity
  })) || [];

  return {
    avgEfficiency: Math.round(avgEfficiency * 100) / 100,
    avgQuality: Math.round(avgQuality * 100) / 100,
    totalWorkers: kpiData.length,
    topPerformers,
    lowPerformers
  };
}

/**
 * 获取KPI排行榜
 */
async function getKPILeaderboard(client: any, date: string) {
  const monthStart = date.substring(0, 7) + '-01';

  const { data } = await client
    .from('employee_kpi_daily')
    .select(`
      employee_id,
      employees (name, employee_code),
      sum_total_quantity:total_quantity.sum(),
      avg_efficiency:efficiency_rate.avg(),
      avg_quality:quality_rate.avg()
    `)
    .gte('date', monthStart)
    .order('avg_efficiency', { ascending: false })
    .limit(10);

  return {
    byEfficiency: data?.map((item: any, index: number) => ({
      rank: index + 1,
      employee_id: item.employee_id,
      name: item.employees?.name,
      code: item.employees?.employee_code,
      totalQuantity: item.sum_total_quantity,
      efficiency: Math.round(item.avg_efficiency * 100) / 100,
      quality: Math.round(item.avg_quality * 100) / 100
    })) || []
  };
}

/**
 * 获取预警信息
 */
async function getAlerts(client: any) {
  const { data: exceptions } = await client
    .from('exceptions')
    .select(`
      id,
      type,
      severity,
      title,
      created_at,
      exception_types (name, color)
    `)
    .eq('status', 'open')
    .order('severity', { ascending: false })
    .limit(10);

  const critical = exceptions?.filter((e: any) => e.severity === 'critical').length || 0;
  const high = exceptions?.filter((e: any) => e.severity === 'high').length || 0;
  const medium = exceptions?.filter((e: any) => e.severity === 'medium').length || 0;

  return {
    total: exceptions?.length || 0,
    critical,
    high,
    medium,
    items: exceptions?.slice(0, 5) || []
  };
}

/**
 * 获取产线状态
 */
async function getLineStatus(client: any) {
  const { data: lines } = await client
    .from('production_lines')
    .select(`
      id,
      name,
      status,
      capacity,
      employees (id)
    `);

  const lineStatus = await Promise.all(
    (lines || []).map(async (line: any) => {
      // 获取当前在产订单
      const { count: activeOrders } = await client
        .from('production_orders')
        .select('*', { count: 'exact', head: true })
        .eq('production_line_id', line.id)
        .eq('status', 'in_production');

      return {
        id: line.id,
        name: line.name,
        status: line.status,
        capacity: line.capacity,
        workers: line.employees?.length || 0,
        activeOrders: activeOrders || 0
      };
    })
  );

  return lineStatus;
}

/**
 * 获取质量统计
 */
async function getQualityStats(client: any, date: string) {
  const { data: inspections } = await client
    .from('quality_inspections')
    .select('result')
    .gte('inspection_time', `${date}T00:00:00Z`)
    .lte('inspection_time', `${date}T23:59:59Z`);

  const total = inspections?.length || 0;
  const passed = inspections?.filter((i: any) => i.result === 'pass').length || 0;
  const passRate = total > 0 ? Math.round(passed / total * 100) : 0;

  // 缺陷统计
  const { data: defects } = await client
    .from('quality_defects')
    .select('defect_type, quantity')
    .gte('created_at', `${date}T00:00:00Z`);

  const defectByType: Record<string, number> = {};
  defects?.forEach((d: any) => {
    defectByType[d.defect_type] = (defectByType[d.defect_type] || 0) + (d.quantity || 1);
  });

  return {
    total,
    passed,
    passRate,
    defectByType
  };
}

/**
 * 获取趋势数据
 */
async function getTrends(client: any, days: number) {
  const trends = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // 产量
    const { data: production } = await client
      .from('process_tracking')
      .select('quantity_completed')
      .gte('end_time', `${dateStr}T00:00:00Z`)
      .lte('end_time', `${dateStr}T23:59:59Z`)
      .eq('status', 'completed');

    const quantity = production?.reduce((sum: number, p: any) => 
      sum + (p.quantity_completed || 0), 0) || 0;

    // 效率
    const { data: kpi } = await client
      .from('employee_kpi_daily')
      .select('efficiency_rate')
      .eq('date', dateStr);

    const efficiency = kpi && kpi.length > 0
      ? kpi.reduce((sum: number, k: any) => sum + (k.efficiency_rate || 0), 0) / kpi.length
      : 0;

    // 利润
    const { data: costs } = await client
      .from('order_costs')
      .select('gross_profit')
      .gte('created_at', `${dateStr}T00:00:00Z`)
      .lte('created_at', `${dateStr}T23:59:59Z`);

    const profit = costs?.reduce((sum: number, c: any) => 
      sum + (c.gross_profit || 0), 0) || 0;

    trends.push({
      date: dateStr,
      quantity,
      efficiency: Math.round(efficiency * 100) / 100,
      profit
    });
  }

  return trends;
}

/**
 * 计算综合评分
 */
function calculateOverallScore(data: {
  efficiency: number;
  quality: number;
  onTime: number;
  profit: number;
}) {
  // 加权平均：效率30%，质量30%，准时率20%，利润率20%
  const efficiencyScore = Math.min(data.efficiency, 150) / 150 * 100;
  const qualityScore = data.quality;
  const onTimeScore = 100 - data.onTime; // 延期率越低越好
  const profitScore = Math.min(data.profit, 50) / 50 * 100;

  const overall = 
    efficiencyScore * 0.3 +
    qualityScore * 0.3 +
    onTimeScore * 0.2 +
    profitScore * 0.2;

  return Math.round(overall);
}
