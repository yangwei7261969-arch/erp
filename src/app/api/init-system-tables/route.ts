import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import fs from 'fs';
import path from 'path';

/**
 * 初始化新系统表（利润、异常、KPI）
 * POST: 执行系统表的创建SQL
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json().catch(() => ({}));
    const system = body.system || 'all'; // profit, exception, kpi, all

    const results: any = {};

    // 读取并执行SQL文件
    const executeSQLFile = async (fileName: string, systemName: string) => {
      const filePath = path.join(process.cwd(), 'database', fileName);
      
      try {
        const sql = fs.readFileSync(filePath, 'utf-8');
        
        // 由于Supabase客户端不直接支持执行DDL语句，我们需要返回SQL让用户手动执行
        return {
          success: true,
          file: fileName,
          sql: sql,
          message: `请在Supabase SQL编辑器中执行 ${fileName} 文件`
        };
      } catch (err) {
        return {
          success: false,
          file: fileName,
          error: `读取文件失败: ${String(err)}`
        };
      }
    };

    if (system === 'all' || system === 'profit') {
      results.profit = await executeSQLFile('profit-system.sql', '利润系统');
    }
    
    if (system === 'all' || system === 'exception') {
      results.exception = await executeSQLFile('exception-system.sql', '异常闭环系统');
    }
    
    if (system === 'all' || system === 'kpi') {
      results.kpi = await executeSQLFile('kpi-system.sql', 'KPI绩效系统');
    }

    return NextResponse.json({
      success: true,
      message: '请按照以下步骤初始化系统表',
      results,
      instructions: [
        '1. 登录 Supabase 控制台',
        '2. 进入 SQL Editor',
        '3. 依次执行以下SQL文件:',
        '   - database/profit-system.sql',
        '   - database/exception-system.sql',
        '   - database/kpi-system.sql',
        '4. 执行完成后刷新页面'
      ]
    });

  } catch (error) {
    console.error('Init system tables error:', error);
    return NextResponse.json({ 
      success: false, 
      error: '初始化失败', 
      details: String(error) 
    }, { status: 500 });
  }
}

/**
 * 检查系统表状态
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    
    // 检查利润系统表
    const profitTables = ['order_costs', 'cost_transactions', 'style_cost_standards'];
    const profitStatus: Record<string, boolean> = {};
    
    for (const table of profitTables) {
      try {
        const { error } = await client.from(table).select('id').limit(1);
        profitStatus[table] = !error || !error.message.includes('does not exist');
      } catch {
        profitStatus[table] = false;
      }
    }

    // 检查异常系统表
    const exceptionTables = ['exception_types', 'exceptions', 'exception_handlers', 'exception_actions'];
    const exceptionStatus: Record<string, boolean> = {};
    
    for (const table of exceptionTables) {
      try {
        const { error } = await client.from(table).select('id').limit(1);
        exceptionStatus[table] = !error || !error.message.includes('does not exist');
      } catch {
        exceptionStatus[table] = false;
      }
    }

    // 检查KPI系统表
    const kpiTables = ['employee_kpi_daily', 'line_kpi_daily', 'kpi_alerts', 'kpi_thresholds'];
    const kpiStatus: Record<string, boolean> = {};
    
    for (const table of kpiTables) {
      try {
        const { error } = await client.from(table).select('id').limit(1);
        kpiStatus[table] = !error || !error.message.includes('does not exist');
      } catch {
        kpiStatus[table] = false;
      }
    }

    const allTables = [
      ...Object.entries(profitStatus),
      ...Object.entries(exceptionStatus),
      ...Object.entries(kpiStatus)
    ];
    
    const existingCount = allTables.filter(([_, exists]) => exists).length;
    const missingCount = allTables.filter(([_, exists]) => !exists).length;

    return NextResponse.json({
      success: true,
      summary: {
        total: allTables.length,
        existing: existingCount,
        missing: missingCount,
        isComplete: missingCount === 0
      },
      profit: profitStatus,
      exception: exceptionStatus,
      kpi: kpiStatus,
      instructions: missingCount > 0 ? [
        '请在 Supabase SQL Editor 中依次执行以下SQL文件：',
        '1. database/profit-system.sql',
        '2. database/exception-system.sql',
        '3. database/kpi-system.sql'
      ] : ['所有系统表已创建完成']
    });

  } catch (error) {
    console.error('Check system tables error:', error);
    return NextResponse.json({ 
      success: false, 
      error: '检查失败', 
      details: String(error) 
    }, { status: 500 });
  }
}
