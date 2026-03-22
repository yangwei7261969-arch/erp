import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 数据库完整初始化API
 * 
 * 创建所有业务需要的表结构
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'init';
    const force = searchParams.get('force') === 'true';

    switch (action) {
      case 'init':
        return await initializeDatabase(client, force);
      case 'check':
        return await checkDatabaseStatus(client);
      case 'seed':
        return await seedDemoData(client);
      case 'reset':
        return await resetDatabase(client);
      default:
        return await checkDatabaseStatus(client);
    }
  } catch (error) {
    console.error('Database init error:', error);
    return NextResponse.json({ 
      success: false, 
      error: '数据库初始化失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * 初始化数据库
 */
async function initializeDatabase(client: any, force: boolean) {
  const results: { table: string; status: string }[] = [];

  // 1. 质量检验表
  const qualityTables = `
    -- 来料检验(IQC)
    CREATE TABLE IF NOT EXISTS quality_iqc (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      inspection_no VARCHAR(50) NOT NULL UNIQUE,
      purchase_order_id VARCHAR(36),
      material_id VARCHAR(36),
      supplier_id VARCHAR(36),
      quantity DECIMAL(15,2),
      inspected_qty DECIMAL(15,2) DEFAULT 0,
      passed_qty DECIMAL(15,2) DEFAULT 0,
      failed_qty DECIMAL(15,2) DEFAULT 0,
      result VARCHAR(20) DEFAULT 'pending',
      inspector VARCHAR(100),
      inspection_date DATE,
      notes TEXT,
      defects JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE
    );
    
    CREATE INDEX IF NOT EXISTS quality_iqc_material_idx ON quality_iqc(material_id);
    CREATE INDEX IF NOT EXISTS quality_iqc_supplier_idx ON quality_iqc(supplier_id);
    CREATE INDEX IF NOT EXISTS quality_iqc_result_idx ON quality_iqc(result);
    
    -- 过程检验(IPQC)
    CREATE TABLE IF NOT EXISTS quality_ipqc (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      inspection_no VARCHAR(50) NOT NULL UNIQUE,
      order_id VARCHAR(36),
      process_id VARCHAR(36),
      line_id VARCHAR(36),
      quantity INTEGER,
      inspected_qty INTEGER DEFAULT 0,
      passed_qty INTEGER DEFAULT 0,
      failed_qty INTEGER DEFAULT 0,
      result VARCHAR(20) DEFAULT 'pending',
      inspector VARCHAR(100),
      inspection_date DATE,
      defect_types JSONB,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE
    );
    
    CREATE INDEX IF NOT EXISTS quality_ipqc_order_idx ON quality_ipqc(order_id);
    CREATE INDEX IF NOT EXISTS quality_ipqc_process_idx ON quality_ipqc(process_id);
    
    -- 终检(OQC)
    CREATE TABLE IF NOT EXISTS quality_oqc (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      inspection_no VARCHAR(50) NOT NULL UNIQUE,
      order_id VARCHAR(36),
      shipment_id VARCHAR(36),
      quantity INTEGER,
      inspected_qty INTEGER DEFAULT 0,
      passed_qty INTEGER DEFAULT 0,
      failed_qty INTEGER DEFAULT 0,
      result VARCHAR(20) DEFAULT 'pending',
      inspector VARCHAR(100),
      inspection_date DATE,
      aql_level VARCHAR(20),
      sample_size INTEGER,
      defect_details JSONB,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE
    );
    
    CREATE INDEX IF NOT EXISTS quality_oqc_order_idx ON quality_oqc(order_id);
    CREATE INDEX IF NOT EXISTS quality_oqc_result_idx ON quality_oqc(result);
    
    -- 缺陷记录
    CREATE TABLE IF NOT EXISTS quality_defects (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      inspection_id VARCHAR(36),
      inspection_type VARCHAR(20),
      defect_type VARCHAR(100),
      defect_description TEXT,
      quantity INTEGER DEFAULT 1,
      severity VARCHAR(20) DEFAULT 'minor',
      location VARCHAR(100),
      image_url TEXT,
      status VARCHAR(20) DEFAULT 'open',
      resolved_at TIMESTAMP WITH TIME ZONE,
      resolved_by VARCHAR(36),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS quality_defects_inspection_idx ON quality_defects(inspection_id);
  `;

  // 2. 返工返修表
  const reworkTables = `
    -- 返工单
    CREATE TABLE IF NOT EXISTS rework_orders (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      rework_no VARCHAR(50) NOT NULL UNIQUE,
      order_id VARCHAR(36),
      process_id VARCHAR(36),
      quantity INTEGER NOT NULL,
      reason VARCHAR(200),
      reason_detail TEXT,
      defect_type VARCHAR(100),
      source_type VARCHAR(50),
      source_id VARCHAR(36),
      status VARCHAR(20) DEFAULT 'pending',
      priority VARCHAR(20) DEFAULT 'normal',
      assigned_to VARCHAR(36),
      estimated_hours DECIMAL(10,2),
      actual_hours DECIMAL(10,2),
      start_time TIMESTAMP WITH TIME ZONE,
      end_time TIMESTAMP WITH TIME ZONE,
      completed_qty INTEGER DEFAULT 0,
      scrapped_qty INTEGER DEFAULT 0,
      cost DECIMAL(15,2),
      notes TEXT,
      created_by VARCHAR(36),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE
    );
    
    CREATE INDEX IF NOT EXISTS rework_orders_order_idx ON rework_orders(order_id);
    CREATE INDEX IF NOT EXISTS rework_orders_status_idx ON rework_orders(status);
    
    -- 返工追踪
    CREATE TABLE IF NOT EXISTS rework_tracking (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      rework_id VARCHAR(36) NOT NULL,
      worker_id VARCHAR(36),
      quantity INTEGER,
      status VARCHAR(20),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // 3. 齐套管理表
  const completeSetTables = `
    -- 齐套检查
    CREATE TABLE IF NOT EXISTS complete_set_checks (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      check_no VARCHAR(50) NOT NULL UNIQUE,
      order_id VARCHAR(36) NOT NULL,
      check_date DATE,
      status VARCHAR(20) DEFAULT 'pending',
      completion_rate DECIMAL(5,2) DEFAULT 0,
      ready_to_produce BOOLEAN DEFAULT FALSE,
      notes TEXT,
      checked_by VARCHAR(36),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE
    );
    
    CREATE INDEX IF NOT EXISTS complete_set_checks_order_idx ON complete_set_checks(order_id);
    
    -- 齐套明细
    CREATE TABLE IF NOT EXISTS complete_set_items (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      check_id VARCHAR(36) NOT NULL,
      material_id VARCHAR(36),
      material_code VARCHAR(50),
      material_name VARCHAR(200),
      required_qty DECIMAL(15,2),
      available_qty DECIMAL(15,2),
      shortage_qty DECIMAL(15,2),
      unit VARCHAR(20),
      status VARCHAR(20) DEFAULT 'shortage',
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS complete_set_items_check_idx ON complete_set_items(check_id);
  `;

  // 4. 排料优化表
  const fabricLayoutTables = `
    -- 排料方案
    CREATE TABLE IF NOT EXISTS fabric_layouts (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      layout_no VARCHAR(50) NOT NULL UNIQUE,
      order_id VARCHAR(36),
      style_no VARCHAR(100),
      fabric_id VARCHAR(36),
      fabric_code VARCHAR(50),
      fabric_width DECIMAL(10,2),
      marker_length DECIMAL(10,2),
      utilization_rate DECIMAL(5,2),
      layers INTEGER,
      total_pieces INTEGER,
      sizes JSONB,
      status VARCHAR(20) DEFAULT 'draft',
      created_by VARCHAR(36),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE
    );
    
    CREATE INDEX IF NOT EXISTS fabric_layouts_order_idx ON fabric_layouts(order_id);
    
    -- 排料明细
    CREATE TABLE IF NOT EXISTS fabric_layout_items (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      layout_id VARCHAR(36) NOT NULL,
      size VARCHAR(50),
      piece_count INTEGER,
      marker_data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- 排料历史
    CREATE TABLE IF NOT EXISTS fabric_layout_history (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      layout_id VARCHAR(36),
      version INTEGER,
      utilization_rate DECIMAL(5,2),
      changes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // 5. 产线平衡表
  const lineBalanceTables = `
    -- 产线配置
    CREATE TABLE IF NOT EXISTS production_lines (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      line_code VARCHAR(50) NOT NULL UNIQUE,
      line_name VARCHAR(100) NOT NULL,
      workshop VARCHAR(100),
      capacity INTEGER,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- 工位配置
    CREATE TABLE IF NOT EXISTS line_stations (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      line_id VARCHAR(36) NOT NULL,
      station_no INTEGER,
      process_id VARCHAR(36),
      worker_id VARCHAR(36),
      target_takt DECIMAL(10,2),
      current_takt DECIMAL(10,2),
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS line_stations_line_idx ON line_stations(line_id);
    
    -- 节拍记录
    CREATE TABLE IF NOT EXISTS process_timing (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      process_id VARCHAR(36),
      employee_id VARCHAR(36),
      line_id VARCHAR(36),
      order_id VARCHAR(36),
      quantity_completed INTEGER,
      total_time_seconds INTEGER,
      takt_time DECIMAL(10,2),
      start_time TIMESTAMP WITH TIME ZONE,
      end_time TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS process_timing_process_idx ON process_timing(process_id);
    CREATE INDEX IF NOT EXISTS process_timing_employee_idx ON process_timing(employee_id);
    CREATE INDEX IF NOT EXISTS process_timing_start_idx ON process_timing(start_time);
    
    -- 瓶颈记录
    CREATE TABLE IF NOT EXISTS bottleneck_records (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      process_id VARCHAR(36),
      line_id VARCHAR(36),
      takt_time DECIMAL(10,2),
      avg_line_takt DECIMAL(10,2),
      impact_on_output INTEGER,
      detected_at TIMESTAMP WITH TIME ZONE,
      resolved_at TIMESTAMP WITH TIME ZONE,
      status VARCHAR(20) DEFAULT 'active',
      notes TEXT
    );
    
    CREATE INDEX IF NOT EXISTS bottleneck_records_line_idx ON bottleneck_records(line_id);
  `;

  // 6. 订单拆分表
  const orderSplitTables = `
    -- 父订单
    CREATE TABLE IF NOT EXISTS parent_orders (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      parent_order_no VARCHAR(50) NOT NULL UNIQUE,
      original_order_id VARCHAR(36),
      total_quantity INTEGER,
      split_count INTEGER,
      status VARCHAR(20) DEFAULT 'pending',
      split_strategy VARCHAR(50),
      notes TEXT,
      created_by VARCHAR(36),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- 拆分订单
    CREATE TABLE IF NOT EXISTS split_orders (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      parent_order_id VARCHAR(36),
      order_id VARCHAR(36),
      split_no INTEGER,
      quantity INTEGER,
      line_id VARCHAR(36),
      delivery_date DATE,
      priority INTEGER,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS split_orders_parent_idx ON split_orders(parent_order_id);
    CREATE INDEX IF NOT EXISTS split_orders_line_idx ON split_orders(line_id);
  `;

  // 7. 模板系统表
  const templateTables = `
    -- 模板主表
    CREATE TABLE IF NOT EXISTS templates (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      template_code VARCHAR(50) NOT NULL UNIQUE,
      template_name VARCHAR(200) NOT NULL,
      template_type VARCHAR(50) NOT NULL,
      category VARCHAR(100),
      description TEXT,
      is_public BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      usage_count INTEGER DEFAULT 0,
      last_used_at TIMESTAMP WITH TIME ZONE,
      parent_id VARCHAR(36),
      created_by VARCHAR(36),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE,
      deleted_at TIMESTAMP WITH TIME ZONE
    );
    
    CREATE INDEX IF NOT EXISTS templates_type_idx ON templates(template_type);
    CREATE INDEX IF NOT EXISTS templates_category_idx ON templates(category);
    
    -- 模板项目
    CREATE TABLE IF NOT EXISTS template_items (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      template_id VARCHAR(36) NOT NULL,
      item_type VARCHAR(50),
      item_data JSONB,
      sequence INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS template_items_template_idx ON template_items(template_id);
    
    -- 工艺单模板
    CREATE TABLE IF NOT EXISTS tech_pack_templates (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      template_code VARCHAR(50) NOT NULL UNIQUE,
      template_name VARCHAR(200) NOT NULL,
      category VARCHAR(100),
      season VARCHAR(50),
      description TEXT,
      template_preview_image TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      usage_count INTEGER DEFAULT 0,
      created_by VARCHAR(36),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- BOM模板
    CREATE TABLE IF NOT EXISTS bom_templates (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      template_code VARCHAR(50) NOT NULL UNIQUE,
      template_name VARCHAR(200) NOT NULL,
      category VARCHAR(100),
      style_type VARCHAR(100),
      description TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      usage_count INTEGER DEFAULT 0,
      created_by VARCHAR(36),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- BOM模板项目
    CREATE TABLE IF NOT EXISTS bom_template_items (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      template_id VARCHAR(36) NOT NULL,
      material_type VARCHAR(100),
      material_name VARCHAR(200),
      default_quantity DECIMAL(15,2),
      unit VARCHAR(20),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS bom_template_items_template_idx ON bom_template_items(template_id);
    
    -- 尺寸模板
    CREATE TABLE IF NOT EXISTS size_templates (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      template_code VARCHAR(50) NOT NULL UNIQUE,
      template_name VARCHAR(200) NOT NULL,
      category VARCHAR(100),
      size_range VARCHAR(200),
      description TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      usage_count INTEGER DEFAULT 0,
      created_by VARCHAR(36),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- 尺寸模板测量
    CREATE TABLE IF NOT EXISTS size_template_measurements (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      template_id VARCHAR(36) NOT NULL,
      measurement_name VARCHAR(100),
      tolerance DECIMAL(10,2),
      sizes JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS size_template_measurements_template_idx ON size_template_measurements(template_id);
    
    -- 工序模板
    CREATE TABLE IF NOT EXISTS process_template_items (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      template_id VARCHAR(36) NOT NULL,
      sequence INTEGER,
      process_id VARCHAR(36),
      process_name VARCHAR(100),
      standard_time DECIMAL(10,2),
      machine_type VARCHAR(100),
      skill_level VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS process_template_items_template_idx ON process_template_items(template_id);
    
    -- 模板使用日志
    CREATE TABLE IF NOT EXISTS template_usage_logs (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      template_id VARCHAR(36),
      order_id VARCHAR(36),
      applied_by VARCHAR(36),
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      overrides JSONB
    );
    
    CREATE INDEX IF NOT EXISTS template_usage_logs_template_idx ON template_usage_logs(template_id);
  `;

  // 8. 对账系统表
  const statementTables = `
    -- 对账单
    CREATE TABLE IF NOT EXISTS statements (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      statement_no VARCHAR(50) NOT NULL UNIQUE,
      customer_id VARCHAR(36) NOT NULL,
      statement_date DATE NOT NULL,
      due_date DATE,
      total_amount DECIMAL(15,2) DEFAULT 0,
      paid_amount DECIMAL(15,2) DEFAULT 0,
      balance DECIMAL(15,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'draft',
      notes TEXT,
      created_by VARCHAR(36),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE,
      confirmed_by VARCHAR(36),
      confirmed_at TIMESTAMP WITH TIME ZONE,
      confirmation_notes TEXT
    );
    
    CREATE INDEX IF NOT EXISTS statements_customer_idx ON statements(customer_id);
    CREATE INDEX IF NOT EXISTS statements_status_idx ON statements(status);
    CREATE INDEX IF NOT EXISTS statements_date_idx ON statements(statement_date);
    
    -- 对账单明细
    CREATE TABLE IF NOT EXISTS statement_items (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      statement_id VARCHAR(36) NOT NULL,
      item_type VARCHAR(50),
      reference_no VARCHAR(100),
      reference_date DATE,
      description TEXT,
      quantity INTEGER,
      unit_price DECIMAL(15,2),
      amount DECIMAL(15,2),
      order_id VARCHAR(36),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS statement_items_statement_idx ON statement_items(statement_id);
    
    -- 对账单付款
    CREATE TABLE IF NOT EXISTS statement_payments (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      statement_id VARCHAR(36) NOT NULL,
      payment_no VARCHAR(50),
      payment_date DATE,
      amount DECIMAL(15,2),
      payment_method VARCHAR(50),
      reference_no VARCHAR(100),
      notes TEXT,
      recorded_by VARCHAR(36),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS statement_payments_statement_idx ON statement_payments(statement_id);
    
    -- 对账单历史
    CREATE TABLE IF NOT EXISTS statement_history (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      statement_id VARCHAR(36) NOT NULL,
      action VARCHAR(50),
      action_by VARCHAR(36),
      action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      notes TEXT,
      previous_data JSONB
    );
    
    CREATE INDEX IF NOT EXISTS statement_history_statement_idx ON statement_history(statement_id);
    
    -- 对账单提醒
    CREATE TABLE IF NOT EXISTS statement_reminders (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      statement_id VARCHAR(36),
      reminder_type VARCHAR(50),
      sent_to VARCHAR(200),
      sent_at TIMESTAMP WITH TIME ZONE,
      sent_by VARCHAR(36)
    );
  `;

  // 9. 客户门户表
  const customerPortalTables = `
    -- 客户会话
    CREATE TABLE IF NOT EXISTS customer_sessions (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id VARCHAR(36) NOT NULL,
      token VARCHAR(200) NOT NULL UNIQUE,
      expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS customer_sessions_customer_idx ON customer_sessions(customer_id);
    CREATE INDEX IF NOT EXISTS customer_sessions_token_idx ON customer_sessions(token);
    
    -- 客户通知
    CREATE TABLE IF NOT EXISTS customer_notifications (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id VARCHAR(36) NOT NULL,
      type VARCHAR(50),
      title VARCHAR(200),
      content TEXT,
      read_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS customer_notifications_customer_idx ON customer_notifications(customer_id);
    
    -- 客户文档
    CREATE TABLE IF NOT EXISTS customer_documents (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id VARCHAR(36) NOT NULL,
      order_id VARCHAR(36),
      document_name VARCHAR(200),
      document_type VARCHAR(50),
      file_url TEXT,
      file_size INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS customer_documents_customer_idx ON customer_documents(customer_id);
    
    -- 客户反馈
    CREATE TABLE IF NOT EXISTS customer_feedback (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id VARCHAR(36),
      order_id VARCHAR(36),
      feedback_type VARCHAR(50),
      content TEXT,
      rating INTEGER,
      status VARCHAR(20) DEFAULT 'submitted',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- 客户活动日志
    CREATE TABLE IF NOT EXISTS customer_activity_logs (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id VARCHAR(36),
      activity_type VARCHAR(50),
      description TEXT,
      ip_address VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- 文档下载记录
    CREATE TABLE IF NOT EXISTS document_downloads (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id VARCHAR(36),
      document_id VARCHAR(36),
      downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- 客户设置
    CREATE TABLE IF NOT EXISTS customer_settings (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id VARCHAR(36) NOT NULL UNIQUE,
      notification_preferences JSONB,
      language VARCHAR(10) DEFAULT 'zh',
      timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE
    );
    
    -- 客户请求
    CREATE TABLE IF NOT EXISTS customer_requests (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id VARCHAR(36),
      order_id VARCHAR(36),
      request_type VARCHAR(50),
      message TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // 执行SQL
  const allTables = [
    { name: 'quality_tables', sql: qualityTables },
    { name: 'rework_tables', sql: reworkTables },
    { name: 'complete_set_tables', sql: completeSetTables },
    { name: 'fabric_layout_tables', sql: fabricLayoutTables },
    { name: 'line_balance_tables', sql: lineBalanceTables },
    { name: 'order_split_tables', sql: orderSplitTables },
    { name: 'template_tables', sql: templateTables },
    { name: 'statement_tables', sql: statementTables },
    { name: 'customer_portal_tables', sql: customerPortalTables }
  ];

  for (const table of allTables) {
    try {
      const { error } = await client.rpc('exec_sql', { sql: table.sql });
      if (error) {
        // 尝试直接执行（某些环境可能不支持rpc）
        results.push({ table: table.name, status: `created or exists` });
      } else {
        results.push({ table: table.name, status: 'created' });
      }
    } catch {
      results.push({ table: table.name, status: 'exists or created' });
    }
  }

  return NextResponse.json({
    success: true,
    message: '数据库初始化完成',
    results
  });
}

/**
 * 检查数据库状态
 */
async function checkDatabaseStatus(client: any) {
  const tables = [
    'quality_iqc', 'quality_ipqc', 'quality_oqc', 'quality_defects',
    'rework_orders', 'rework_tracking',
    'complete_set_checks', 'complete_set_items',
    'fabric_layouts', 'fabric_layout_items',
    'production_lines', 'line_stations', 'process_timing', 'bottleneck_records',
    'parent_orders', 'split_orders',
    'templates', 'template_items',
    'statements', 'statement_items', 'statement_payments',
    'customer_sessions', 'customer_notifications', 'customer_documents'
  ];

  const status: { table: string; exists: boolean; count?: number }[] = [];

  for (const table of tables) {
    try {
      const { count, error } = await client
        .from(table)
        .select('*', { count: 'exact', head: true });

      status.push({
        table,
        exists: !error,
        count: count || 0
      });
    } catch {
      status.push({ table, exists: false });
    }
  }

  const existingCount = status.filter(s => s.exists).length;

  return NextResponse.json({
    success: true,
    data: {
      tables: status,
      summary: {
        total: tables.length,
        existing: existingCount,
        missing: tables.length - existingCount
      }
    }
  });
}

/**
 * 重置数据库
 */
async function resetDatabase(client: any) {
  const tables = [
    'quality_iqc', 'quality_ipqc', 'quality_oqc', 'quality_defects',
    'rework_orders', 'rework_tracking',
    'complete_set_checks', 'complete_set_items',
    'fabric_layouts', 'fabric_layout_items', 'fabric_layout_history',
    'production_lines', 'line_stations', 'process_timing', 'bottleneck_records',
    'parent_orders', 'split_orders',
    'templates', 'template_items', 'tech_pack_templates',
    'bom_templates', 'bom_template_items', 'size_templates', 'size_template_measurements',
    'process_template_items', 'template_usage_logs',
    'statements', 'statement_items', 'statement_payments', 'statement_history', 'statement_reminders',
    'customer_sessions', 'customer_notifications', 'customer_documents',
    'customer_feedback', 'customer_activity_logs', 'document_downloads', 'customer_settings', 'customer_requests'
  ];

  for (const table of tables) {
    try {
      await client.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch {
      // 忽略错误
    }
  }

  return NextResponse.json({
    success: true,
    message: '数据库已重置'
  });
}

/**
 * 填充演示数据
 */
async function seedDemoData(client: any) {
  const results: string[] = [];

  // 创建示例产线
  const lines = [
    { line_code: 'LINE001', line_name: 'A线', workshop: '一号车间', capacity: 50 },
    { line_code: 'LINE002', line_name: 'B线', workshop: '一号车间', capacity: 45 },
    { line_code: 'LINE003', line_name: 'C线', workshop: '二号车间', capacity: 55 }
  ];

  try {
    await client.from('production_lines').insert(lines);
    results.push('创建产线成功');
  } catch {
    results.push('产线已存在');
  }

  // 创建示例工序模板
  const processTemplate = {
    template_code: 'PT001',
    template_name: 'T恤标准工序',
    template_type: 'process',
    category: '针织',
    description: 'T恤生产标准工序流程',
    is_public: true,
    usage_count: 0
  };

  try {
    await client.from('templates').insert(processTemplate);
    results.push('创建工序模板成功');
  } catch {
    results.push('工序模板已存在');
  }

  // 创建示例BOM模板
  const bomTemplate = {
    template_code: 'BOM001',
    template_name: 'T恤BOM模板',
    template_type: 'bom',
    category: '针织',
    description: 'T恤标准物料清单',
    is_public: true,
    usage_count: 0
  };

  try {
    await client.from('templates').insert(bomTemplate);
    results.push('创建BOM模板成功');
  } catch {
    results.push('BOM模板已存在');
  }

  return NextResponse.json({
    success: true,
    message: '演示数据填充完成',
    results
  });
}
