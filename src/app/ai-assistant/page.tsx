'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  AlertTriangle,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const quickActions = [
  { icon: BarChart3, label: '生产分析', prompt: '分析当前生产订单的完成情况和效率' },
  { icon: Package, label: '库存预警', prompt: '检查是否有物料库存不足需要补货' },
  { icon: DollarSign, label: '财务概览', prompt: '分析本月的财务收支情况' },
  { icon: AlertTriangle, label: '异常检测', prompt: '检查是否有延迟订单或其他异常情况' },
];

const suggestedQuestions = [
  '当前生产进度如何？有哪些需要关注的问题？',
  '分析订单完成效率，给出改进建议',
  '本月的经营状况如何？',
  '有哪些订单即将到期需要加快进度？',
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '您好！我是您的智能生产管理助手。\n\n我可以帮您：\n• 📊 分析生产订单状态和进度\n• 📦 检查库存预警和补货建议\n• 💰 分析财务收支情况\n• ⚠️ 检测异常订单和风险\n• 📈 提供生产优化建议\n\n请问有什么可以帮您的？',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

    // 创建AI回复占位
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      // 准备消息历史
      const chatMessages = messages
        .filter(m => m.role !== 'assistant' || m.content) // 过滤空消息
        .map(m => ({ role: m.role, content: m.content }));
      chatMessages.push({ role: 'user', content: input });

      // 创建 AbortController
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages, stream: true }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

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
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMessageId
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
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

      // 完成流式输出
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // 用户取消
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId ? { ...m, isStreaming: false } : m
          )
        );
      } else {
        console.error('AI chat error:', error);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId
              ? {
                  ...m,
                  content: '抱歉，处理您的请求时出现错误。请稍后重试。',
                  isStreaming: false,
                }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: '对话已清空。请问有什么可以帮您的？',
        timestamp: new Date(),
      },
    ]);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-500" />
          AI 智能助手
        </h1>
        <p className="text-muted-foreground">基于真实业务数据的智能分析助手</p>
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
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleClearChat}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  清空对话
                </Button>
              </div>
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
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 ml-1 bg-purple-500 animate-pulse" />
                        )}
                      </div>
                      {message.role === 'assistant' && !message.isStreaming && message.content && (
                        <div className="mt-3 flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2"
                            onClick={() => handleCopy(message.content)}
                          >
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
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
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
                placeholder="输入您的问题，例如：分析当前生产进度..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                className="flex-1"
                disabled={isLoading}
              />
              {isLoading ? (
                <Button variant="destructive" onClick={handleStop}>
                  停止
                </Button>
              ) : (
                <Button onClick={handleSend} disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">快捷分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto flex-col gap-1 py-3"
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={isLoading}
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
                    disabled={isLoading}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-xs line-clamp-2">{question}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">AI 能力</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>实时业务数据查询</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>智能生产分析</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>库存预警检测</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>财务数据分析</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>异常订单检测</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>优化建议生成</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
