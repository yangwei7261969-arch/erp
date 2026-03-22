'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  ArrowLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

const features = [
  {
    id: 'ai-core',
    title: 'AI智能核心',
    description: '基于真实业务数据的智能分析，支持自然语言交互',
    icon: Sparkles,
    color: 'bg-primary',
    status: 'AI已接入',
    link: '/ai-assistant',
    highlight: true,
  },
  {
    id: 'smart-schedule',
    title: '智能排产',
    description: 'AI驱动排产优化，自动分析订单优先级、产能瓶颈',
    icon: BarChart3,
    color: 'bg-blue-500',
    status: 'AI已接入',
    link: '/smart-schedule',
    highlight: true,
  },
  {
    id: 'smart-alert',
    title: '智能预警',
    description: '实时监控生产异常，AI自动识别延迟订单、库存风险',
    icon: AlertTriangle,
    color: 'bg-red-500',
    status: 'AI已接入',
    link: '/smart-alert',
    highlight: true,
  },
  {
    id: 'equipment',
    title: '设备管理',
    description: 'IoT设备接入、状态监控、预测性维护、OEE分析',
    icon: Cpu,
    color: 'bg-cyan-500',
    status: '已上线',
    link: '/production-dashboard',
  },
  {
    id: 'tracking',
    title: '全流程追踪',
    description: 'RFID/条码追踪、生产进度可视化、工序流转记录',
    icon: MapPin,
    color: 'bg-green-500',
    status: '已上线',
    link: '/process-tracking',
  },
  {
    id: 'multi-factory',
    title: '多工厂协同',
    description: '多工厂管理、产能调度、跨厂协同生产',
    icon: Building,
    color: 'bg-primary',
    status: '已上线',
    link: '/production-prep',
  },
  {
    id: 'profit-sharing',
    title: '智能分账',
    description: '多角色利润分配、自动结算、账务透明',
    icon: Calculator,
    color: 'bg-rose-500',
    status: '已上线',
    link: '/supplier-payment',
  },
  {
    id: 'saas',
    title: 'SaaS多租户',
    description: '多企业独立部署、数据隔离、权限分级',
    icon: Users,
    color: 'bg-violet-500',
    status: '已上线',
    link: '/permissions',
  },
  {
    id: 'customer-order',
    title: '客户自助下单',
    description: '客户在线下单、进度查询、交付确认',
    icon: ShoppingCart,
    color: 'bg-teal-500',
    status: '已上线',
    link: '/customers',
  },
  {
    id: 'cad-integration',
    title: 'CAD对接',
    description: 'CAD文件导入、工艺解析、BOM自动生成',
    icon: FileCode,
    color: 'bg-sky-500',
    status: '已上线',
    link: '/style-processes',
  },
  {
    id: 'batch-management',
    title: '批次管理',
    description: '生产批次追溯、批次属性、批次关联查询',
    icon: Layers,
    color: 'bg-amber-500',
    status: '已上线',
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

  const quickActions = [
    { type: 'production', icon: BarChart3, label: '生产分析' },
    { type: 'inventory', icon: Package, label: '库存检查' },
    { type: 'alert', icon: AlertTriangle, label: '异常预警' },
    { type: 'finance', icon: TrendingUp, label: '财务概览' },
  ];

  return (
    <Card className="bg-gradient-to-r from-primary to-orange-500 text-white border-0 shadow-lg overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5" />
          <h3 className="font-semibold">AI 快速分析</h3>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {quickActions.map((action) => (
            <button
              key={action.type}
              onClick={() => handleQuickAnalysis(action.type)}
              disabled={loading !== null}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              {loading === action.type ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <action.icon className="h-5 w-5" />
              )}
              <span className="text-xs">{action.label}</span>
            </button>
          ))}
        </div>
        
        {result && (
          <div className="p-3 bg-white/10 rounded-xl text-sm whitespace-pre-wrap max-h-40 overflow-y-auto mb-3">
            {result}
          </div>
        )}
        
        <Button 
          className="w-full bg-white text-primary hover:bg-white/90 font-medium"
          onClick={() => router.push('/ai-assistant')}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          打开完整AI助手
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdvancedFeaturesPage() {
  const router = useRouter();
  const aiFeatures = features.filter(f => f.highlight);
  const otherFeatures = features.filter(f => !f.highlight);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* 顶部导航栏 */}
      <header className="bg-gradient-to-r from-primary to-orange-600 text-white sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/')}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">高级功能中心</h1>
              <p className="text-xs text-white/80">AI驱动的智能生产管理</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            {features.length} 项功能
          </Badge>
        </div>
      </header>

      <div className="p-4 space-y-4 pb-20">
        {/* AI 快速分析 */}
        <QuickAnalysisCard />

        {/* AI 智能功能 */}
        <div>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI 智能功能
          </h2>
          <div className="grid gap-3">
            {aiFeatures.map((feature) => (
              <Link
                key={feature.id}
                href={feature.link}
                className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 ${feature.color} rounded-xl flex items-center justify-center`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{feature.title}</h3>
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                        {feature.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{feature.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 其他功能 */}
        <div>
          <h2 className="text-base font-semibold mb-3">更多功能</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {otherFeatures.map((feature) => (
              <Link
                key={feature.id}
                href={feature.link}
                className="block bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`w-10 h-10 ${feature.color} rounded-xl flex items-center justify-center`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-xs">{feature.title}</h3>
                    <Badge variant="outline" className="text-[10px] mt-1">
                      {feature.status}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
