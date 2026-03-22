'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Brain,
  Cpu,
  MapPin,
  Building,
  Calculator,
  Users,
  ShoppingCart,
  FileCode,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

const features = [
  {
    id: 'ai-core',
    title: 'AI智能核心',
    description: '智能排产、质量预测、工艺优化、异常检测等AI驱动的核心能力',
    icon: Brain,
    color: 'bg-purple-100 dark:bg-purple-900 text-purple-600',
    status: '已上线',
    capabilities: ['智能排产优化', '质量预测分析', '工艺参数优化', '异常智能检测'],
    link: '/ai-assistant',
  },
  {
    id: 'equipment',
    title: '设备管理',
    description: 'IoT设备接入、状态监控、预测性维护、OEE分析',
    icon: Cpu,
    color: 'bg-blue-100 dark:bg-blue-900 text-blue-600',
    status: '已上线',
    capabilities: ['设备状态实时监控', '预测性维护', 'OEE效率分析', '设备台账管理'],
    link: '/production-dashboard',
  },
  {
    id: 'tracking',
    title: '全流程追踪',
    description: 'RFID/条码追踪、生产进度可视化、工序流转记录',
    icon: MapPin,
    color: 'bg-green-100 dark:bg-green-900 text-green-600',
    status: '已上线',
    capabilities: ['RFID实时追踪', '工序流转记录', '生产进度可视化', '质量追溯查询'],
    link: '/process-tracking',
  },
  {
    id: 'multi-factory',
    title: '多工厂协同',
    description: '多工厂管理、产能调度、跨厂协同生产',
    icon: Building,
    color: 'bg-orange-100 dark:bg-orange-900 text-orange-600',
    status: '已上线',
    capabilities: ['多工厂统一管理', '产能智能调度', '跨厂协同生产', '工厂绩效对比'],
    link: '/production-prep',
  },
  {
    id: 'profit-sharing',
    title: '智能分账',
    description: '多角色利润分配、自动结算、账务透明',
    icon: Calculator,
    color: 'bg-red-100 dark:bg-red-900 text-red-600',
    status: '已上线',
    capabilities: ['多角色利润分配', '自动结算分账', '账务透明可查', '结算报表导出'],
    link: '/supplier-payment',
  },
  {
    id: 'saas',
    title: 'SaaS多租户',
    description: '多企业独立部署、数据隔离、权限分级',
    icon: Users,
    color: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600',
    status: '已上线',
    capabilities: ['多企业独立空间', '数据完全隔离', '权限分级管理', '企业独立域名'],
    link: '/permissions',
  },
  {
    id: 'customer-order',
    title: '客户自助下单',
    description: '客户在线下单、进度查询、交付确认',
    icon: ShoppingCart,
    color: 'bg-teal-100 dark:bg-teal-900 text-teal-600',
    status: '已上线',
    capabilities: ['在线自助下单', '实时进度查询', '交付确认签收', '历史订单查看'],
    link: '/customers',
  },
  {
    id: 'cad-integration',
    title: 'CAD对接',
    description: 'CAD文件导入、工艺解析、BOM自动生成',
    icon: FileCode,
    color: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-600',
    status: '已上线',
    capabilities: ['CAD文件导入', '工艺自动解析', 'BOM自动生成', '版型智能识别'],
    link: '/style-processes',
  },
  {
    id: 'batch-management',
    title: '批次管理',
    description: '生产批次追溯、批次属性、批次关联查询',
    icon: Layers,
    color: 'bg-amber-100 dark:bg-amber-900 text-amber-600',
    status: '已上线',
    capabilities: ['批次全程追溯', '批次属性管理', '批次关联查询', '批次质量分析'],
    link: '/cutting-bundles',
  },
];

export default function AdvancedFeaturesPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* 标题区域 */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-500" />
          <h1 className="text-3xl font-bold">高级功能中心</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          专为服装生产制造打造的智能化、数字化解决方案，助力企业降本增效、提升竞争力
        </p>
      </div>

      {/* 功能卡片网格 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.id} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {feature.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {feature.capabilities.map((cap, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {cap}
                    </div>
                  ))}
                </div>
                <Link href={feature.link}>
                  <Button className="w-full group-hover:bg-primary/90">
                    进入功能
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 功能对比 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>功能价值对比</CardTitle>
          <CardDescription>传统方式 vs 智能化升级</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-red-600 dark:text-red-400">传统方式痛点</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>❌ 排产靠人工经验，效率低易出错</li>
                <li>❌ 设备故障被动响应，停机损失大</li>
                <li>❌ 生产进度不透明，客户投诉多</li>
                <li>❌ 多工厂协调困难，资源浪费</li>
                <li>❌ 分账计算繁琐，财务对账难</li>
                <li>❌ 数据孤岛，无法支撑决策</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-green-600 dark:text-green-400">智能化升级价值</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✅ AI智能排产，效率提升40%</li>
                <li>✅ 预测性维护，停机减少60%</li>
                <li>✅ 全流程追踪，透明可控</li>
                <li>✅ 多工厂协同，产能优化30%</li>
                <li>✅ 自动分账，效率提升80%</li>
                <li>✅ 数据驱动决策，竞争力提升</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
