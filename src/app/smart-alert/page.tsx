'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Play,
  RefreshCw,
  Copy,
  Loader2,
  CheckCircle,
  Clock,
  Package,
  DollarSign,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';

const alertTypes = [
  { id: 'delay', label: '延迟订单', icon: Clock, color: 'text-red-500' },
  { id: 'inventory', label: '库存不足', icon: Package, color: 'text-orange-500' },
  { id: 'finance', label: '财务风险', icon: DollarSign, color: 'text-yellow-500' },
  { id: 'quality', label: '质量问题', icon: AlertCircle, color: 'text-purple-500' },
];

export default function SmartAlertPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [result]);

  const generateAlertAnalysis = async () => {
    setLoading(true);
    setResult(null);

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
      console.error('Alert analysis error:', error);
      setResult('生成预警分析失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">智能预警</h1>
            <p className="text-muted-foreground">AI驱动的生产异常检测与预警分析</p>
          </div>
        </div>
      </div>

      {/* 预警类型 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {alertTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card key={type.id}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${type.color}`} />
                  <span className="text-sm font-medium">{type.label}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 功能说明 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">延迟订单检测</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">库存不足预警</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">财务风险预警</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">根因分析建议</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>预警分析报告</CardTitle>
              <CardDescription>实时监控生产异常，提供智能预警和解决方案</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {result && (
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-1" />
                  复制
                </Button>
              )}
              <Button 
                onClick={generateAlertAnalysis} 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    开始预警分析
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4" ref={scrollRef}>
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <AlertTriangle className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">点击开始预警分析</h3>
                <p className="text-muted-foreground max-w-md">
                  系统将扫描所有业务数据，识别延迟订单、库存不足、财务风险等异常情况
                </p>
              </div>
            )}
            
            {loading && !result && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <Loader2 className="h-12 w-12 text-red-500 animate-spin mb-4" />
                <p className="text-muted-foreground">正在扫描业务数据，检测异常情况...</p>
              </div>
            )}
            
            {result && (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap bg-muted/50 p-4 rounded-lg text-sm">
                  {result}
                  {loading && (
                    <span className="inline-block w-2 h-4 ml-1 bg-red-500 animate-pulse" />
                  )}
                </pre>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
