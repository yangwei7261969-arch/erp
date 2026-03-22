'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import PageAnnouncement from '@/components/notification/page-announcement';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/toast';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <div className="flex h-screen overflow-hidden">
          {/* 移动端遮罩 */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* 侧边栏 */}
          <div
            className={cn(
              'transition-transform duration-300 ease-in-out',
              isMobile && !mobileMenuOpen && '-translate-x-full fixed z-50',
              isMobile && mobileMenuOpen && 'translate-x-0 fixed z-50'
            )}
          >
            <Sidebar onMobileClose={() => setMobileMenuOpen(false)} />
          </div>

          {/* 主内容区 */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header
              onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              isMobile={isMobile}
            />
            {/* 全局公告横幅 */}
            <PageAnnouncement />
            <main className={cn('flex-1 overflow-auto bg-muted/30', className)}>
              {children}
            </main>
          </div>
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}
