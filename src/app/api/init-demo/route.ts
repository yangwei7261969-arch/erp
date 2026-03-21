import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 初始化演示数据
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 检查是否已有用户
    const { data: existingUsers } = await client
      .from('users')
      .select('id')
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ success: true, message: '数据已存在，跳过初始化' });
    }

    // 创建演示用户
    const { error: userError } = await client
      .from('users')
      .insert({
        id: 'user-001',
        email: 'admin',
        password: 'admin123',
        name: '管理员',
        department: '管理部',
        position: '系统管理员',
        status: 'active',
      });

    if (userError) {
      console.error('Create user error:', userError);
    }

    // 创建演示客户
    await client.from('customers').insert([
      { code: 'C001', name: '广州服饰有限公司', contact: '张三', phone: '13800138001', level: 'vip', type: 'domestic' },
      { code: 'C002', name: '深圳时尚集团', contact: '李四', phone: '13800138002', level: 'vip', type: 'domestic' },
      { code: 'C003', name: '东莞服装厂', contact: '王五', phone: '13800138003', level: 'normal', type: 'domestic' },
    ]);

    // 创建演示供应商
    await client.from('suppliers').insert([
      { code: 'S001', name: '布料供应商A', contact: '供应商A', phone: '13900139001', rating: 5 },
      { code: 'S002', name: '辅料供应商B', contact: '供应商B', phone: '13900139002', rating: 4 },
    ]);

    // 创建演示员工
    await client.from('employees').insert([
      { employee_no: 'EMP001', name: '张三', department: '生产部', position: '车间主任', status: 'active', join_date: '2023-01-15', base_salary: 5000 },
      { employee_no: 'EMP002', name: '李四', department: '裁床部', position: '裁床工', status: 'active', join_date: '2023-03-20', base_salary: 4500 },
      { employee_no: 'EMP003', name: '王五', department: '仓库', position: '仓库管理员', status: 'active', join_date: '2023-05-10', base_salary: 4000 },
      { employee_no: 'EMP004', name: '赵六', department: '财务部', position: '会计', status: 'active', join_date: '2023-06-01', base_salary: 5500 },
    ]);

    // 创建演示物料
    await client.from('materials').insert([
      { code: 'M001', name: '纯棉面料', category: '面料', unit: '米', unit_price: 35.00, safety_stock: 1000 },
      { code: 'M002', name: '涤纶面料', category: '面料', unit: '米', unit_price: 25.00, safety_stock: 800 },
      { code: 'M003', name: '拉链', category: '辅料', unit: '条', unit_price: 2.50, safety_stock: 5000 },
      { code: 'M004', name: '纽扣', category: '辅料', unit: '颗', unit_price: 0.80, safety_stock: 10000 },
    ]);

    // 创建演示生产订单
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    await client.from('production_orders').insert([
      {
        order_no: `PO${dateStr}001`,
        style_no: 'ST2024001',
        style_name: '休闲T恤',
        color: '白色',
        quantity: 1000,
        completed_quantity: 800,
        status: 'in_progress',
        plan_start_date: today.toISOString().slice(0, 10),
        plan_end_date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      },
      {
        order_no: `PO${dateStr}002`,
        style_no: 'ST2024002',
        style_name: '牛仔裤',
        color: '蓝色',
        quantity: 2000,
        completed_quantity: 2000,
        status: 'completed',
        plan_start_date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        plan_end_date: today.toISOString().slice(0, 10),
      },
      {
        order_no: `PO${dateStr}003`,
        style_no: 'ST2024003',
        style_name: '运动短裤',
        color: '黑色',
        quantity: 500,
        completed_quantity: 0,
        status: 'pending',
        plan_start_date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        plan_end_date: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      },
    ]);

    // 创建演示账单
    await client.from('bills').insert([
      {
        bill_no: `IN${dateStr}001`,
        type: 'income',
        category: '销售收款',
        amount: 150000,
        total_amount: 150000,
        bill_date: today.toISOString().slice(0, 10),
        status: 'paid',
      },
      {
        bill_no: `OUT${dateStr}001`,
        type: 'expense',
        category: '采购付款',
        amount: 85000,
        total_amount: 85000,
        bill_date: today.toISOString().slice(0, 10),
        status: 'paid',
      },
      {
        bill_no: `OUT${dateStr}002`,
        type: 'expense',
        category: '工资发放',
        amount: 120000,
        total_amount: 120000,
        bill_date: today.toISOString().slice(0, 10),
        status: 'pending',
      },
    ]);

    return NextResponse.json({ success: true, message: '演示数据初始化成功' });
  } catch (error) {
    console.error('Init demo data error:', error);
    return NextResponse.json({ error: '初始化失败', details: String(error) }, { status: 500 });
  }
}
