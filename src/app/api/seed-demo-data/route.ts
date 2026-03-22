import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 完整演示数据种子API
 * 为所有页面提供丰富的演示数据
 */

// 辅助函数：生成随机ID
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 辅助函数：生成随机日期
function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

// 辅助函数：生成随机时间
function randomTime(): string {
  const hours = 7 + Math.floor(Math.random() * 3);
  const minutes = Math.floor(Math.random() * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
  const client = getSupabaseClient();
  const results: string[] = [];
  const counts: Record<string, number> = {};

  try {
    // ==========================================
    // 1. 角色数据
    // ==========================================
    const roles = [
      { id: 'admin', name: '系统管理员', description: '拥有所有权限' },
      { id: 'boss', name: '老板', description: '查看所有数据' },
      { id: 'manager', name: '经理', description: '管理日常业务' },
      { id: 'production_manager', name: '生产主管', description: '管理生产流程' },
      { id: 'warehouse', name: '仓库管理员', description: '管理库存' },
      { id: 'qc', name: '质检员', description: '质量检验' },
      { id: 'finance', name: '财务', description: '财务管理' },
      { id: 'hr', name: '人事', description: '人事管理' },
      { id: 'purchase', name: '采购', description: '采购管理' },
      { id: 'worker', name: '工人', description: '生产线工人' },
    ];

    try {
      for (const role of roles) {
        await client.from('roles').upsert(role, { onConflict: 'id' });
      }
      results.push('✅ 创建角色数据');
      counts.roles = roles.length;
    } catch (e) {
      results.push('⚠️ 角色数据已存在');
    }

    // ==========================================
    // 2. 用户数据
    // ==========================================
    const users = [
      { id: 'user-001', username: 'admin', password: 'admin123', name: '系统管理员', email: 'admin@company.com', role_id: 'admin', department: '信息部', is_active: true },
      { id: 'user-002', username: 'boss', password: 'boss123', name: '张总', email: 'boss@company.com', role_id: 'boss', department: '管理层', is_active: true },
      { id: 'user-003', username: 'manager', password: 'manager123', name: '李经理', email: 'manager@company.com', role_id: 'manager', department: '管理部', is_active: true },
      { id: 'user-004', username: 'production', password: 'prod123', name: '王主管', email: 'production@company.com', role_id: 'production_manager', department: '生产部', is_active: true },
      { id: 'user-005', username: 'warehouse', password: 'wh123', name: '赵仓管', email: 'warehouse@company.com', role_id: 'warehouse', department: '仓库', is_active: true },
      { id: 'user-006', username: 'qc', password: 'qc123', name: '刘质检', email: 'qc@company.com', role_id: 'qc', department: '质检部', is_active: true },
      { id: 'user-007', username: 'finance', password: 'fin123', name: '陈财务', email: 'finance@company.com', role_id: 'finance', department: '财务部', is_active: true },
      { id: 'user-008', username: 'hr', password: 'hr123', name: '周人事', email: 'hr@company.com', role_id: 'hr', department: '人事部', is_active: true },
    ];

    try {
      for (const user of users) {
        await client.from('users').upsert(user, { onConflict: 'id' });
      }
      results.push('✅ 创建用户数据');
      counts.users = users.length;
    } catch (e) {
      results.push('⚠️ 用户数据已存在');
    }

    // ==========================================
    // 3. 客户数据
    // ==========================================
    const customers = [
      { id: generateId(), name: '优衣库服饰有限公司', code: 'C001', contact_person: '张采购', phone: '13800001001', email: 'zhang@uniqlo.com', city: '上海', credit_level: 'excellent', payment_terms: '月结30天' },
      { id: generateId(), name: 'H&M中国', code: 'C002', contact_person: '李经理', phone: '13800001002', email: 'li@hm.com', city: '广州', credit_level: 'excellent', payment_terms: '月结45天' },
      { id: generateId(), name: 'ZARA中国', code: 'C003', contact_person: '王总监', phone: '13800001003', email: 'wang@zara.com', city: '北京', credit_level: 'good', payment_terms: '月结30天' },
      { id: generateId(), name: '太平鸟服饰', code: 'C004', contact_person: '赵主管', phone: '13800001004', email: 'zhao@peacebird.com', city: '宁波', credit_level: 'good', payment_terms: '月结15天' },
      { id: generateId(), name: '森马服饰', code: 'C005', contact_person: '孙经理', phone: '13800001005', email: 'sun@semir.com', city: '温州', credit_level: 'normal', payment_terms: '月结30天' },
      { id: generateId(), name: '美特斯邦威', code: 'C006', contact_person: '周采购', phone: '13800001006', email: 'zhou@metersbonwe.com', city: '上海', credit_level: 'good', payment_terms: '月结30天' },
    ];

    try {
      for (const customer of customers) {
        await client.from('customers').upsert(customer, { onConflict: 'code' });
      }
      results.push('✅ 创建客户数据');
      counts.customers = customers.length;
    } catch (e) {
      results.push('⚠️ 客户数据已存在');
    }

    // ==========================================
    // 4. 供应商数据
    // ==========================================
    const suppliers = [
      { id: 'sup-001', name: '优质纺织原料有限公司', code: 'S001', type: 'material', contact_person: '陈经理', phone: '13900001001', email: 'chen@textile.com', city: '绍兴', credit_level: 'excellent', lead_time_days: 7, rating: 4.8 },
      { id: 'sup-002', name: '精工辅料商行', code: 'S002', type: 'material', contact_person: '林老板', phone: '13900001002', email: 'lin@accessories.com', city: '广州', credit_level: 'good', lead_time_days: 5, rating: 4.5 },
      { id: 'sup-003', name: '华美刺绣加工厂', code: 'S003', type: 'outsource', contact_person: '吴厂长', phone: '13900001003', email: 'wu@embroidery.com', city: '东莞', credit_level: 'excellent', lead_time_days: 3, rating: 4.9 },
      { id: 'sup-004', name: '通达印染厂', code: 'S004', type: 'outsource', contact_person: '郑经理', phone: '13900001004', email: 'zheng@dyeing.com', city: '佛山', credit_level: 'good', lead_time_days: 5, rating: 4.3 },
      { id: 'sup-005', name: '鑫源纽扣厂', code: 'S005', type: 'material', contact_person: '黄总', phone: '13900001005', email: 'huang@button.com', city: '温州', credit_level: 'normal', lead_time_days: 3, rating: 4.0 },
      { id: 'sup-006', name: '永盛水洗厂', code: 'S006', type: 'outsource', contact_person: '许老板', phone: '13900001006', email: 'xu@washing.com', city: '中山', credit_level: 'good', lead_time_days: 4, rating: 4.2 },
    ];

    try {
      for (const supplier of suppliers) {
        await client.from('suppliers').upsert(supplier, { onConflict: 'code' });
      }
      results.push('✅ 创建供应商数据');
      counts.suppliers = suppliers.length;
    } catch (e) {
      results.push('⚠️ 供应商数据已存在');
    }

    // ==========================================
    // 5. 物料分类
    // ==========================================
    const materialCategories = [
      { id: 'cat-001', name: '面料', code: 'FABRIC', description: '各种面料原料' },
      { id: 'cat-002', name: '里料', code: 'LINING', description: '服装里料' },
      { id: 'cat-003', name: '辅料-拉链', code: 'ZIPPER', description: '各类拉链' },
      { id: 'cat-004', name: '辅料-纽扣', code: 'BUTTON', description: '各类纽扣' },
      { id: 'cat-005', name: '辅料-缝纫线', code: 'THREAD', description: '缝纫用线' },
      { id: 'cat-006', name: '辅料-衬布', code: 'INTERLINING', description: '粘合衬、衬布' },
      { id: 'cat-007', name: '包装材料', code: 'PACKAGING', description: '包装袋、吊牌等' },
    ];

    try {
      for (const cat of materialCategories) {
        await client.from('material_categories').upsert(cat, { onConflict: 'code' });
      }
      results.push('✅ 创建物料分类');
      counts.materialCategories = materialCategories.length;
    } catch (e) {
      results.push('⚠️ 物料分类已存在');
    }

    // ==========================================
    // 6. 物料数据
    // ==========================================
    const materials = [
      { id: 'mat-001', name: '纯棉针织布', code: 'M001', category_id: 'cat-001', type: 'fabric', unit: '公斤', color: '白色', specification: '40S/1 180g/㎡', width: 150, weight: 180, composition: '100%棉', supplier_id: 'sup-001', unit_price: 45, safety_stock: 500, current_stock: 1200, location: 'A-01-01' },
      { id: 'mat-002', name: '涤棉混纺布', code: 'M002', category_id: 'cat-001', type: 'fabric', unit: '公斤', color: '黑色', specification: 'T/C 65/35 200g/㎡', width: 150, weight: 200, composition: '65%涤35%棉', supplier_id: 'sup-001', unit_price: 38, safety_stock: 400, current_stock: 800, location: 'A-01-02' },
      { id: 'mat-003', name: '弹力牛仔布', code: 'M003', category_id: 'cat-001', type: 'fabric', unit: '米', color: '深蓝', specification: '10OZ 2%弹力', width: 145, weight: 340, composition: '98%棉2%氨纶', supplier_id: 'sup-001', unit_price: 52, safety_stock: 300, current_stock: 450, location: 'A-02-01' },
      { id: 'mat-004', name: '尼龙拉链', code: 'M004', category_id: 'cat-003', type: 'accessory', unit: '条', color: '黑色', specification: '3# 60cm', supplier_id: 'sup-002', unit_price: 1.5, safety_stock: 2000, current_stock: 3500, location: 'B-01-01' },
      { id: 'mat-005', name: '金属拉链', code: 'M005', category_id: 'cat-003', type: 'accessory', unit: '条', color: '金色', specification: '5# 50cm', supplier_id: 'sup-002', unit_price: 3.8, safety_stock: 1000, current_stock: 1200, location: 'B-01-02' },
      { id: 'mat-006', name: '树脂纽扣', code: 'M006', category_id: 'cat-004', type: 'accessory', unit: '颗', color: '黑色', specification: '18mm 四眼', supplier_id: 'sup-005', unit_price: 0.15, safety_stock: 5000, current_stock: 8000, location: 'B-02-01' },
      { id: 'mat-007', name: '金属纽扣', code: 'M007', category_id: 'cat-004', type: 'accessory', unit: '颗', color: '银色', specification: '20mm 四合扣', supplier_id: 'sup-005', unit_price: 0.8, safety_stock: 2000, current_stock: 2500, location: 'B-02-02' },
      { id: 'mat-008', name: '涤纶缝纫线', code: 'M008', category_id: 'cat-005', type: 'accessory', unit: '个', color: '白色', specification: '40S/2 5000m', supplier_id: 'sup-002', unit_price: 12, safety_stock: 100, current_stock: 180, location: 'B-03-01' },
      { id: 'mat-009', name: '粘合衬', code: 'M009', category_id: 'cat-006', type: 'accessory', unit: '米', color: '白色', specification: '20g/㎡ 无纺', supplier_id: 'sup-002', unit_price: 8, safety_stock: 200, current_stock: 350, location: 'A-03-01' },
      { id: 'mat-010', name: 'PP包装袋', code: 'M010', category_id: 'cat-007', type: 'packaging', unit: '个', color: '透明', specification: '30*40cm', supplier_id: 'sup-002', unit_price: 0.3, safety_stock: 5000, current_stock: 8000, location: 'C-01-01' },
      { id: 'mat-011', name: '吊牌', code: 'M011', category_id: 'cat-007', type: 'packaging', unit: '张', color: '白色', specification: '5*8cm', supplier_id: 'sup-002', unit_price: 0.1, safety_stock: 10000, current_stock: 15000, location: 'C-01-02' },
      { id: 'mat-012', name: '棉绳', code: 'M012', category_id: 'cat-005', type: 'accessory', unit: '米', color: '白色', specification: '3mm', supplier_id: 'sup-002', unit_price: 0.5, safety_stock: 500, current_stock: 800, location: 'B-04-01' },
    ];

    try {
      for (const material of materials) {
        await client.from('materials').upsert(material, { onConflict: 'code' });
      }
      results.push('✅ 创建物料数据');
      counts.materials = materials.length;
    } catch (e) {
      results.push('⚠️ 物料数据已存在');
    }

    // ==========================================
    // 7. 款式数据
    // ==========================================
    const styles = [
      { id: 'style-001', style_no: 'ST2025001', name: '经典圆领T恤', category: 'T恤', season: '春夏', year: 2025, color: '白色/黑色/灰色', size_range: 'S,M,L,XL,XXL', base_price: 89, cost_price: 35 },
      { id: 'style-002', style_no: 'ST2025002', name: '时尚V领连衣裙', category: '连衣裙', season: '春夏', year: 2025, color: '黑色/红色/蓝色', size_range: 'S,M,L,XL', base_price: 269, cost_price: 98 },
      { id: 'style-003', style_no: 'ST2025003', name: '休闲直筒裤', category: '裤子', season: '四季', year: 2025, color: '深蓝/浅蓝/黑色', size_range: '26,28,30,32,34', base_price: 199, cost_price: 68 },
      { id: 'style-004', style_no: 'ST2025004', name: '商务衬衫', category: '衬衫', season: '四季', year: 2025, color: '白色/浅蓝/粉色', size_range: '38,40,42,44,46', base_price: 259, cost_price: 85 },
      { id: 'style-005', style_no: 'ST2025005', name: '针织开衫', category: '外套', season: '秋冬', year: 2025, color: '米色/灰色/藏青', size_range: 'S,M,L,XL', base_price: 329, cost_price: 120 },
      { id: 'style-006', style_no: 'ST2025006', name: '牛仔夹克', category: '外套', season: '四季', year: 2025, color: '深蓝/浅蓝', size_range: 'S,M,L,XL,XXL', base_price: 459, cost_price: 168 },
    ];

    try {
      for (const style of styles) {
        await client.from('styles').upsert(style, { onConflict: 'style_no' });
      }
      results.push('✅ 创建款式数据');
      counts.styles = styles.length;
    } catch (e) {
      results.push('⚠️ 款式数据已存在');
    }

    // ==========================================
    // 8. 生产线数据
    // ==========================================
    const productionLines = [
      { id: 'line-001', name: 'A线', code: 'A', type: 'sewing', capacity_per_day: 500, efficiency: 92, manager: '张主管', status: 'active', location: '一号车间' },
      { id: 'line-002', name: 'B线', code: 'B', type: 'sewing', capacity_per_day: 450, efficiency: 88, manager: '李主管', status: 'active', location: '一号车间' },
      { id: 'line-003', name: 'C线', code: 'C', type: 'sewing', capacity_per_day: 480, efficiency: 95, manager: '王主管', status: 'active', location: '二号车间' },
      { id: 'line-004', name: 'D线', code: 'D', type: 'sewing', capacity_per_day: 420, efficiency: 90, manager: '赵主管', status: 'maintenance', location: '二号车间' },
      { id: 'line-005', name: '裁床组', code: 'CUT', type: 'cutting', capacity_per_day: 1000, efficiency: 98, manager: '刘裁床', status: 'active', location: '裁床车间' },
      { id: 'line-006', name: '尾部组', code: 'FIN', type: 'finishing', capacity_per_day: 800, efficiency: 94, manager: '陈尾部', status: 'active', location: '尾部车间' },
    ];

    try {
      for (const line of productionLines) {
        await client.from('production_lines').upsert(line, { onConflict: 'code' });
      }
      results.push('✅ 创建生产线数据');
      counts.productionLines = productionLines.length;
    } catch (e) {
      results.push('⚠️ 生产线数据已存在');
    }

    // ==========================================
    // 9. 工序数据
    // ==========================================
    const processes = [
      { id: 'proc-001', name: '裁剪', code: 'CUT001', category: 'cutting', sequence: 1, standard_time: 2.5, standard_rate: 0.8, description: '面料裁剪' },
      { id: 'proc-002', name: '粘衬', code: 'CUT002', category: 'cutting', sequence: 2, standard_time: 1.5, standard_rate: 0.5, description: '粘合衬烫压' },
      { id: 'proc-003', name: '合肩缝', code: 'SEW001', category: 'sewing', sequence: 10, standard_time: 1.2, standard_rate: 0.4, description: '前后片肩部缝合' },
      { id: 'proc-004', name: '合侧缝', code: 'SEW002', category: 'sewing', sequence: 11, standard_time: 1.8, standard_rate: 0.6, description: '侧缝缝合' },
      { id: 'proc-005', name: '上领', code: 'SEW003', category: 'sewing', sequence: 12, standard_time: 3.0, standard_rate: 1.0, description: '领子安装' },
      { id: 'proc-006', name: '上袖', code: 'SEW004', category: 'sewing', sequence: 13, standard_time: 2.5, standard_rate: 0.8, description: '袖子安装' },
      { id: 'proc-007', name: '卷边', code: 'SEW005', category: 'sewing', sequence: 14, standard_time: 1.0, standard_rate: 0.3, description: '下摆卷边' },
      { id: 'proc-008', name: '锁眼', code: 'SEW006', category: 'sewing', sequence: 15, standard_time: 0.5, standard_rate: 0.2, description: '扣眼锁边' },
      { id: 'proc-009', name: '钉扣', code: 'SEW007', category: 'sewing', sequence: 16, standard_time: 0.5, standard_rate: 0.2, description: '钉纽扣' },
      { id: 'proc-010', name: '整烫', code: 'FIN001', category: 'ironing', sequence: 20, standard_time: 2.0, standard_rate: 0.6, description: '成品整烫' },
      { id: 'proc-011', name: '质检', code: 'QC001', category: 'inspection', sequence: 25, standard_time: 1.5, standard_rate: 0.5, description: '质量检验', is_quality_point: true },
      { id: 'proc-012', name: '包装', code: 'FIN002', category: 'packing', sequence: 30, standard_time: 1.0, standard_rate: 0.3, description: '成品包装' },
    ];

    try {
      for (const process of processes) {
        await client.from('processes').upsert(process, { onConflict: 'code' });
      }
      results.push('✅ 创建工序数据');
      counts.processes = processes.length;
    } catch (e) {
      results.push('⚠️ 工序数据已存在');
    }

    // ==========================================
    // 10. 生产订单数据
    // ==========================================
    const productionOrders = [
      { id: 'ord-001', order_no: 'PO202501001', customer_id: customers[0]?.id, style_id: 'style-001', style_no: 'ST2025001', style_name: '经典圆领T恤', color: '白色', total_quantity: 2000, size_breakdown: { 'S': 400, 'M': 600, 'L': 500, 'XL': 300, 'XXL': 200 }, unit_price: 45, total_amount: 90000, order_date: '2025-01-05', delivery_date: '2025-01-25', status: 'in_progress', progress: 65, priority: 'high', production_line_id: 'line-001' },
      { id: 'ord-002', order_no: 'PO202501002', customer_id: customers[1]?.id, style_id: 'style-002', style_no: 'ST2025002', style_name: '时尚V领连衣裙', color: '黑色', total_quantity: 800, size_breakdown: { 'S': 200, 'M': 300, 'L': 200, 'XL': 100 }, unit_price: 128, total_amount: 102400, order_date: '2025-01-03', delivery_date: '2025-01-28', status: 'in_progress', progress: 45, priority: 'urgent', production_line_id: 'line-002' },
      { id: 'ord-003', order_no: 'PO202501003', customer_id: customers[2]?.id, style_id: 'style-003', style_no: 'ST2025003', style_name: '休闲直筒裤', color: '深蓝', total_quantity: 1500, size_breakdown: { '26': 200, '28': 300, '30': 400, '32': 350, '34': 250 }, unit_price: 85, total_amount: 127500, order_date: '2025-01-08', delivery_date: '2025-02-05', status: 'in_progress', progress: 30, priority: 'normal', production_line_id: 'line-003' },
      { id: 'ord-004', order_no: 'PO202501004', customer_id: customers[3]?.id, style_id: 'style-004', style_no: 'ST2025004', style_name: '商务衬衫', color: '白色', total_quantity: 1200, size_breakdown: { '38': 200, '40': 300, '42': 350, '44': 250, '46': 100 }, unit_price: 108, total_amount: 129600, order_date: '2024-12-20', delivery_date: '2025-01-15', status: 'completed', progress: 100, priority: 'high', production_line_id: 'line-001' },
      { id: 'ord-005', order_no: 'PO202501005', customer_id: customers[4]?.id, style_id: 'style-005', style_no: 'ST2025005', style_name: '针织开衫', color: '米色', total_quantity: 600, size_breakdown: { 'S': 100, 'M': 200, 'L': 180, 'XL': 120 }, unit_price: 158, total_amount: 94800, order_date: '2025-01-10', delivery_date: '2025-02-10', status: 'pending', progress: 0, priority: 'normal', production_line_id: 'line-002' },
      { id: 'ord-006', order_no: 'PO202501006', customer_id: customers[5]?.id, style_id: 'style-006', style_no: 'ST2025006', style_name: '牛仔夹克', color: '深蓝', total_quantity: 400, size_breakdown: { 'S': 60, 'M': 100, 'L': 120, 'XL': 80, 'XXL': 40 }, unit_price: 198, total_amount: 79200, order_date: '2025-01-12', delivery_date: '2025-02-15', status: 'pending', progress: 0, priority: 'low', production_line_id: 'line-003' },
      { id: 'ord-007', order_no: 'PO202412001', customer_id: customers[0]?.id, style_id: 'style-001', style_no: 'ST2025001', style_name: '经典圆领T恤', color: '黑色', total_quantity: 3000, size_breakdown: { 'S': 600, 'M': 900, 'L': 750, 'XL': 450, 'XXL': 300 }, unit_price: 45, total_amount: 135000, order_date: '2024-12-01', delivery_date: '2024-12-20', status: 'completed', progress: 100, priority: 'urgent', production_line_id: 'line-001' },
      { id: 'ord-008', order_no: 'PO202412002', customer_id: customers[1]?.id, style_id: 'style-004', style_no: 'ST2025004', style_name: '商务衬衫', color: '浅蓝', total_quantity: 1000, size_breakdown: { '38': 150, '40': 250, '42': 300, '44': 200, '46': 100 }, unit_price: 108, total_amount: 108000, order_date: '2024-11-25', delivery_date: '2024-12-18', status: 'completed', progress: 100, priority: 'high', production_line_id: 'line-002' },
    ];

    try {
      for (const order of productionOrders) {
        await client.from('production_orders').upsert(order, { onConflict: 'order_no' });
      }
      results.push('✅ 创建生产订单数据');
      counts.productionOrders = productionOrders.length;
    } catch (e) {
      results.push('⚠️ 生产订单数据已存在');
    }

    // ==========================================
    // 11. 员工数据
    // ==========================================
    const employees = [
      { id: 'emp-001', employee_no: 'E001', name: '张伟', gender: '男', phone: '13800000001', department: '裁床部', position: '裁床主管', skill_level: 'senior', skill_types: ['裁剪', '排版'], hire_date: '2018-03-15', status: 'active', base_salary: 8000, piece_rate: 1.2 },
      { id: 'emp-002', employee_no: 'E002', name: '李娜', gender: '女', phone: '13800000002', department: '缝制A线', position: '缝制工', skill_level: 'middle', skill_types: ['平车', '包缝'], production_line_id: 'line-001', hire_date: '2020-06-01', status: 'active', base_salary: 4500, piece_rate: 1.0 },
      { id: 'emp-003', employee_no: 'E003', name: '王芳', gender: '女', phone: '13800000003', department: '缝制A线', position: '缝制工', skill_level: 'senior', skill_types: ['平车', '包缝', '双针'], production_line_id: 'line-001', hire_date: '2019-01-10', status: 'active', base_salary: 5000, piece_rate: 1.1 },
      { id: 'emp-004', employee_no: 'E004', name: '刘强', gender: '男', phone: '13800000004', department: '缝制B线', position: '缝制工', skill_level: 'middle', skill_types: ['平车', '钉扣'], production_line_id: 'line-002', hire_date: '2021-03-20', status: 'active', base_salary: 4500, piece_rate: 1.0 },
      { id: 'emp-005', employee_no: 'E005', name: '陈静', gender: '女', phone: '13800000005', department: '尾部', position: '尾部主管', skill_level: 'senior', skill_types: ['整烫', '质检', '包装'], hire_date: '2017-08-01', status: 'active', base_salary: 7500, piece_rate: 1.2 },
      { id: 'emp-006', employee_no: 'E006', name: '赵敏', gender: '女', phone: '13800000006', department: '质检部', position: '质检员', skill_level: 'senior', skill_types: ['终检', '抽检'], hire_date: '2019-05-15', status: 'active', base_salary: 5500, piece_rate: 1.0 },
      { id: 'emp-007', employee_no: 'E007', name: '孙磊', gender: '男', phone: '13800000007', department: '仓库', position: '仓管员', skill_level: 'middle', skill_types: ['入库', '出库', '盘点'], hire_date: '2020-09-01', status: 'active', base_salary: 4500, piece_rate: 0 },
      { id: 'emp-008', employee_no: 'E008', name: '周洋', gender: '男', phone: '13800000008', department: '缝制C线', position: '缝制工', skill_level: 'junior', skill_types: ['平车'], production_line_id: 'line-003', hire_date: '2023-01-05', status: 'active', base_salary: 4000, piece_rate: 0.9 },
      { id: 'emp-009', employee_no: 'E009', name: '吴婷', gender: '女', phone: '13800000009', department: '缝制B线', position: '缝制工', skill_level: 'middle', skill_types: ['平车', '锁眼'], production_line_id: 'line-002', hire_date: '2021-06-15', status: 'active', base_salary: 4500, piece_rate: 1.0 },
      { id: 'emp-010', employee_no: 'E010', name: '郑浩', gender: '男', phone: '13800000010', department: '裁床部', position: '裁床工', skill_level: 'middle', skill_types: ['裁剪'], hire_date: '2022-02-01', status: 'active', base_salary: 4800, piece_rate: 1.0 },
      { id: 'emp-011', employee_no: 'E011', name: '黄丽', gender: '女', phone: '13800000011', department: '尾部', position: '整烫工', skill_level: 'middle', skill_types: ['整烫'], hire_date: '2021-11-01', status: 'active', base_salary: 4500, piece_rate: 1.0 },
      { id: 'emp-012', employee_no: 'E012', name: '许明', gender: '男', phone: '13800000012', department: '缝制A线', position: '缝制工', skill_level: 'junior', skill_types: ['平车'], production_line_id: 'line-001', hire_date: '2024-01-02', status: 'active', base_salary: 3800, piece_rate: 0.85 },
    ];

    try {
      for (const employee of employees) {
        await client.from('employees').upsert(employee, { onConflict: 'employee_no' });
      }
      results.push('✅ 创建员工数据');
      counts.employees = employees.length;
    } catch (e) {
      results.push('⚠️ 员工数据已存在');
    }

    // ==========================================
    // 12. 考勤数据
    // ==========================================
    const attendanceRecords: any[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      for (const emp of employees) {
        const isLate = Math.random() < 0.1;
        const isEarlyLeave = Math.random() < 0.05;
        attendanceRecords.push({
          id: generateId(),
          employee_id: emp.id,
          employee_no: emp.employee_no,
          employee_name: emp.name,
          attendance_date: dateStr,
          check_in_time: isLate ? '08:35' : randomTime(),
          check_out_time: isEarlyLeave ? '17:30' : '18:00',
          work_hours: isEarlyLeave ? 9 : (isLate ? 9.5 : 10),
          overtime_hours: Math.random() < 0.3 ? 2 : 0,
          status: isLate ? 'late' : (isEarlyLeave ? 'early_leave' : 'normal')
        });
      }
    }

    try {
      for (const record of attendanceRecords.slice(0, 50)) { // 限制数量避免过多
        await client.from('attendance').upsert(record, { onConflict: 'employee_id,attendance_date' });
      }
      results.push('✅ 创建考勤数据');
      counts.attendance = 50;
    } catch (e) {
      results.push('⚠️ 考勤数据已存在');
    }

    // ==========================================
    // 13. 裁床记录数据
    // ==========================================
    const cuttingRecords = [
      { id: 'cut-001', cutting_no: 'CT202501001', order_id: 'ord-001', order_no: 'PO202501001', style_id: 'style-001', style_no: 'ST2025001', color: '白色', material_id: 'mat-001', material_name: '纯棉针织布', material_usage: 800, layer_count: 100, marker_length: 12.5, marker_efficiency: 85.5, total_pieces: 2000, cutting_date: '2025-01-08', cutter: '张伟', cutting_table: 'A桌', status: 'completed' },
      { id: 'cut-002', cutting_no: 'CT202501002', order_id: 'ord-002', order_no: 'PO202501002', style_id: 'style-002', style_no: 'ST2025002', color: '黑色', material_id: 'mat-002', material_name: '涤棉混纺布', material_usage: 450, layer_count: 80, marker_length: 15.2, marker_efficiency: 82.3, total_pieces: 800, cutting_date: '2025-01-10', cutter: '郑浩', cutting_table: 'B桌', status: 'completed' },
      { id: 'cut-003', cutting_no: 'CT202501003', order_id: 'ord-003', order_no: 'PO202501003', style_id: 'style-003', style_no: 'ST2025003', color: '深蓝', material_id: 'mat-003', material_name: '弹力牛仔布', material_usage: 600, layer_count: 60, marker_length: 18.0, marker_efficiency: 88.1, total_pieces: 1500, cutting_date: '2025-01-12', cutter: '张伟', cutting_table: 'A桌', status: 'cutting' },
    ];

    try {
      for (const record of cuttingRecords) {
        await client.from('cutting_records').upsert(record, { onConflict: 'cutting_no' });
      }
      results.push('✅ 创建裁床记录');
      counts.cuttingRecords = cuttingRecords.length;
    } catch (e) {
      results.push('⚠️ 裁床记录已存在');
    }

    // ==========================================
    // 14. 裁床分扎数据
    // ==========================================
    const cuttingBundles = [
      { id: 'bdl-001', bundle_no: 'B202501001-S', cutting_id: 'cut-001', cutting_no: 'CT202501001', order_id: 'ord-001', order_no: 'PO202501001', size: 'S', color: '白色', quantity: 200, layer_from: 1, layer_to: 50, status: 'completed', current_process: '包装', barcode: 'BC001S' },
      { id: 'bdl-002', bundle_no: 'B202501001-M', cutting_id: 'cut-001', cutting_no: 'CT202501001', order_id: 'ord-001', order_no: 'PO202501001', size: 'M', color: '白色', quantity: 300, layer_from: 1, layer_to: 75, status: 'completed', current_process: '包装', barcode: 'BC001M' },
      { id: 'bdl-003', bundle_no: 'B202501001-L', cutting_id: 'cut-001', cutting_no: 'CT202501001', order_id: 'ord-001', order_no: 'PO202501001', size: 'L', color: '白色', quantity: 250, layer_from: 1, layer_to: 62, status: 'in_production', current_process: '上领', barcode: 'BC001L' },
      { id: 'bdl-004', bundle_no: 'B202501001-XL', cutting_id: 'cut-001', cutting_no: 'CT202501001', order_id: 'ord-001', order_no: 'PO202501001', size: 'XL', color: '白色', quantity: 150, layer_from: 1, layer_to: 37, status: 'in_production', current_process: '合肩缝', barcode: 'BC001XL' },
      { id: 'bdl-005', bundle_no: 'B202501002-S', cutting_id: 'cut-002', cutting_no: 'CT202501002', order_id: 'ord-002', order_no: 'PO202501002', size: 'S', color: '黑色', quantity: 100, layer_from: 1, layer_to: 40, status: 'in_production', current_process: '合侧缝', barcode: 'BC002S' },
      { id: 'bdl-006', bundle_no: 'B202501002-M', cutting_id: 'cut-002', cutting_no: 'CT202501002', order_id: 'ord-002', order_no: 'PO202501002', size: 'M', color: '黑色', quantity: 150, layer_from: 1, layer_to: 60, status: 'in_production', current_process: '上领', barcode: 'BC002M' },
    ];

    try {
      for (const bundle of cuttingBundles) {
        await client.from('cutting_bundles').upsert(bundle, { onConflict: 'bundle_no' });
      }
      results.push('✅ 创建裁床分扎数据');
      counts.cuttingBundles = cuttingBundles.length;
    } catch (e) {
      results.push('⚠️ 裁床分扎数据已存在');
    }

    // ==========================================
    // 15. 工票数据
    // ==========================================
    const workTickets = [
      { id: 'tkt-001', ticket_no: 'TK202501001', bundle_id: 'bdl-001', bundle_no: 'B202501001-S', order_id: 'ord-001', order_no: 'PO202501001', process_id: 'proc-003', process_name: '合肩缝', employee_id: 'emp-002', employee_name: '李娜', quantity: 200, completed_quantity: 200, defect_quantity: 2, unit_price: 0.4, total_amount: 80, status: 'completed' },
      { id: 'tkt-002', ticket_no: 'TK202501002', bundle_id: 'bdl-001', bundle_no: 'B202501001-S', order_id: 'ord-001', order_no: 'PO202501001', process_id: 'proc-004', process_name: '合侧缝', employee_id: 'emp-003', employee_name: '王芳', quantity: 200, completed_quantity: 200, defect_quantity: 0, unit_price: 0.6, total_amount: 120, status: 'completed' },
      { id: 'tkt-003', ticket_no: 'TK202501003', bundle_id: 'bdl-001', bundle_no: 'B202501001-S', order_id: 'ord-001', order_no: 'PO202501001', process_id: 'proc-005', process_name: '上领', employee_id: 'emp-003', employee_name: '王芳', quantity: 200, completed_quantity: 180, defect_quantity: 3, unit_price: 1.0, total_amount: 180, status: 'in_progress' },
      { id: 'tkt-004', ticket_no: 'TK202501004', bundle_id: 'bdl-003', bundle_no: 'B202501001-L', order_id: 'ord-001', order_no: 'PO202501001', process_id: 'proc-003', process_name: '合肩缝', employee_id: 'emp-008', employee_name: '周洋', quantity: 250, completed_quantity: 200, defect_quantity: 5, unit_price: 0.4, total_amount: 80, status: 'in_progress' },
      { id: 'tkt-005', ticket_no: 'TK202501005', bundle_id: 'bdl-005', bundle_no: 'B202501002-S', order_id: 'ord-002', order_no: 'PO202501002', process_id: 'proc-003', process_name: '合肩缝', employee_id: 'emp-004', employee_name: '刘强', quantity: 100, completed_quantity: 100, defect_quantity: 1, unit_price: 0.4, total_amount: 40, status: 'completed' },
    ];

    try {
      for (const ticket of workTickets) {
        await client.from('work_tickets').upsert(ticket, { onConflict: 'ticket_no' });
      }
      results.push('✅ 创建工票数据');
      counts.workTickets = workTickets.length;
    } catch (e) {
      results.push('⚠️ 工票数据已存在');
    }

    // ==========================================
    // 16. 质检记录数据
    // ==========================================
    const qualityInspections = [
      { id: generateId(), inspection_no: 'QC202501001', order_id: 'ord-001', order_no: 'PO202501001', bundle_id: 'bdl-001', bundle_no: 'B202501001-S', process_id: 'proc-011', process_name: '质检', inspection_type: 'in_process', inspector: '赵敏', inspection_date: '2025-01-10', sample_quantity: 20, pass_quantity: 18, defect_quantity: 2, defect_rate: 10, result: 'pass', defect_details: { '线头': 1, '跳线': 1 } },
      { id: generateId(), inspection_no: 'QC202501002', order_id: 'ord-001', order_no: 'PO202501001', bundle_id: 'bdl-002', bundle_no: 'B202501001-M', process_id: 'proc-011', process_name: '质检', inspection_type: 'in_process', inspector: '赵敏', inspection_date: '2025-01-11', sample_quantity: 25, pass_quantity: 25, defect_quantity: 0, defect_rate: 0, result: 'pass' },
      { id: generateId(), inspection_no: 'QC202501003', order_id: 'ord-002', order_no: 'PO202501002', bundle_id: 'bdl-005', bundle_no: 'B202501002-S', process_id: 'proc-011', process_name: '质检', inspection_type: 'first_piece', inspector: '赵敏', inspection_date: '2025-01-12', sample_quantity: 5, pass_quantity: 4, defect_quantity: 1, defect_rate: 20, result: 'conditional_pass', defect_details: { '尺寸偏差': 1 } },
    ];

    try {
      for (const inspection of qualityInspections) {
        await client.from('quality_inspections').upsert(inspection, { onConflict: 'inspection_no' });
      }
      results.push('✅ 创建质检记录');
      counts.qualityInspections = qualityInspections.length;
    } catch (e) {
      results.push('⚠️ 质检记录已存在');
    }

    // ==========================================
    // 17. 财务账单数据
    // ==========================================
    const bills = [
      { id: generateId(), bill_no: 'FI202501001', bill_type: 'receivable', category: 'order', related_id: 'ord-001', related_no: 'PO202501001', customer_id: customers[0]?.id, amount: 90000, paid_amount: 50000, due_date: '2025-01-30', status: 'partial' },
      { id: generateId(), bill_no: 'FI202501002', bill_type: 'receivable', category: 'order', related_id: 'ord-002', related_no: 'PO202501002', customer_id: customers[1]?.id, amount: 102400, paid_amount: 0, due_date: '2025-02-10', status: 'pending' },
      { id: generateId(), bill_no: 'FI202501003', bill_type: 'receivable', category: 'order', related_id: 'ord-004', related_no: 'PO202501004', customer_id: customers[3]?.id, amount: 129600, paid_amount: 129600, due_date: '2025-01-20', payment_date: '2025-01-18', status: 'paid' },
      { id: generateId(), bill_no: 'FI202501004', bill_type: 'payable', category: 'material', related_id: 'sup-001', related_no: 'PO-M001', supplier_id: 'sup-001', amount: 35000, paid_amount: 35000, due_date: '2025-01-15', payment_date: '2025-01-14', status: 'paid' },
      { id: generateId(), bill_no: 'FI202501005', bill_type: 'payable', category: 'material', related_id: 'sup-002', related_no: 'PO-M002', supplier_id: 'sup-002', amount: 12800, paid_amount: 0, due_date: '2025-01-25', status: 'pending' },
      { id: generateId(), bill_no: 'FI202501006', bill_type: 'payable', category: 'outsource', related_id: 'sup-003', related_no: 'OS-001', supplier_id: 'sup-003', amount: 8500, paid_amount: 0, due_date: '2025-02-05', status: 'pending' },
    ];

    try {
      for (const bill of bills) {
        await client.from('bills').upsert(bill, { onConflict: 'bill_no' });
      }
      results.push('✅ 创建财务账单');
      counts.bills = bills.length;
    } catch (e) {
      results.push('⚠️ 财务账单已存在');
    }

    // ==========================================
    // 18. 出货数据
    // ==========================================
    const shipments = [
      { id: generateId(), shipment_no: 'SH202501001', order_id: 'ord-004', order_no: 'PO202501004', customer_id: customers[3]?.id, customer_name: '太平鸟服饰', total_quantity: 1200, total_boxes: 24, total_weight: 180, shipping_method: '物流', carrier: '顺丰速运', tracking_no: 'SF1234567890', shipping_address: '浙江省宁波市鄞州区XXX路XXX号', contact_person: '赵主管', contact_phone: '13800001004', planned_date: '2025-01-15', actual_date: '2025-01-15', status: 'delivered', shipper: '孙磊' },
      { id: generateId(), shipment_no: 'SH202501002', order_id: 'ord-001', order_no: 'PO202501001', customer_id: customers[0]?.id, customer_name: '优衣库服饰有限公司', total_quantity: 600, total_boxes: 12, total_weight: 90, shipping_method: '物流', carrier: '德邦物流', tracking_no: 'DP0987654321', shipping_address: '上海市浦东新区XXX路XXX号', contact_person: '张采购', contact_phone: '13800001001', planned_date: '2025-01-20', status: 'shipped', shipper: '孙磊' },
      { id: generateId(), shipment_no: 'SH202501003', order_id: 'ord-007', order_no: 'PO202412001', customer_id: customers[0]?.id, customer_name: '优衣库服饰有限公司', total_quantity: 3000, total_boxes: 60, total_weight: 450, shipping_method: '物流', carrier: '顺丰速运', tracking_no: 'SF1111222333', shipping_address: '上海市浦东新区XXX路XXX号', contact_person: '张采购', contact_phone: '13800001001', planned_date: '2024-12-20', actual_date: '2024-12-20', status: 'delivered', shipper: '孙磊' },
    ];

    try {
      for (const shipment of shipments) {
        await client.from('shipments').upsert(shipment, { onConflict: 'shipment_no' });
      }
      results.push('✅ 创建出货数据');
      counts.shipments = shipments.length;
    } catch (e) {
      results.push('⚠️ 出货数据已存在');
    }

    // ==========================================
    // 19. 通知数据
    // ==========================================
    const notifications = [
      { id: generateId(), type: 'shipping', level: 'warning', title: '出货即将到期', content: '订单PO202501001计划出货日期为2025-01-25，请及时安排', related_order: 'PO202501001', status: 'unread' },
      { id: generateId(), type: 'production', level: 'critical', title: '生产进度预警', content: '订单PO202501002进度仅45%，距交期还有10天，请关注', related_order: 'PO202501002', status: 'unread' },
      { id: generateId(), type: 'inventory', level: 'warning', title: '物料库存预警', content: '物料M003（弹力牛仔布）库存低于安全库存，请及时补货', status: 'unread' },
      { id: generateId(), type: 'quality', level: 'info', title: '质检报告已生成', content: '订单PO202501001首件检验已完成，结果：合格', related_order: 'PO202501001', status: 'read' },
      { id: generateId(), type: 'payment', level: 'warning', title: '应收账款提醒', content: '客户H&M中国有￥102,400应收款将于2025-02-10到期', status: 'unread' },
    ];

    try {
      for (const notification of notifications) {
        await client.from('notifications').upsert(notification, { onConflict: 'id' });
      }
      results.push('✅ 创建通知数据');
      counts.notifications = notifications.length;
    } catch (e) {
      results.push('⚠️ 通知数据已存在');
    }

    // ==========================================
    // 20. 库存事务记录
    // ==========================================
    const inventoryTransactions = [
      { id: generateId(), transaction_no: 'IT202501001', material_id: 'mat-001', type: 'in', quantity: 500, before_quantity: 700, after_quantity: 1200, unit: '公斤', unit_price: 45, total_amount: 22500, warehouse: '主仓库', related_order: 'PO-M001', related_type: 'purchase', operator: '孙磊' },
      { id: generateId(), transaction_no: 'IT202501002', material_id: 'mat-001', type: 'out', quantity: 800, before_quantity: 1200, after_quantity: 400, unit: '公斤', unit_price: 45, total_amount: 36000, warehouse: '主仓库', related_order: 'CT202501001', related_type: 'production', operator: '张伟' },
      { id: generateId(), transaction_no: 'IT202501003', material_id: 'mat-004', type: 'in', quantity: 1000, before_quantity: 2500, after_quantity: 3500, unit: '条', unit_price: 1.5, total_amount: 1500, warehouse: '主仓库', related_order: 'PO-M003', related_type: 'purchase', operator: '孙磊' },
    ];

    try {
      for (const transaction of inventoryTransactions) {
        await client.from('inventory_transactions').upsert(transaction, { onConflict: 'transaction_no' });
      }
      results.push('✅ 创建库存事务记录');
      counts.inventoryTransactions = inventoryTransactions.length;
    } catch (e) {
      results.push('⚠️ 库存事务记录已存在');
    }

    // ==========================================
    // 21. 外发订单数据
    // ==========================================
    const outsourceOrders = [
      { id: generateId(), outsource_no: 'OS202501001', bundle_id: 'bdl-005', bundle_no: 'B202501002-S', order_id: 'ord-002', order_no: 'PO202501002', supplier_id: 'sup-003', supplier_name: '华美刺绣加工厂', process_id: 'proc-005', process_name: '刺绣', send_quantity: 100, return_quantity: 0, defect_quantity: 0, unit_price: 8, total_amount: 800, send_date: '2025-01-12', expected_return_date: '2025-01-15', status: 'sent', sender: '王主管' },
    ];

    try {
      for (const order of outsourceOrders) {
        await client.from('bundle_outsource').upsert(order, { onConflict: 'outsource_no' });
      }
      results.push('✅ 创建外发订单');
      counts.outsourceOrders = outsourceOrders.length;
    } catch (e) {
      results.push('⚠️ 外发订单已存在');
    }

    // ==========================================
    // 22. 工资记录数据
    // ==========================================
    const salaryRecords = [
      { id: generateId(), employee_id: 'emp-002', employee_no: 'E002', employee_name: '李娜', year: 2025, month: 1, base_salary: 4500, piece_salary: 3200, overtime_salary: 400, bonus: 200, deduction: 0, total_salary: 8300, work_days: 22, overtime_hours: 12, piece_count: 850, status: 'confirmed' },
      { id: generateId(), employee_id: 'emp-003', employee_no: 'E003', employee_name: '王芳', year: 2025, month: 1, base_salary: 5000, piece_salary: 4500, overtime_salary: 500, bonus: 300, deduction: 0, total_salary: 10300, work_days: 22, overtime_hours: 15, piece_count: 1200, status: 'confirmed' },
      { id: generateId(), employee_id: 'emp-001', employee_no: 'E001', employee_name: '张伟', year: 2025, month: 1, base_salary: 8000, piece_salary: 2500, overtime_salary: 0, bonus: 500, deduction: 0, total_salary: 11000, work_days: 22, overtime_hours: 0, piece_count: 0, status: 'pending' },
    ];

    try {
      for (const record of salaryRecords) {
        await client.from('salary_records').upsert(record, { onConflict: 'employee_id,year,month' });
      }
      results.push('✅ 创建工资记录');
      counts.salaryRecords = salaryRecords.length;
    } catch (e) {
      results.push('⚠️ 工资记录已存在');
    }

    // ==========================================
    // 23. 设备数据
    // ==========================================
    const equipment = [
      { id: generateId(), equipment_no: 'EQ001', name: '平缝机', type: 'sewing_machine', brand: '重机', model: 'DDL-9000', production_line_id: 'line-001', purchase_date: '2022-03-15', purchase_price: 8500, warranty_months: 24, status: 'normal', daily_capacity: 150, efficiency: 95, operator: '李娜' },
      { id: generateId(), equipment_no: 'EQ002', name: '平缝机', type: 'sewing_machine', brand: '重机', model: 'DDL-9000', production_line_id: 'line-001', purchase_date: '2022-03-15', purchase_price: 8500, warranty_months: 24, status: 'normal', daily_capacity: 150, efficiency: 92, operator: '王芳' },
      { id: generateId(), equipment_no: 'EQ003', name: '自动裁床', type: 'cutting_machine', brand: '力克', model: 'Vector', production_line_id: 'line-005', purchase_date: '2021-06-01', purchase_price: 180000, warranty_months: 36, status: 'normal', daily_capacity: 500, efficiency: 98 },
      { id: generateId(), equipment_no: 'EQ004', name: '蒸汽熨斗', type: 'iron', brand: '宏光', model: 'HG-500', production_line_id: 'line-006', purchase_date: '2023-01-10', purchase_price: 2800, warranty_months: 12, status: 'normal', daily_capacity: 200, efficiency: 90 },
      { id: generateId(), equipment_no: 'EQ005', name: '锁眼机', type: 'sewing_machine', brand: '重机', model: 'LBH-1790', production_line_id: 'line-002', purchase_date: '2022-08-20', purchase_price: 15000, warranty_months: 24, status: 'maintenance', daily_capacity: 100, efficiency: 88 },
    ];

    try {
      for (const eq of equipment) {
        await client.from('equipment').upsert(eq, { onConflict: 'equipment_no' });
      }
      results.push('✅ 创建设备数据');
      counts.equipment = equipment.length;
    } catch (e) {
      results.push('⚠️ 设备数据已存在');
    }

    // ==========================================
    // 24. 公告数据
    // ==========================================
    const announcements = [
      { id: generateId(), title: '春节放假通知', content: '根据国家法定节假日安排，公司春节放假时间为2025年1月28日至2月4日，共8天。请各部门提前做好工作安排。', type: 'holiday', priority: 'high', status: 'published', publish_date: '2025-01-15' },
      { id: generateId(), title: '新员工入职培训', content: '将于本周六上午9点在会议室举行新员工入职培训，请相关部门主管安排好工作后参加。', type: 'training', priority: 'normal', status: 'published', publish_date: '2025-01-12' },
      { id: generateId(), title: '质量月活动启动', content: '本月为质量月，公司将开展系列质量提升活动，请全体员工积极参与。', type: 'activity', priority: 'normal', status: 'published', publish_date: '2025-01-05' },
    ];

    try {
      for (const announcement of announcements) {
        await client.from('announcements').upsert(announcement, { onConflict: 'id' });
      }
      results.push('✅ 创建公告数据');
      counts.announcements = announcements.length;
    } catch (e) {
      results.push('⚠️ 公告数据已存在');
    }

    return NextResponse.json({
      success: true,
      message: '完整演示数据初始化成功',
      results,
      counts,
      summary: {
        totalRecords: Object.values(counts).reduce((a, b) => a + b, 0)
      }
    });

  } catch (error) {
    console.error('Seed demo data error:', error);
    return NextResponse.json({
      success: false,
      error: '演示数据初始化失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
