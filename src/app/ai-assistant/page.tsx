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
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Send,
  Printer,
  FileDown,
  BarChart3,
  MessageSquare,
  Bot,
  User,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: string[];
}

const quickActions = [
  { icon: Printer, label: '打印订单', prompt: '帮我打印最近的订单' },
  { icon: FileDown, label: '导出报表', prompt: '导出本月的财务报表' },
  { icon: BarChart3, label: '生产预测', prompt: '预测下个月的生产计划' },
  { icon: Sparkles, label: '数据分析', prompt: '分析本月的经营数据' },
];

const suggestedQuestions = [
  '本月的订单完成情况如何？',
  '哪些物料需要补货？',
  '本月财务收支情况？',
  '最近有哪些逾期订单？',
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '您好！我是您的智能助手，可以帮助您处理生产管理、库存查询、财务报表等工作。请问有什么可以帮您的？',
      timestamp: new Date(),
      actions: ['打印订单', '导出报表', '生产预测'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (query: string): string => {
    if (query.includes('订单')) {
      return '📊 **订单概况**\n\n目前共有 **156** 个订单：\n- 进行中：12 个\n- 待开始：23 个\n- 已完成：121 个\n\n本月订单完成率为 **89.3%**，较上月提升 5.2%。需要我为您生成详细的订单报告吗？';
    }
    if (query.includes('物料') || query.includes('库存')) {
      return '📦 **库存预警**\n\n以下物料库存不足，建议及时补货：\n\n1. **蓝色棉布** - 当前: 50米, 安全库存: 100米\n2. **黑色涤纶布** - 当前: 80米, 安全库存: 100米\n3. **红色雪纺** - 当前: 30米, 安全库存: 50米\n\n是否需要我生成采购建议？';
    }
    if (query.includes('财务') || query.includes('收支')) {
      return '💰 **本月财务概览**\n\n- 总收入：**¥2,891,000**\n- 总支出：**¥1,598,800**\n- 净利润：**¥1,292,200**\n\n利润率较上月提升 3.5%，主要得益于生产效率提高和成本控制优化。';
    }
    return '我已经收到您的请求。正在为您查询相关数据，请稍候...';
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-500" />
          AI 智能助手
        </h1>
        <p className="text-muted-foreground">智能对话助手，帮助您快速处理业务</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Avatar>
                    <AvatarFallback className="bg-purple-500 text-white">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                </div>
                <div>
                  <CardTitle className="text-base">智能助手</CardTitle>
                  <CardDescription>在线 · 随时为您服务</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <Avatar className="flex-shrink-0">
                      <AvatarFallback
                        className={
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-purple-500 text-white'
                        }
                      >
                        {message.role === 'user' ? (
                          <User className="h-5 w-5" />
                        ) : (
                          <Bot className="h-5 w-5" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>
                      {message.role === 'assistant' && (
                        <div className="mt-3 flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <Copy className="h-3 w-3 mr-1" />
                            复制
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="flex-shrink-0">
                      <AvatarFallback className="bg-purple-500 text-white">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="输入您的问题或指令..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">快捷操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto flex-col gap-1 py-3"
                    onClick={() => handleQuickAction(action.prompt)}
                  >
                    <action.icon className="h-4 w-4" />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggested Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">推荐问题</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => handleQuickAction(question)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-xs">{question}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">使用统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">今日对话</span>
                  <span className="font-medium">23 次</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">本月对话</span>
                  <span className="font-medium">456 次</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Token 消耗</span>
                  <span className="font-medium">128K</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
