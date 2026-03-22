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
  BarChart3,
  Play,
  RefreshCw,
  Copy,
  Download,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Calendar,
} from 'lucide-react';

export default function SmartSchedulePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [result]);

  const generateSchedule = async () => {
    setLoading(true);
    setResult(null);

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
      console.error('Schedule error:', error);
      setResult('生成排产建议失败，请稍后重试。');
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
          <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">智能排产</h1>
            <p className="text-muted-foreground">AI驱动的生产排程优化</p>
          </div>
        </div>
      </div>

      {/* 功能说明 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">订单优先级分析</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">产能瓶颈识别</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">排产方案生成</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">风险预警提示</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>排产建议</CardTitle>
              <CardDescription>基于当前订单数据和产能情况生成智能排产方案</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {result && (
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-1" />
                  复制
                </Button>
              )}
              <Button 
                onClick={generateSchedule} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    生成排产方案
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
                <BarChart3 className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">点击生成排产方案</h3>
                <p className="text-muted-foreground max-w-md">
                  系统将分析当前待排产订单、产能资源和交付期限，生成最优排产建议
                </p>
              </div>
            )}
            
            {loading && !result && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <p className="text-muted-foreground">正在分析订单数据和产能情况...</p>
              </div>
            )}
            
            {result && (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap bg-muted/50 p-4 rounded-lg text-sm">
                  {result}
                  {loading && (
                    <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse" />
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
