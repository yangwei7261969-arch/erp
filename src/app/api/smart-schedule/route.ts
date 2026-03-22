import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 智能排产API
 * 
 * 核心功能：
 * • 按交期优先级排产
 * • 工序能力匹配
 * • 设备负载均衡
 * • 预计完成时间
 */

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'schedule';

    switch (action) {
      case 'analyze':
        return await analyzeCapacity(client);
      case 'suggest':
        return await suggestSchedule(client, searchParams);
      case 'optimize':
        return await optimizeSchedule(client, searchParams);
      default:
        return await getSchedule(client, searchParams);
    }
  } catch (error) {
    console.error('Smart schedule error:', error);
    return NextResponse.json({ success: false, error: '排产失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { action, data } = body;

    switch (action) {
      case 'create':
        return await createSchedule(client, data);
      case 'update':
        return await updateSchedule(client, data);
      case 'lock':
        return await lockSchedule(client, data);
      case 'swap':
        return await swapSchedule(client, data);
      default:
        return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 });
    }
  } catch (error) {
    console.error('Smart schedule error:', error);
    return NextResponse.json({ success: false, error: '排产操作失败' }, { status: 500 });
  }
}

/**
 * 获取排产计划
 */
async function getSchedule(client: any, searchParams: URLSearchParams) {
  const startDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0];
  const endDate = searchParams.get('end_date') || 
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const lineId = searchParams.get('line_id');

  let query = client
    .from('production_schedule')
    .select(`
      id,
      start_date,
      end_date,
      priority,
      status,
      notes,
      production_orders (
        id,
        order_code,
        delivery_date,
        total_quantity,
        progress,
        customers (name),
        styles (style_name, style_code)
      ),
      production_lines (
        id,
        name,
        capacity
      ),
      assigned_processes (
        id,
        process_id,
        estimated_hours,
        processes (name, code)
      )
    `)
    .gte('start_date', startDate)
    .lte('start_date', endDate)
    .order('priority', { ascending: false });

  if (lineId) {
    query = query.eq('production_line_id', lineId);
  }

  const { data: schedule, error } = await query;

  if (error) throw error;

  // 计算每日负载
  const dailyLoad = await calculateDailyLoad(client, startDate, endDate);

  return NextResponse.json({
    success: true,
    data: {
      schedule,
      dailyLoad,
      conflicts: await detectConflicts(client, schedule)
    }
  });
}

/**
 * 分析产能
 */
async function analyzeCapacity(client: any) {
  // 获取所有产线
  const { data: lines } = await client
    .from('production_lines')
    .select(`
      id,
      name,
      capacity,
      status,
      employees (id)
    `)
    .eq('status', 'active');

  // 获取工序能力
  const { data: processCapabilities } = await client
    .from('process_capabilities')
    .select(`
      production_line_id,
      process_id,
      hourly_capacity,
      processes (name, code)
    `);

  // 获取当前负载
  const today = new Date().toISOString().split('T')[0];
  const { data: currentOrders } = await client
    .from('production_orders')
    .select(`
      id,
      production_line_id,
      total_quantity,
      progress,
      delivery_date
    `)
    .in('status', ['confirmed', 'in_production']);

  // 计算每条线的产能和负载
  const lineAnalysis = (lines || []).map((line: any) => {
    const capabilities = processCapabilities?.filter(
      (c: any) => c.production_line_id === line.id
    ) || [];

    const activeOrders = currentOrders?.filter(
      (o: any) => o.production_line_id === line.id
    ) || [];

    const remainingQty = activeOrders.reduce((sum: number, o: any) => 
      sum + o.total_quantity * (1 - (o.progress || 0) / 100), 0);

    const dailyCapacity = line.capacity * 8; // 假设8小时工作日
    const loadRate = dailyCapacity > 0 ? Math.round(remainingQty / dailyCapacity * 100) : 0;

    // 检查是否有即将到期订单
    const urgentOrders = activeOrders.filter((o: any) => {
      const daysUntilDue = Math.ceil(
        (new Date(o.delivery_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilDue <= 3;
    });

    return {
      id: line.id,
      name: line.name,
      capacity: line.capacity,
      workers: line.employees?.length || 0,
      dailyCapacity,
      currentLoad: remainingQty,
      loadRate,
      capabilities: capabilities.map((c: any) => ({
        processId: c.process_id,
        processName: c.processes?.name,
        hourlyCapacity: c.hourly_capacity
      })),
      urgentOrders: urgentOrders.length,
      status: loadRate > 100 ? 'overload' : loadRate > 80 ? 'busy' : 'available'
    };
  });

  // 瓶颈工序分析
  const bottleneckAnalysis = await analyzeBottleneck(client);

  return NextResponse.json({
    success: true,
    data: {
      lines: lineAnalysis,
      bottlenecks: bottleneckAnalysis,
      summary: {
        totalCapacity: lineAnalysis.reduce((sum: number, l: any) => sum + l.dailyCapacity, 0),
        totalLoad: lineAnalysis.reduce((sum: number, l: any) => sum + l.currentLoad, 0),
        availableLines: lineAnalysis.filter((l: any) => l.status === 'available').length,
        overloadedLines: lineAnalysis.filter((l: any) => l.status === 'overload').length
      }
    }
  });
}

/**
 * 智能排产建议
 */
async function suggestSchedule(client: any, searchParams: URLSearchParams) {
  const orderId = searchParams.get('order_id');

  if (!orderId) {
    return NextResponse.json({ 
      success: false, 
      error: '缺少订单ID' 
    }, { status: 400 });
  }

  // 获取订单详情
  const { data: order } = await client
    .from('production_orders')
    .select(`
      id,
      order_code,
      total_quantity,
      delivery_date,
      status,
      customers (name),
      styles (
        id,
        style_name,
        style_code,
        style_processes (
          process_id,
          estimated_time,
          sequence,
          processes (id, name, code, category)
        )
      )
    `)
    .eq('id', orderId)
    .single();

  if (!order) {
    return NextResponse.json({ 
      success: false, 
      error: '订单不存在' 
    }, { status: 404 });
  }

  // 获取可用的产线
  const { data: lines } = await client
    .from('production_lines')
    .select(`
      id,
      name,
      capacity,
      process_capabilities (
        process_id,
        hourly_capacity
      ),
      production_schedule (
        start_date,
        end_date,
        status
      )
    `)
    .eq('status', 'active');

  // 计算每个产线的适配度
  const suggestions = (lines || []).map((line: any) => {
    const score = calculateLineScore(order, line);
    const estimatedTime = calculateEstimatedTime(order, line);
    const startDate = findEarliestStartDate(line, estimatedTime);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + estimatedTime);

    return {
      lineId: line.id,
      lineName: line.name,
      score,
      estimatedTime,
      suggestedStart: startDate.toISOString(),
      suggestedEnd: endDate.toISOString(),
      canMeetDeadline: new Date(endDate) <= new Date(order.delivery_date),
      reasons: generateReasons(order, line, score)
    };
  });

  // 按分数排序
  suggestions.sort((a: any, b: any) => b.score - a.score);

  return NextResponse.json({
    success: true,
    data: {
      order: {
        id: order.id,
        code: order.order_code,
        quantity: order.total_quantity,
        deliveryDate: order.delivery_date,
        customer: order.customers?.name,
        style: order.styles?.style_name
      },
      suggestions: suggestions.slice(0, 5),
      bestMatch: suggestions[0]
    }
  });
}

/**
 * 计算产线适配分数
 */
function calculateLineScore(order: any, line: any): number {
  let score = 100;

  // 1. 工序能力匹配 (40分)
  const requiredProcesses = order.styles?.style_processes || [];
  const availableProcesses = line.process_capabilities || [];
  
  const matchedProcesses = requiredProcesses.filter((rp: any) => 
    availableProcesses.some((ap: any) => ap.process_id === rp.process_id)
  );
  const processMatchRate = requiredProcesses.length > 0 
    ? matchedProcesses.length / requiredProcesses.length 
    : 0;
  score += processMatchRate * 40;

  // 2. 产能匹配 (30分)
  const dailyCapacity = line.capacity * 8;
  const daysNeeded = order.total_quantity / dailyCapacity;
  const daysUntilDue = Math.ceil(
    (new Date(order.delivery_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysNeeded <= daysUntilDue) {
    score += 30;
  } else {
    score -= (daysNeeded - daysUntilDue) * 5;
  }

  // 3. 负载情况 (20分)
  const currentSchedule = line.production_schedule || [];
  const busySlots = currentSchedule.filter((s: any) => 
    new Date(s.start_date) <= new Date(order.delivery_date)
  );
  score -= busySlots.length * 2;

  // 4. 历史表现 (10分) - 可扩展

  return Math.max(0, Math.min(100, score));
}

/**
 * 计算预估时间
 */
function calculateEstimatedTime(order: any, line: any): number {
  const dailyCapacity = line.capacity * 8;
  const baseHours = Math.ceil(order.total_quantity / line.capacity);

  // 考虑工序复杂度
  const processes: any[] = order.styles?.style_processes || [];
  const complexityFactor = 1 + (processes.length * 0.05);

  return Math.ceil(baseHours * complexityFactor);
}

/**
 * 找到最早可开始时间
 */
function findEarliestStartDate(line: any, estimatedHours: number): Date {
  const now = new Date();
  now.setHours(8, 0, 0, 0); // 从早上8点开始

  const schedule = line.production_schedule || [];
  
  if (schedule.length === 0) {
    return now;
  }

  // 找到最近结束的任务
  const sortedSchedule = schedule
    .filter((s: any) => s.status !== 'cancelled')
    .sort((a: any, b: any) => 
      new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
    );

  if (sortedSchedule.length > 0) {
    const lastEnd = new Date(sortedSchedule[0].end_date);
    if (lastEnd > now) {
      return lastEnd;
    }
  }

  return now;
}

/**
 * 生成推荐理由
 */
function generateReasons(order: any, line: any, score: number): string[] {
  const reasons: string[] = [];

  const requiredProcesses = order.styles?.style_processes || [];
  const availableProcesses = line.process_capabilities || [];
  const matchedCount = requiredProcesses.filter((rp: any) => 
    availableProcesses.some((ap: any) => ap.process_id === rp.process_id)
  ).length;

  if (matchedCount === requiredProcesses.length) {
    reasons.push('✓ 支持所有工序');
  } else if (matchedCount > 0) {
    reasons.push(`△ 支持 ${matchedCount}/${requiredProcesses.length} 道工序`);
  }

  const dailyCapacity = line.capacity * 8;
  const daysNeeded = Math.ceil(order.total_quantity / dailyCapacity);
  const daysUntilDue = Math.ceil(
    (new Date(order.delivery_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysNeeded <= daysUntilDue) {
    reasons.push(`✓ 产能充足，预计 ${daysNeeded} 天完成`);
  } else {
    reasons.push(`⚠ 产能紧张，需 ${daysNeeded} 天，距交期仅 ${daysUntilDue} 天`);
  }

  if (score >= 80) {
    reasons.push('✓ 综合评估优秀');
  }

  return reasons;
}

/**
 * 分析瓶颈工序
 */
async function analyzeBottleneck(client: any) {
  // 获取各工序的平均耗时和等待时间
  const { data: processStats } = await client
    .from('process_tracking')
    .select(`
      process_id,
      start_time,
      end_time,
      quantity,
      processes (name, code)
    `)
    .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .eq('status', 'completed');

  const processAnalysis: Record<string, {
    processId: string;
    processName: string;
    totalQuantity: number;
    totalTime: number;
    count: number;
  }> = {};

  processStats?.forEach((stat: any) => {
    if (!processAnalysis[stat.process_id]) {
      processAnalysis[stat.process_id] = {
        processId: stat.process_id,
        processName: stat.processes?.name || '未知工序',
        totalQuantity: 0,
        totalTime: 0,
        count: 0
      };
    }
    
    processAnalysis[stat.process_id].totalQuantity += stat.quantity || 0;
    if (stat.start_time && stat.end_time) {
      const duration = new Date(stat.end_time).getTime() - new Date(stat.start_time).getTime();
      processAnalysis[stat.process_id].totalTime += duration;
    }
    processAnalysis[stat.process_id].count++;
  });

  // 计算平均效率并找出瓶颈
  const results = Object.values(processAnalysis).map(p => ({
    ...p,
    avgTimePerUnit: p.totalQuantity > 0 ? p.totalTime / p.totalQuantity : 0
  }));

  results.sort((a, b) => b.avgTimePerUnit - a.avgTimePerUnit);

  return {
    slowest: results.slice(0, 3),
    fastest: results.slice(-3).reverse()
  };
}

/**
 * 计算每日负载
 */
async function calculateDailyLoad(client: any, startDate: string, endDate: string) {
  const dailyLoad: Record<string, number> = {};
  
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    
    const { data } = await client
      .from('production_schedule')
      .select('production_orders (total_quantity)')
      .lte('start_date', `${dateStr}T23:59:59Z`)
      .gte('end_date', `${dateStr}T00:00:00Z`);

    dailyLoad[dateStr] = data?.reduce((sum: number, item: any) => 
      sum + (item.production_orders?.total_quantity || 0), 0) || 0;

    current.setDate(current.getDate() + 1);
  }

  return dailyLoad;
}

/**
 * 检测冲突
 */
async function detectConflicts(client: any, schedule: any[]) {
  const conflicts: any[] = [];

  schedule?.forEach((item: any) => {
    // 检查时间重叠
    const overlapping = schedule.filter((other: any) => 
      other.id !== item.id &&
      other.production_line_id === item.production_line_id &&
      new Date(other.start_date) < new Date(item.end_date) &&
      new Date(other.end_date) > new Date(item.start_date)
    );

    if (overlapping.length > 0) {
      conflicts.push({
        type: 'time_overlap',
        scheduleId: item.id,
        message: `排产计划时间重叠`,
        details: overlapping.map((o: any) => ({
          id: o.id,
          orderCode: o.production_orders?.order_code
        }))
      });
    }

    // 检查是否可能延期
    if (new Date(item.end_date) > new Date(item.production_orders?.delivery_date)) {
      conflicts.push({
        type: 'deadline_risk',
        scheduleId: item.id,
        message: `计划完成时间晚于交期`,
        endDate: item.end_date,
        deliveryDate: item.production_orders?.delivery_date
      });
    }
  });

  return conflicts;
}

/**
 * 创建排产计划
 */
async function createSchedule(client: any, data: any) {
  const {
    orderId,
    lineId,
    startDate,
    endDate,
    priority,
    notes,
    processes
  } = data;

  // 创建主排产记录
  const { data: schedule, error } = await client
    .from('production_schedule')
    .insert({
      production_order_id: orderId,
      production_line_id: lineId,
      start_date: startDate,
      end_date: endDate,
      priority: priority || 5,
      status: 'planned',
      notes
    })
    .select()
    .single();

  if (error) throw error;

  // 分配工序
  if (processes && processes.length > 0) {
    await client
      .from('assigned_processes')
      .insert(processes.map((p: any) => ({
        schedule_id: schedule.id,
        process_id: p.processId,
        estimated_hours: p.estimatedHours
      })));
  }

  // 更新订单状态
  await client
    .from('production_orders')
    .update({ 
      status: 'scheduled',
      production_line_id: lineId
    })
    .eq('id', orderId);

  // 记录审计日志
  await client
    .from('audit_logs')
    .insert({
      action: 'create_schedule',
      entity_type: 'production_schedule',
      entity_id: schedule.id,
      details: { orderId, lineId, startDate, endDate }
    });

  return NextResponse.json({
    success: true,
    data: schedule
  });
}

/**
 * 更新排产计划
 */
async function updateSchedule(client: any, data: any) {
  const { scheduleId, updates } = data;

  const { data: schedule, error } = await client
    .from('production_schedule')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', scheduleId)
    .select()
    .single();

  if (error) throw error;

  // 记录审计日志
  await client
    .from('audit_logs')
    .insert({
      action: 'update_schedule',
      entity_type: 'production_schedule',
      entity_id: scheduleId,
      details: updates
    });

  return NextResponse.json({
    success: true,
    data: schedule
  });
}

/**
 * 锁定排产计划
 */
async function lockSchedule(client: any, data: any) {
  const { scheduleId, locked } = data;

  const { error } = await client
    .from('production_schedule')
    .update({
      status: locked ? 'locked' : 'planned',
      updated_at: new Date().toISOString()
    })
    .eq('id', scheduleId);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    message: locked ? '排产计划已锁定' : '排产计划已解锁'
  });
}

/**
 * 交换排产顺序
 */
async function swapSchedule(client: any, data: any) {
  const { scheduleId1, scheduleId2 } = data;

  // 获取两个排产计划
  const { data: schedules } = await client
    .from('production_schedule')
    .select('*')
    .in('id', [scheduleId1, scheduleId2]);

  if (!schedules || schedules.length !== 2) {
    return NextResponse.json({ 
      success: false, 
      error: '找不到排产计划' 
    }, { status: 404 });
  }

  const [s1, s2] = schedules;

  // 交换时间
  await Promise.all([
    client
      .from('production_schedule')
      .update({
        start_date: s2.start_date,
        end_date: s2.end_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', s1.id),
    client
      .from('production_schedule')
      .update({
        start_date: s1.start_date,
        end_date: s1.end_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', s2.id)
  ]);

  // 记录审计日志
  await client
    .from('audit_logs')
    .insert({
      action: 'swap_schedule',
      entity_type: 'production_schedule',
      details: { scheduleId1, scheduleId2 }
    });

  return NextResponse.json({
    success: true,
    message: '排产顺序已交换'
  });
}

/**
 * 优化排产（重新排序）
 */
async function optimizeSchedule(client: any, searchParams: URLSearchParams) {
  const lineId = searchParams.get('line_id');

  // 获取待排产的订单
  let query = client
    .from('production_orders')
    .select(`
      id,
      order_code,
      total_quantity,
      delivery_date,
      priority,
      customers (name),
      styles (style_name)
    `)
    .in('status', ['confirmed', 'scheduled'])
    .order('delivery_date', { ascending: true });

  if (lineId) {
    query = query.eq('production_line_id', lineId);
  }

  const { data: orders } = await query;

  if (!orders || orders.length === 0) {
    return NextResponse.json({
      success: true,
      data: { message: '没有待优化的订单' }
    });
  }

  // 按优先级和交期排序
  const optimized: any[] = (orders || []).sort((a: any, b: any) => {
    // 首先按优先级
    if (a.priority !== b.priority) {
      return (b.priority || 0) - (a.priority || 0);
    }
    // 然后按交期
    return new Date(a.delivery_date).getTime() - new Date(b.delivery_date).getTime();
  });

  return NextResponse.json({
    success: true,
    data: {
      original: orders.map((o: any) => o.order_code),
      optimized: optimized.map((o: any) => ({
        id: o.id,
        code: o.order_code,
        deliveryDate: o.delivery_date,
        priority: o.priority,
        customer: o.customers?.name
      }))
    }
  });
}
