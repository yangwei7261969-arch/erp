import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 初始化裁床分扎和工序追溯表
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 使用RPC执行SQL创建表
    // 注意：Supabase通常需要通过SQL编辑器或迁移工具创建表
    // 这里我们尝试直接创建，如果失败则返回提示
    
    // 检查cutting_bundles表是否存在
    const { error: checkBundlesError } = await client
      .from('cutting_bundles')
      .select('id')
      .limit(1);
    
    const bundlesTableExists = !checkBundlesError || !checkBundlesError.message.includes('does not exist');

    // 检查process_tracking表是否存在
    const { error: checkTrackingError } = await client
      .from('process_tracking')
      .select('id')
      .limit(1);
    
    const trackingTableExists = !checkTrackingError || !checkTrackingError.message.includes('does not exist');

    if (bundlesTableExists && trackingTableExists) {
      return NextResponse.json({ 
        success: true, 
        message: '表已存在，无需初始化',
        tables: {
          cutting_bundles: bundlesTableExists,
          process_tracking: trackingTableExists
        }
      });
    }

    // 返回需要执行的SQL提示
    return NextResponse.json({ 
      success: false, 
      message: '请在Supabase SQL编辑器中执行以下SQL创建表：',
      sql: `
-- 裁床分扎表
CREATE TABLE IF NOT EXISTS cutting_bundles (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  cutting_order_id VARCHAR(36),
  bundle_no VARCHAR(50) NOT NULL UNIQUE,
  size VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  qr_code VARCHAR(100),
  current_process_id VARCHAR(36),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS cutting_bundles_order_idx ON cutting_bundles(cutting_order_id);
CREATE INDEX IF NOT EXISTS cutting_bundles_bundle_no_idx ON cutting_bundles(bundle_no);

-- 工序追溯表
CREATE TABLE IF NOT EXISTS process_tracking (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id VARCHAR(36) NOT NULL,
  process_id VARCHAR(36) NOT NULL,
  worker_id VARCHAR(36) NOT NULL,
  quantity INTEGER NOT NULL,
  wage NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS process_tracking_bundle_idx ON process_tracking(bundle_id);
CREATE INDEX IF NOT EXISTS process_tracking_process_idx ON process_tracking(process_id);
CREATE INDEX IF NOT EXISTS process_tracking_worker_idx ON process_tracking(worker_id);
CREATE INDEX IF NOT EXISTS process_tracking_created_idx ON process_tracking(created_at);
      `
    });
  } catch (error) {
    console.error('Init tables error:', error);
    return NextResponse.json({ error: '初始化失败', details: String(error) }, { status: 500 });
  }
}
