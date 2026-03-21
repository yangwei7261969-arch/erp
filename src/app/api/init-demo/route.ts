import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 初始化演示数据
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 1. 创建演示生产订单
    const demoOrders = [
      {
        order_no: 'PO20250101',
        style_no: 'A001',
        style_name: '经典款T恤',
        style_image: 'https://picsum.photos/seed/style1/200',
        color: '白色',
        total_quantity: 1000,
        completed_quantity: 650,
        status: 'in_progress',
        plan_start_date: '2025-01-01',
        plan_end_date: '2025-01-15',
        cutting_days: 3,
        sewing_days: 7,
        finishing_days: 3,
      },
      {
        order_no: 'PO20250102',
        style_no: 'A002',
        style_name: '时尚连衣裙',
        style_image: 'https://picsum.photos/seed/style2/200',
        color: '黑色',
        total_quantity: 500,
        completed_quantity: 500,
        status: 'completed',
        plan_start_date: '2024-12-15',
        plan_end_date: '2025-01-05',
        cutting_days: 2,
        sewing_days: 5,
        finishing_days: 2,
      },
      {
        order_no: 'PO20250103',
        style_no: 'B001',
        style_name: '休闲裤',
        style_image: 'https://picsum.photos/seed/style3/200',
        color: '深蓝',
        total_quantity: 800,
        completed_quantity: 0,
        status: 'pending',
        plan_start_date: '2025-01-10',
        plan_end_date: '2025-01-25',
        cutting_days: 3,
        sewing_days: 6,
        finishing_days: 3,
      },
    ];

    for (const order of demoOrders) {
      await client.from('production_orders').upsert(order, { onConflict: 'order_no' });
    }

    // 2. 创建演示物料
    const demoMaterials = [
      { code: 'M001', name: '纯棉面料', spec: '40S/1', color: '白色', quantity: 5000, unit: '码', safety_stock: 1000, unit_price: 25, location: 'A-01' },
      { code: 'M002', name: '涤纶面料', spec: '75D', color: '黑色', quantity: 3000, unit: '码', safety_stock: 800, unit_price: 18, location: 'A-02' },
      { code: 'M003', name: '拉链', spec: '3#', color: '银色', quantity: 50, unit: '条', safety_stock: 200, unit_price: 1.5, location: 'B-01' },
      { code: 'M004', name: '纽扣', spec: '18mm', color: '黑色', quantity: 200, unit: '颗', safety_stock: 500, unit_price: 0.3, location: 'B-02' },
      { code: 'M005', name: '缝纫线', spec: '40S/2', color: '白色', quantity: 100, unit: '个', safety_stock: 50, unit_price: 8, location: 'B-03' },
    ];

    for (const material of demoMaterials) {
      await client.from('materials').upsert(material, { onConflict: 'code' });
    }

    // 3. 创建演示供应商
    const demoSuppliers = [
      { code: 'S001', name: '优质纺织厂', short_name: '优质纺织', type: 'factory', category: '面料', level: 1, contact: '张经理', phone: '13800138001', email: 'youzhi@example.com', status: 'approved', rating: 5 },
      { code: 'S002', name: '快捷辅料店', short_name: '快捷辅料', type: 'supplier', category: '辅料', level: 2, contact: '李总', phone: '13800138002', email: 'kuaijie@example.com', status: 'approved', rating: 4 },
      { code: 'S003', name: '精美刺绣厂', short_name: '精美刺绣', type: 'factory', category: '刺绣', level: 1, contact: '王厂长', phone: '13800138003', email: 'jingmei@example.com', status: 'approved', rating: 5 },
    ];

    for (const supplier of demoSuppliers) {
      await client.from('suppliers').upsert(supplier, { onConflict: 'code' });
    }

    // 4. 创建演示财务账单
    const demoBills = [
      { bill_no: 'FI202501001', type: 'income', amount: 150000, payer: '客户A', payee: '公司', bill_date: '2025-01-05', status: 'paid', remark: '订单PO20250101预付款' },
      { bill_no: 'FI202501002', type: 'expense', amount: 50000, payer: '公司', payee: '优质纺织厂', bill_date: '2025-01-06', status: 'paid', remark: '面料采购款' },
      { bill_no: 'FI202501003', type: 'income', amount: 80000, payer: '客户B', payee: '公司', bill_date: '2025-01-08', status: 'paid', remark: '订单PO20250102尾款' },
      { bill_no: 'FI202501004', type: 'expense', amount: 12000, payer: '公司', payee: '精美刺绣厂', bill_date: '2025-01-10', status: 'pending', remark: '外发刺绣费用' },
    ];

    for (const bill of demoBills) {
      await client.from('bills').upsert(bill, { onConflict: 'bill_no' });
    }

    // 5. 创建演示员工
    const demoEmployees = [
      { employee_no: 'E001', name: '张三', department: '裁床部', position: '裁床主管', status: 'active', hire_date: '2020-03-01' },
      { employee_no: 'E002', name: '李四', department: '缝制部', position: '缝制工', status: 'active', hire_date: '2021-06-15' },
      { employee_no: 'E003', name: '王五', department: '尾部', position: '尾部主管', status: 'active', hire_date: '2019-08-01' },
      { employee_no: 'E004', name: '赵六', department: '仓库', position: '仓管员', status: 'active', hire_date: '2022-01-10' },
    ];

    for (const employee of demoEmployees) {
      await client.from('employees').upsert(employee, { onConflict: 'employee_no' });
    }

    // 6. 创建演示出货任务
    const demoShipments = [
      { shipment_no: 'SH20250101', order_id: 'PO20250102', customer: '客户B', quantity: 500, shipment_date: '2025-01-12', status: 'shipped', address: '深圳市南山区' },
      { shipment_no: 'SH20250102', order_id: 'PO20250101', customer: '客户A', quantity: 300, shipment_date: '2025-01-18', status: 'pending', address: '广州市天河区' },
    ];

    for (const shipment of demoShipments) {
      await client.from('shipments').upsert(shipment, { onConflict: 'shipment_no' });
    }

    return NextResponse.json({
      success: true,
      message: '演示数据初始化成功',
      data: {
        orders: demoOrders.length,
        materials: demoMaterials.length,
        suppliers: demoSuppliers.length,
        bills: demoBills.length,
        employees: demoEmployees.length,
        shipments: demoShipments.length,
      },
    });
  } catch (error) {
    console.error('Init demo error:', error);
    return NextResponse.json(
      { success: false, error: '初始化失败' },
      { status: 500 }
    );
  }
}
