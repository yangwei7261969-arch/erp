'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart3,
  ArrowLeft,
  Sparkles,
  Send,
  Clock,
  Factory,
  Package,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Loader2,
  Calendar,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SmartSchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [result]);

  const handleGenerate = async () => {
    setLoading(true);
    setStreaming(true);
    setResult('');
    
    try {
      const response = await fetch('/api/smart-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stream: true }),
      });
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应');
      }

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                setResult(fullContent);
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('Smart schedule error:', error);
      setResult('生成排产建议失败，请稍后重试');
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const scheduleMetrics = [
    { label: '待排产订单', value: '12', icon: Package, color: 'bg-amber-500' },
    { label: '产能利用率', value: '85%', icon: Factory, color: 'bg-green-500' },
    { label: '预计完成率', value: '92%', icon: TrendingUp, color: 'bg-primary' },
    { label: '风险订单', value: '3', icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* 顶部导航栏 */}
      <header className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/')}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-base font-semibold">智能排产</h1>
                <p className="text-xs text-white/80">AI驱动排产优化</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        {/* 排产指标 */}
        <div className="p-4 border-b bg-white">
          <div className="grid grid-cols-4 gap-2">
            {scheduleMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className={`w-9 h-9 ${metric.color} rounded-xl mx-auto flex items-center justify-center mb-1`}>
                  <metric.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-lg font-bold">{metric.value}</div>
                <div className="text-[10px] text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 生成按钮 */}
        <div className="p-4 bg-white border-b">
          <Button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                正在生成排产建议...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                生成智能排产建议
              </>
            )}
          </Button>
        </div>

        {/* 结果区域 */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {result ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">排产建议</span>
                  {streaming && (
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                  )}
                </div>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {result}
                  {streaming && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-blue-500 animate-pulse" />
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mb-3 text-gray-300" />
              <p className="text-sm">点击上方按钮生成智能排产建议</p>
              <p className="text-xs mt-1">AI将基于订单优先级、产能瓶颈等数据生成优化方案</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
