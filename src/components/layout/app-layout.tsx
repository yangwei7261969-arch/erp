'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, ChevronRight, ChevronLeft } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);

  // 检测是否移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 触摸开始
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsSwiping(true);
  }, []);

  // 触摸移动
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart || !isMobile) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // 只处理水平滑动（水平滑动距离 > 垂直滑动距离）
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 阻止默认滚动行为
      e.preventDefault();

      // 限制偏移范围
      const maxOffset = 256; // 侧边栏宽度
      if (mobileMenuOpen) {
        // 已打开状态，向左滑动
        setSwipeOffset(Math.min(0, deltaX));
      } else {
        // 已关闭状态，从左边缘向右滑动
        if (touchStart.x < 30) {
          setSwipeOffset(Math.max(-maxOffset, -maxOffset + deltaX));
        }
      }
    }
  }, [touchStart, isMobile, mobileMenuOpen]);

  // 触摸结束
  const handleTouchEnd = useCallback(() => {
    if (!isMobile) return;

    const threshold = 80; // 滑动阈值

    if (mobileMenuOpen) {
      // 已打开状态，判断是否关闭
      if (swipeOffset < -threshold) {
        setMobileMenuOpen(false);
      }
    } else {
      // 已关闭状态，判断是否打开
      if (swipeOffset > -256 + threshold) {
        setMobileMenuOpen(true);
      }
    }

    setSwipeOffset(0);
    setTouchStart(null);
    setIsSwiping(false);
  }, [isMobile, mobileMenuOpen, swipeOffset]);

  // 计算侧边栏位置
  const sidebarTransform = mobileMenuOpen
    ? `translateX(${swipeOffset}px)`
    : `translateX(calc(-100% + ${swipeOffset + 256}px))`;

  return (
    <div
      ref={layoutRef}
      className="flex h-screen overflow-hidden touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 移动端遮罩 */}
      {mobileMenuOpen && (
        <div
          className={cn(
            'fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300',
            isSwiping ? 'opacity-100' : 'opacity-100'
          )}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <div
        className={cn(
          'fixed z-50 md:relative md:translate-x-0 transition-transform duration-300',
          isSwiping && 'transition-none'
        )}
        style={{
          transform: isMobile ? sidebarTransform : undefined,
        }}
      >
        <Sidebar 
          onMobileClose={() => setMobileMenuOpen(false)}
          isMobile={isMobile}
        />
      </div>

      {/* 主内容区 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
        />
        <main className={cn('flex-1 overflow-auto bg-muted/30', className)}>
          {children}
        </main>
      </div>

      {/* 移动端侧边栏展开按钮（固定在左侧边缘） */}
      {isMobile && !mobileMenuOpen && (
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-primary text-primary-foreground rounded-r-lg p-2 shadow-lg active:scale-95 transition-transform"
          aria-label="展开菜单"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
