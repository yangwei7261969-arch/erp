import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 系统提示词 - 服装生产管理专家
const SYSTEM_PROMPT = `你是一位专业的服装生产管理AI助手，帮助用户管理生产订单、库存、财务和质量等业务。

你的能力包括：
1. 生产订单分析 - 查询订单状态、进度、完成率
2. 库存预警 - 分析物料库存、安全库存、补货建议
3. 财务分析 - 收支统计、利润分析、成本分析
4. 质量分析 - 次品率、返工率、质量趋势
5. 智能排产 - 基于订单优先级和产能给出排产建议
6. 异常预警 - 识别延迟订单、低库存、质量问题

回答要求：
- 使用中文回答
- 数据要准确，基于提供的真实数据
- 给出具体的数字和建议
- 如果发现问题，主动提供解决方案
- 使用表格或列表让数据更清晰
- 语气专业、简洁、友好`;

// 业务数据上下文
async function getBusinessContext(): Promise<string> {
  const client = getSupabaseClient();
  const context: string[] = [];

  try {
    // 获取订单统计
    const { data: orders } = await client
      .from('production_orders')
      .select('id, order_no, status, quantity, completed_quantity, plan_end_date, style_name, color, size');

    if (orders && orders.length > 0) {
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        inProgress: orders.filter(o => ['confirmed', 'in_progress'].includes(o.status)).length,
        completed: orders.filter(o => o.status === 'completed').length,
        totalQuantity: orders.reduce((sum, o) => sum + (o.quantity || 0), 0),
        completedQuantity: orders.reduce((sum, o) => sum + (o.completed_quantity || 0), 0),
      };

      context.push(`【生产订单数据】
- 总订单数：${stats.total} 个
- 待处理：${stats.pending} 个
- 进行中：${stats.inProgress} 个
- 已完成：${stats.completed} 个
- 总数量：${stats.totalQuantity} 件
- 已完成数量：${stats.completedQuantity} 件
- 完成率：${stats.totalQuantity > 0 ? ((stats.completedQuantity / stats.totalQuantity) * 100).toFixed(1) : 0}%`);

      // 即将到期订单
      const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const urgentOrders = orders.filter(o => 
        o.plan_end_date && 
        o.plan_end_date <= threeDaysLater && 
        !['completed', 'cancelled'].includes(o.status)
      );

      if (urgentOrders.length > 0) {
        context.push(`\n【紧急订单预警】
以下订单即将到期（3天内）：
${urgentOrders.slice(0, 5).map(o => `- ${o.order_no}: ${o.style_name || '未知款号'} ${o.color || ''} ${o.size || ''}, 计划完成：${o.plan_end_date}`).join('\n')}`);
      }
    }

    // 获取员工统计
    const { data: employees } = await client
      .from('employees')
      .select('id, name, status, department');

    if (employees && employees.length > 0) {
      const activeCount = employees.filter(e => e.status === 'active').length;
      context.push(`\n【员工数据】
- 总员工数：${employees.length} 人
- 在职员工：${activeCount} 人`);
    }

    // 获取财务数据
    const { data: bills } = await client
      .from('bills')
      .select('id, type, amount, bill_date, category');

    if (bills && bills.length > 0) {
      const income = bills.filter(b => b.type === 'income').reduce((sum, b) => sum + (b.amount || 0), 0);
      const expense = bills.filter(b => b.type === 'expense').reduce((sum, b) => sum + (b.amount || 0), 0);
      context.push(`\n【财务数据】
- 总收入：¥${income.toLocaleString()}
- 总支出：¥${expense.toLocaleString()}
- 净利润：¥${(income - expense).toLocaleString()}`);
    }

    // 获取工序数据
    const { data: processes } = await client
      .from('processes')
      .select('id, name, category');

    if (processes && processes.length > 0) {
      context.push(`\n【工序数据】
- 总工序数：${processes.length} 个`);
    }

    // 获取供应商数据
    const { data: suppliers } = await client
      .from('suppliers')
      .select('id, name, status');

    if (suppliers && suppliers.length > 0) {
      const activeCount = suppliers.filter(s => s.status === 'active').length;
      context.push(`\n【供应商数据】
- 总供应商：${suppliers.length} 家
- 合作中：${activeCount} 家`);
    }

  } catch (error) {
    console.error('Error getting business context:', error);
  }

  return context.join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const { messages, stream = true } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: '无效的消息格式' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 获取业务数据上下文
    const businessContext = await getBusinessContext();

    // 构建完整的消息列表
    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `当前业务数据：\n${businessContext}` },
      ...messages,
    ];

    // 初始化LLM客户端
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const llmClient = new LLMClient(config, customHeaders);

    if (stream) {
      // 流式输出
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            const llmStream = llmClient.stream(fullMessages, {
              model: 'doubao-seed-1-6-251015',
              temperature: 0.7,
            });

            for await (const chunk of llmStream) {
              if (chunk.content) {
                const text = chunk.content.toString();
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
              }
            }

            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            console.error('Stream error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: '生成回复时出错' })}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // 非流式输出
      const response = await llmClient.invoke(fullMessages, {
        model: 'doubao-seed-1-6-251015',
        temperature: 0.7,
      });

      return new Response(JSON.stringify({ content: response.content }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('AI chat error:', error);
    return new Response(JSON.stringify({ 
      error: '处理请求失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
