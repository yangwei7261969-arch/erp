'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Clock,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Loader2,
  Zap,
  RefreshCw,
  Bell,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SmartAlertPage() {
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

  const handleAnalyze = async () => {
    setLoading(true);
    setStreaming(true);
    setResult('');
    
    try {
      const response = await fetch('/api/smart-alert', {
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
      console.error('Smart alert error:', error);
      setResult('生成预警分析失败，请稍后重试');
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  // 模拟预警数据
  const alerts = [
    { type: 'danger', title: '订单延迟', desc: 'PO-2024001 已延期2天', icon: Clock, color: 'bg-red-500' },
    { type: 'warning', title: '库存不足', desc: '面料A001 低于安全库存', icon: Package, color: 'bg-amber-500' },
    { type: 'warning', title: '外发逾期', desc: '外发订单 WO-0028 即将到期', icon: AlertTriangle, color: 'bg-amber-500' },
    { type: 'info', title: '质量异常', desc: '车间B 返工率偏高', icon: XCircle, color: 'bg-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* 顶部导航栏 */}
      <header className="bg-gradient-to-r from-red-500 to-rose-500 text-white sticky top-0 z-50">
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
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-base font-semibold">智能预警</h1>
                <p className="text-xs text-white/80">实时监控生产异常</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white border-0">
              {alerts.length} 项预警
            </Badge>
            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        {/* 预警列表 */}
        <div className="p-4 bg-white border-b">
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
              >
                <div className={`w-9 h-9 ${alert.color} rounded-xl flex items-center justify-center`}>
                  <alert.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{alert.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{alert.desc}</div>
                </div>
                <Badge 
                  variant={alert.type === 'danger' ? 'destructive' : 'secondary'}
                  className="text-[10px]"
                >
                  {alert.type === 'danger' ? '紧急' : alert.type === 'warning' ? '警告' : '提示'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* 分析按钮 */}
        <div className="p-4 bg-white border-b">
          <Button 
            onClick={handleAnalyze} 
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                正在分析预警数据...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                AI分析预警根因
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
                  <Sparkles className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-sm">预警分析</span>
                  {streaming && (
                    <Loader2 className="h-3 w-3 animate-spin text-red-500" />
                  )}
                </div>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {result}
                  {streaming && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-red-500 animate-pulse" />
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-3 text-gray-300" />
              <p className="text-sm">点击上方按钮进行AI预警分析</p>
              <p className="text-xs mt-1">AI将分析预警根因并提供解决方案</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
