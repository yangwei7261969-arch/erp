'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  AlertTriangle,
  BarChart3,
  Package,
  TrendingUp,
  Loader2,
  Play,
} from 'lucide-react';

const features = [
  {
    id: 'ai-core',
    title: 'AI智能核心',
    description: '基于真实业务数据的智能分析，支持自然语言交互，实时查询订单、库存、财务数据',
    icon: Brain,
    color: 'bg-purple-100 dark:bg-purple-900 text-purple-600',
    status: 'AI已接入',
    capabilities: ['智能对话分析', '实时数据查询', '异常预警检测', '优化建议生成'],
    link: '/ai-assistant',
    highlight: true,
  },
  {
    id: 'smart-schedule',
    title: '智能排产',
    description: 'AI驱动排产优化，自动分析订单优先级、产能瓶颈、交付风险，生成最优排产方案',
    icon: BarChart3,
    color: 'bg-blue-100 dark:bg-blue-900 text-blue-600',
    status: 'AI已接入',
    capabilities: ['订单优先级分析', '产能瓶颈识别', '排产方案生成', '风险预警提示'],
    link: '/smart-schedule',
    highlight: true,
  },
  {
    id: 'smart-alert',
    title: '智能预警',
    description: '实时监控生产异常，AI自动识别延迟订单、库存不足、财务风险等问题',
    icon: AlertTriangle,
    color: 'bg-red-100 dark:bg-red-900 text-red-600',
    status: 'AI已接入',
    capabilities: ['延迟订单预警', '库存不足预警', '财务风险预警', '根因分析建议'],
    link: '/smart-alert',
    highlight: true,
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

// 快速分析卡片组件
function QuickAnalysisCard() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  const handleQuickAnalysis = async (type: string) => {
    setLoading(type);
    setResult(null);
    
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ 
            role: 'user', 
            content: type === 'production' 
              ? '快速分析当前生产订单状态，列出需要关注的关键问题' 
              : type === 'inventory'
              ? '检查当前库存状态，列出库存不足的物料'
              : type === 'alert'
              ? '分析当前有哪些需要预警的问题，按严重程度排序'
              : '分析本月财务状况'
          }],
          stream: false,
        }),
      });
      
      const data = await response.json();
      if (data.content) {
        setResult(data.content);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setResult('分析失败，请稍后重试');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <CardTitle className="text-lg">AI 快速分析</CardTitle>
        </div>
        <CardDescription>一键获取智能分析报告</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Button 
            variant="outline" 
            className="h-auto flex-col gap-1 py-3"
            onClick={() => handleQuickAnalysis('production')}
            disabled={loading !== null}
          >
            {loading === 'production' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            <span className="text-xs">生产分析</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex-col gap-1 py-3"
            onClick={() => handleQuickAnalysis('inventory')}
            disabled={loading !== null}
          >
            {loading === 'inventory' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Package className="h-4 w-4" />
            )}
            <span className="text-xs">库存检查</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex-col gap-1 py-3"
            onClick={() => handleQuickAnalysis('alert')}
            disabled={loading !== null}
          >
            {loading === 'alert' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span className="text-xs">异常预警</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex-col gap-1 py-3"
            onClick={() => handleQuickAnalysis('finance')}
            disabled={loading !== null}
          >
            {loading === 'finance' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            <span className="text-xs">财务概览</span>
          </Button>
        </div>
        
        {result && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg border text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
            {result}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => router.push('/ai-assistant')}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            打开完整AI助手
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

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
          AI驱动的智能生产管理系统，助力企业降本增效、提升竞争力
        </p>
      </div>

      {/* AI 快速分析 */}
      <QuickAnalysisCard />

      {/* AI功能区域 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          AI 智能功能
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {features.filter(f => f.highlight).map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.id} className="group hover:shadow-lg transition-all duration-300 hover:border-purple-500/50 ring-2 ring-purple-100 dark:ring-purple-900">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      <Sparkles className="h-3 w-3 mr-1" />
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
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        {cap}
                      </div>
                    ))}
                  </div>
                  <Link href={feature.link}>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Play className="h-4 w-4 mr-2" />
                      开始使用
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 其他功能区域 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">更多功能</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.filter(f => !f.highlight).map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.id} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-3">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={feature.link}>
                    <Button variant="outline" className="w-full">
                      进入功能
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 功能对比 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>智能化升级价值</CardTitle>
          <CardDescription>传统方式 vs AI智能化升级</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-red-600 dark:text-red-400">传统方式痛点</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>❌ 排产靠人工经验，效率低易出错</li>
                <li>❌ 数据分析靠Excel，耗时且不直观</li>
                <li>❌ 生产进度不透明，客户投诉多</li>
                <li>❌ 异常发现滞后，损失已经造成</li>
                <li>❌ 分账计算繁琐，财务对账难</li>
                <li>❌ 数据孤岛，无法支撑决策</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-green-600 dark:text-green-400">AI智能化升级价值</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✅ AI智能排产，效率提升40%</li>
                <li>✅ 自然语言查询，秒级获取答案</li>
                <li>✅ 全流程追踪，透明可控</li>
                <li>✅ 实时异常预警，提前规避风险</li>
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
