import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import fs from 'fs';
import path from 'path';

/**
 * 获取数据库初始化SQL
 * GET: 返回完整的初始化SQL脚本
 * POST: 检查并返回需要执行的SQL
 */
export async function GET(request: NextRequest) {
  try {
    // 读取SQL文件
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const seedPath1 = path.join(process.cwd(), 'database', 'seed-data-part1.sql');
    const seedPath2 = path.join(process.cwd(), 'database', 'seed-data-part2.sql');

    let schemaSQL = '';
    let seedSQL1 = '';
    let seedSQL2 = '';

    try {
      schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
    } catch {
      schemaSQL = '-- Schema file not found';
    }

    try {
      seedSQL1 = fs.readFileSync(seedPath1, 'utf-8');
    } catch {
      seedSQL1 = '-- Seed data part1 file not found';
    }

    try {
      seedSQL2 = fs.readFileSync(seedPath2, 'utf-8');
    } catch {
      seedSQL2 = '-- Seed data part2 file not found';
    }

    return NextResponse.json({
      success: true,
      files: {
        schema: '/database/schema.sql',
        seed_part1: '/database/seed-data-part1.sql',
        seed_part2: '/database/seed-data-part2.sql'
      },
      sql: {
        schema: schemaSQL,
        seed_part1: seedSQL1,
        seed_part2: seedSQL2
      }
    });
  } catch (error) {
    console.error('Get init SQL error:', error);
    return NextResponse.json({ error: '获取SQL失败', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'check'; // check, init_schema, init_seed

    // 定义需要检查的表
    const requiredTables = [
      'users', 'roles', 'customers', 'suppliers',
      'materials', 'material_categories', 'inventory', 'inventory_transactions',
      'styles', 'style_boms',
      'production_orders', 'order_details',
      'production_lines', 'processes', 'style_processes',
      'cutting_records', 'cutting_bundles',
      'work_tickets', 'process_tracking',
      'outsource_suppliers', 'bundle_outsource',
      'quality_standards', 'quality_inspections', 'quality_defects',
      'shipments', 'shipment_details',
      'equipment', 'equipment_maintenance',
      'employees', 'attendance', 'salary_records',
      'bills', 'payments',
      'secondary_processes', 'secondary_process_orders',
      'notifications', 'notification_rules',
      'system_config', 'operation_logs'
    ];

    // 检查表是否存在
    const tableStatus: Record<string, boolean> = {};
    
    for (const table of requiredTables) {
      try {
        const { error } = await client.from(table).select('id').limit(1);
        tableStatus[table] = !error || !error.message.includes('does not exist');
      } catch {
        tableStatus[table] = false;
      }
    }

    const existingTables = Object.entries(tableStatus).filter(([_, exists]) => exists).map(([name]) => name);
    const missingTables = Object.entries(tableStatus).filter(([_, exists]) => !exists).map(([name]) => name);

    if (action === 'check') {
      return NextResponse.json({
        success: true,
        message: missingTables.length === 0 ? '所有表已存在' : `缺少 ${missingTables.length} 个表`,
        total: requiredTables.length,
        existing: existingTables.length,
        missing: missingTables.length,
        tableStatus,
        missingTables,
        instruction: missingTables.length > 0 
          ? '请在Supabase SQL编辑器中依次执行以下SQL文件：\n1. database/schema.sql (创建表结构)\n2. database/seed-data-part1.sql (测试数据第一部分)\n3. database/seed-data-part2.sql (测试数据第二部分)'
          : '数据库表结构完整'
      });
    }

    // 读取SQL文件
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const seedPath1 = path.join(process.cwd(), 'database', 'seed-data-part1.sql');
    const seedPath2 = path.join(process.cwd(), 'database', 'seed-data-part2.sql');

    let sql = '';
    try {
      if (action === 'init_schema' || action === 'init_all') {
        sql += fs.readFileSync(schemaPath, 'utf-8') + '\n\n';
      }
      if (action === 'init_seed' || action === 'init_all') {
        sql += fs.readFileSync(seedPath1, 'utf-8') + '\n\n';
        sql += fs.readFileSync(seedPath2, 'utf-8');
      }
    } catch (err) {
      return NextResponse.json({ 
        error: '读取SQL文件失败', 
        details: String(err),
        hint: '请确保 database 目录下存在 schema.sql, seed-data-part1.sql, seed-data-part2.sql 文件'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      action,
      sql,
      instruction: '请在Supabase SQL编辑器中执行以上SQL语句'
    });

  } catch (error) {
    console.error('Init database error:', error);
    return NextResponse.json({ error: '初始化失败', details: String(error) }, { status: 500 });
  }
}
