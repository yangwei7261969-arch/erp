import { pgTable, serial, timestamp, varchar, text, boolean, integer, decimal, jsonb, index, date, uniqueIndex } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

// ============ 系统健康检查表（保留系统表） ============
export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// ============ 用户与权限管理 ============
// 用户表
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  password: text("password"),
  avatar: text("avatar"),
  department: varchar("department", { length: 100 }),
  position: varchar("position", { length: 100 }),
  status: varchar("status", { length: 20 }).default("active").notNull(), // active, inactive, resigned
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("users_email_idx").on(table.email),
  index("users_status_idx").on(table.status),
]);

// 角色表
export const roles = pgTable("roles", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 50 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  level: integer("level").default(1), // 权限级别
  isSystem: boolean("is_system").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 权限表
export const permissions = pgTable("permissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  module: varchar("module", { length: 50 }).notNull(), // 模块名：production, warehouse, finance...
  action: varchar("action", { length: 50 }).notNull(), // 操作：view, edit, delete, export, print...
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("permissions_module_action_idx").on(table.module, table.action),
]);

// 用户角色关联表
export const userRoles = pgTable("user_roles", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  roleId: varchar("role_id", { length: 36 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("user_roles_user_idx").on(table.userId),
  index("user_roles_role_idx").on(table.roleId),
]);

// 角色权限关联表
export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  roleId: varchar("role_id", { length: 36 }).notNull(),
  permissionId: varchar("permission_id", { length: 36 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("role_permissions_role_idx").on(table.roleId),
  index("role_permissions_permission_idx").on(table.permissionId),
]);

// ============ 生产管理 ============
// 生产工单
export const productionOrders = pgTable("production_orders", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  orderNo: varchar("order_no", { length: 50 }).notNull().unique(), // 工单号
  customerOrderNo: varchar("customer_order_no", { length: 50 }), // 客户订单号
  customerId: varchar("customer_id", { length: 36 }),
  styleNo: varchar("style_no", { length: 100 }), // 款号
  styleName: varchar("style_name", { length: 200 }), // 款名
  sku: varchar("sku", { length: 100 }), // SKU
  color: varchar("color", { length: 50 }),
  size: varchar("size", { length: 50 }),
  quantity: integer("quantity").notNull(),
  completedQuantity: integer("completed_quantity").default(0),
  defectiveQuantity: integer("defective_quantity").default(0),
  unit: varchar("unit", { length: 20 }).default("件"),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, cutting, sewing, ironing, packing, completed, cancelled
  priority: integer("priority").default(5), // 1-10，数字越小优先级越高
  planStartDate: date("plan_start_date"),
  planEndDate: date("plan_end_date"),
  actualStartDate: date("actual_start_date"),
  actualEndDate: date("actual_end_date"),
  factoryId: varchar("factory_id", { length: 36 }), // 生产工厂
  workshop: varchar("workshop", { length: 100 }), // 车间
  productionLine: varchar("production_line", { length: 100 }), // 产线
  notes: text("notes"),
  createdBy: varchar("created_by", { length: 36 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("production_orders_order_no_idx").on(table.orderNo),
  index("production_orders_status_idx").on(table.status),
  index("production_orders_customer_idx").on(table.customerId),
  index("production_orders_plan_date_idx").on(table.planStartDate, table.planEndDate),
]);

// 工序定义表
export const processes = pgTable("processes", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(), // 工序代码
  category: varchar("category", { length: 50 }), // 分类：裁床、缝制、大烫、包装等
  description: text("description"),
  standardTime: decimal("standard_time", { precision: 10, scale: 2 }), // 标准工时（分钟）
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }), // 单价
  sequence: integer("sequence").default(0), // 工序顺序
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("processes_code_idx").on(table.code),
  index("processes_category_idx").on(table.category),
]);

// 生产进度表
export const productionProgress = pgTable("production_progress", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id", { length: 36 }).notNull(),
  processId: varchar("process_id", { length: 36 }).notNull(),
  workerId: varchar("worker_id", { length: 36 }), // 操作员工
  quantity: integer("quantity").notNull(), // 完成数量
  defectiveQty: integer("defective_qty").default(0), // 次品数量
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, in_progress, completed
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  notes: text("notes"),
  createdBy: varchar("created_by", { length: 36 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("production_progress_order_idx").on(table.orderId),
  index("production_progress_process_idx").on(table.processId),
  index("production_progress_worker_idx").on(table.workerId),
]);

// ============ 客户与供应商 ============
// 客户表
export const customers = pgTable("customers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 50 }).notNull().unique(), // 客户编码
  name: varchar("name", { length: 200 }).notNull(),
  shortName: varchar("short_name", { length: 100 }),
  type: varchar("type", { length: 20 }).default("domestic"), // domestic, foreign
  level: varchar("level", { length: 20 }).default("normal"), // vip, important, normal
  contact: varchar("contact", { length: 100 }), // 联系人
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  taxNo: varchar("tax_no", { length: 100 }), // 税号
  bankName: varchar("bank_name", { length: 100 }),
  bankAccount: varchar("bank_account", { length: 100 }),
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }), // 授信额度
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0"), // 余额
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("customers_code_idx").on(table.code),
  index("customers_name_idx").on(table.name),
]);

// 供应商表
export const suppliers = pgTable("suppliers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  shortName: varchar("short_name", { length: 100 }),
  type: varchar("type", { length: 50 }), // fabric, accessory, equipment
  category: varchar("category", { length: 100 }), // 供应类别
  contact: varchar("contact", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  taxNo: varchar("tax_no", { length: 100 }),
  bankName: varchar("bank_name", { length: 100 }),
  bankAccount: varchar("bank_account", { length: 100 }),
  paymentTerms: varchar("payment_terms", { length: 200 }), // 付款条款
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0"),
  rating: integer("rating").default(3), // 评分 1-5
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("suppliers_code_idx").on(table.code),
  index("suppliers_name_idx").on(table.name),
]);

// ============ 仓库与库存 ============
// 物料表（布料、辅料）
export const materials = pgTable("materials", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // fabric布料, accessory辅料
  type: varchar("type", { length: 100 }), // 细分类
  unit: varchar("unit", { length: 20 }).default("米"), // 单位
  color: varchar("color", { length: 50 }),
  spec: varchar("spec", { length: 200 }), // 规格
  supplierId: varchar("supplier_id", { length: 36 }),
  safetyStock: decimal("safety_stock", { precision: 10, scale: 2 }), // 安全库存
  minOrderQty: decimal("min_order_qty", { precision: 10, scale: 2 }), // 最小订购量
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  warehouse: varchar("warehouse", { length: 100 }), // 仓库
  location: varchar("location", { length: 100 }), // 库位
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("materials_code_idx").on(table.code),
  index("materials_category_idx").on(table.category),
  index("materials_supplier_idx").on(table.supplierId),
]);

// 库存表
export const inventory = pgTable("inventory", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  materialId: varchar("material_id", { length: 36 }).notNull(),
  warehouse: varchar("warehouse", { length: 100 }).notNull(),
  location: varchar("location", { length: 100 }),
  quantity: decimal("quantity", { precision: 15, scale: 2 }).default("0").notNull(),
  lockedQty: decimal("locked_qty", { precision: 15, scale: 2 }).default("0"),
  availableQty: decimal("available_qty", { precision: 15, scale: 2 }),
  batchNo: varchar("batch_no", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("inventory_material_idx").on(table.materialId),
  index("inventory_warehouse_idx").on(table.warehouse),
]);

// 库存流水表
export const inventoryLogs = pgTable("inventory_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  materialId: varchar("material_id", { length: 36 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 2 }).notNull(),
  beforeQty: decimal("before_qty", { precision: 15, scale: 2 }),
  afterQty: decimal("after_qty", { precision: 15, scale: 2 }),
  warehouse: varchar("warehouse", { length: 100 }),
  location: varchar("location", { length: 100 }),
  relatedType: varchar("related_type", { length: 50 }),
  relatedId: varchar("related_id", { length: 36 }),
  batchNo: varchar("batch_no", { length: 50 }),
  notes: text("notes"),
  operatorId: varchar("operator_id", { length: 36 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("inventory_logs_material_idx").on(table.materialId),
  index("inventory_logs_type_idx").on(table.type),
  index("inventory_logs_created_idx").on(table.createdAt),
]);

// ============ 采购管理 ============
export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  orderNo: varchar("order_no", { length: 50 }).notNull().unique(),
  supplierId: varchar("supplier_id", { length: 36 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0"),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("CNY"),
  orderDate: date("order_date").notNull(),
  expectedDate: date("expected_date"),
  receivedDate: date("received_date"),
  paymentTerms: varchar("payment_terms", { length: 200 }),
  notes: text("notes"),
  createdBy: varchar("created_by", { length: 36 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("purchase_orders_order_no_idx").on(table.orderNo),
  index("purchase_orders_supplier_idx").on(table.supplierId),
  index("purchase_orders_status_idx").on(table.status),
]);

export const purchaseItems = pgTable("purchase_items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id", { length: 36 }).notNull(),
  materialId: varchar("material_id", { length: 36 }).notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  receivedQty: decimal("received_qty", { precision: 15, scale: 2 }).default("0"),
  returnedQty: decimal("returned_qty", { precision: 15, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("purchase_items_order_idx").on(table.orderId),
  index("purchase_items_material_idx").on(table.materialId),
]);

// ============ 财务管理 ============
export const bills = pgTable("bills", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  billNo: varchar("bill_no", { length: 50 }).notNull().unique(),
  type: varchar("type", { length: 20 }).notNull(),
  category: varchar("category", { length: 50 }),
  relatedType: varchar("related_type", { length: 50 }),
  relatedId: varchar("related_id", { length: 36 }),
  customerId: varchar("customer_id", { length: 36 }),
  supplierId: varchar("supplier_id", { length: 36 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).default("0"),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  billDate: date("bill_date").notNull(),
  dueDate: date("due_date"),
  paidDate: date("paid_date"),
  notes: text("notes"),
  attachments: jsonb("attachments"),
  createdBy: varchar("created_by", { length: 36 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("bills_bill_no_idx").on(table.billNo),
  index("bills_type_idx").on(table.type),
  index("bills_status_idx").on(table.status),
]);

export const payments = pgTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  paymentNo: varchar("payment_no", { length: 50 }).notNull().unique(),
  billId: varchar("bill_id", { length: 36 }),
  type: varchar("type", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  method: varchar("method", { length: 50 }),
  bankAccount: varchar("bank_account", { length: 100 }),
  paymentDate: date("payment_date").notNull(),
  voucherNo: varchar("voucher_no", { length: 50 }),
  notes: text("notes"),
  attachments: jsonb("attachments"),
  operatorId: varchar("operator_id", { length: 36 }),
  auditStatus: varchar("audit_status", { length: 20 }).default("pending"),
  auditBy: varchar("audit_by", { length: 36 }),
  auditAt: timestamp("audit_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("payments_payment_no_idx").on(table.paymentNo),
  index("payments_bill_idx").on(table.billId),
]);

export const invoices = pgTable("invoices", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  invoiceNo: varchar("invoice_no", { length: 50 }).notNull().unique(),
  billId: varchar("bill_id", { length: 36 }),
  type: varchar("type", { length: 20 }).notNull(),
  invoiceType: varchar("invoice_type", { length: 50 }),
  customerId: varchar("customer_id", { length: 36 }),
  supplierId: varchar("supplier_id", { length: 36 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  invoiceDate: date("invoice_date").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  notes: text("notes"),
  attachments: jsonb("attachments"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("invoices_invoice_no_idx").on(table.invoiceNo),
  index("invoices_type_idx").on(table.type),
]);

// ============ 人事管理 ============
export const employees = pgTable("employees", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  employeeNo: varchar("employee_no", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  gender: varchar("gender", { length: 10 }),
  birthDate: date("birth_date"),
  idCard: varchar("id_card", { length: 20 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  department: varchar("department", { length: 100 }),
  position: varchar("position", { length: 100 }),
  workshop: varchar("workshop", { length: 100 }),
  skillLevel: varchar("skill_level", { length: 20 }),
  joinDate: date("join_date"),
  leaveDate: date("leave_date"),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }),
  bankName: varchar("bank_name", { length: 100 }),
  bankAccount: varchar("bank_account", { length: 100 }),
  emergencyContact: varchar("emergency_contact", { length: 100 }),
  emergencyPhone: varchar("emergency_phone", { length: 20 }),
  address: text("address"),
  photo: text("photo"),
  notes: text("notes"),
  userId: varchar("user_id", { length: 36 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("employees_employee_no_idx").on(table.employeeNo),
  index("employees_name_idx").on(table.name),
  index("employees_status_idx").on(table.status),
]);

export const salaries = pgTable("salaries", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id", { length: 36 }).notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  overtimePay: decimal("overtime_pay", { precision: 10, scale: 2 }).default("0"),
  bonus: decimal("bonus", { precision: 10, scale: 2 }).default("0"),
  allowance: decimal("allowance", { precision: 10, scale: 2 }).default("0"),
  deduction: decimal("deduction", { precision: 10, scale: 2 }).default("0"),
  utilityFee: decimal("utility_fee", { precision: 10, scale: 2 }).default("0"),
  rentFee: decimal("rent_fee", { precision: 10, scale: 2 }).default("0"),
  otherDeduction: decimal("other_deduction", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  confirmedBy: varchar("confirmed_by", { length: 36 }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  employeeSigned: boolean("employee_signed").default(false),
  signedAt: timestamp("signed_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("salaries_employee_idx").on(table.employeeId),
  index("salaries_year_month_idx").on(table.year, table.month),
]);

// ============ 裁床与工艺 ============
export const cuttingOrders = pgTable("cutting_orders", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  orderNo: varchar("order_no", { length: 50 }).notNull().unique(),
  productionOrderId: varchar("production_order_id", { length: 36 }),
  styleNo: varchar("style_no", { length: 100 }),
  color: varchar("color", { length: 50 }),
  fabricCode: varchar("fabric_code", { length: 50 }),
  fabricQty: decimal("fabric_qty", { precision: 15, scale: 2 }),
  cuttingQty: integer("cutting_qty").notNull(),
  completedQty: integer("completed_qty").default(0),
  defectiveQty: integer("defective_qty").default(0),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  cuttingDate: date("cutting_date"),
  workshop: varchar("workshop", { length: 100 }),
  cuttingTeam: varchar("cutting_team", { length: 100 }),
  operatorId: varchar("operator_id", { length: 36 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("cutting_orders_order_no_idx").on(table.orderNo),
  index("cutting_orders_status_idx").on(table.status),
]);

export const craftProcesses = pgTable("craft_processes", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  productionOrderId: varchar("production_order_id", { length: 36 }).notNull(),
  processName: varchar("process_name", { length: 100 }).notNull(),
  processType: varchar("process_type", { length: 50 }),
  quantity: integer("quantity").notNull(),
  completedQty: integer("completed_qty").default(0),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }),
  supplierId: varchar("supplier_id", { length: 36 }),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("craft_processes_production_idx").on(table.productionOrderId),
  index("craft_processes_status_idx").on(table.status),
]);

// ============ 成衣库存 ============
export const finishedGoods = pgTable("finished_goods", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  styleNo: varchar("style_no", { length: 100 }),
  styleName: varchar("style_name", { length: 200 }),
  color: varchar("color", { length: 50 }),
  size: varchar("size", { length: 50 }),
  unit: varchar("unit", { length: 20 }).default("件"),
  brand: varchar("brand", { length: 100 }),
  season: varchar("season", { length: 50 }),
  year: integer("year"),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  notes: text("notes"),
  images: jsonb("images"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("finished_goods_sku_idx").on(table.sku),
]);

export const finishedInventory = pgTable("finished_inventory", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  goodsId: varchar("goods_id", { length: 36 }).notNull(),
  warehouse: varchar("warehouse", { length: 100 }).notNull(),
  location: varchar("location", { length: 100 }),
  quantity: integer("quantity").default(0).notNull(),
  lockedQty: integer("locked_qty").default(0),
  availableQty: integer("available_qty"),
  batchNo: varchar("batch_no", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("finished_inventory_goods_idx").on(table.goodsId),
]);

// ============ 出货管理 ============
export const shipments = pgTable("shipments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  shipmentNo: varchar("shipment_no", { length: 50 }).notNull().unique(),
  orderId: varchar("order_id", { length: 36 }),
  customerId: varchar("customer_id", { length: 36 }).notNull(),
  shipmentDate: date("shipment_date").notNull(),
  totalQty: integer("total_qty").notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  courier: varchar("courier", { length: 100 }),
  trackingNo: varchar("tracking_no", { length: 100 }),
  shippingAddress: text("shipping_address"),
  receiver: varchar("receiver", { length: 100 }),
  receiverPhone: varchar("receiver_phone", { length: 20 }),
  notes: text("notes"),
  operatorId: varchar("operator_id", { length: 36 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("shipments_shipment_no_idx").on(table.shipmentNo),
  index("shipments_customer_idx").on(table.customerId),
]);

export const shipmentItems = pgTable("shipment_items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  shipmentId: varchar("shipment_id", { length: 36 }).notNull(),
  goodsId: varchar("goods_id", { length: 36 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  amount: decimal("amount", { precision: 15, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("shipment_items_shipment_idx").on(table.shipmentId),
]);

export const returns = pgTable("returns", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  returnNo: varchar("return_no", { length: 50 }).notNull().unique(),
  shipmentId: varchar("shipment_id", { length: 36 }),
  customerId: varchar("customer_id", { length: 36 }),
  returnDate: date("return_date").notNull(),
  totalQty: integer("total_qty").notNull(),
  reason: text("reason"),
  type: varchar("type", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  defectiveReport: text("defective_report"),
  refundAmount: decimal("refund_amount", { precision: 15, scale: 2 }),
  notes: text("notes"),
  operatorId: varchar("operator_id", { length: 36 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("returns_return_no_idx").on(table.returnNo),
  index("returns_status_idx").on(table.status),
]);

// ============ 系统管理 ============
export const announcements = pgTable("announcements", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 20 }).default("general"),
  targetRoles: jsonb("target_roles"),
  isPublished: boolean("is_published").default(false).notNull(),
  publishAt: timestamp("publish_at", { withTimezone: true }),
  expireAt: timestamp("expire_at", { withTimezone: true }),
  authorId: varchar("author_id", { length: 36 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("announcements_type_idx").on(table.type),
]);

export const systemLogs = pgTable("system_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  module: varchar("module", { length: 50 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  description: text("description"),
  userId: varchar("user_id", { length: 36 }),
  userName: varchar("user_name", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  requestData: jsonb("request_data"),
  responseData: jsonb("response_data"),
  status: varchar("status", { length: 20 }).default("success"),
  errorMessage: text("error_message"),
  duration: integer("duration"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("system_logs_module_idx").on(table.module),
  index("system_logs_user_idx").on(table.userId),
]);

export const aiLogs = pgTable("ai_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }),
  module: varchar("module", { length: 50 }),
  action: varchar("action", { length: 100 }),
  input: text("input"),
  output: text("output"),
  tokens: integer("tokens"),
  model: varchar("model", { length: 100 }),
  duration: integer("duration"),
  status: varchar("status", { length: 20 }).default("success"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("ai_logs_user_idx").on(table.userId),
]);

export const systemSettings = pgTable("system_settings", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  updatedBy: varchar("updated_by", { length: 36 }),
});

// ============ Zod Schemas ============
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

export const insertUserSchema = createCoercedInsertSchema(users).pick({
  email: true,
  name: true,
  phone: true,
  password: true,
  department: true,
  position: true,
});

export const updateUserSchema = createCoercedInsertSchema(users)
  .pick({
    name: true,
    phone: true,
    department: true,
    position: true,
    status: true,
    avatar: true,
  })
  .partial();

export const insertProductionOrderSchema = createCoercedInsertSchema(productionOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerSchema = createCoercedInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierSchema = createCoercedInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeSchema = createCoercedInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============ TypeScript Types ============
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Role = typeof roles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;

export type ProductionOrder = typeof productionOrders.$inferSelect;
export type InsertProductionOrder = z.infer<typeof insertProductionOrderSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Material = typeof materials.$inferSelect;
export type Inventory = typeof inventory.$inferSelect;
export type InventoryLog = typeof inventoryLogs.$inferSelect;

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type PurchaseItem = typeof purchaseItems.$inferSelect;

export type Bill = typeof bills.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;

export type Salary = typeof salaries.$inferSelect;
export type CuttingOrder = typeof cuttingOrders.$inferSelect;
export type CraftProcess = typeof craftProcesses.$inferSelect;

export type FinishedGood = typeof finishedGoods.$inferSelect;
export type FinishedInventory = typeof finishedInventory.$inferSelect;

export type Shipment = typeof shipments.$inferSelect;
export type ShipmentItem = typeof shipmentItems.$inferSelect;
export type Return = typeof returns.$inferSelect;

export type Announcement = typeof announcements.$inferSelect;
export type SystemLog = typeof systemLogs.$inferSelect;
export type AiLog = typeof aiLogs.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
