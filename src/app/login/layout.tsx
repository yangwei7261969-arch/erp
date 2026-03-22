import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '登录',
  description: '服装生产管理系统登录',
};

// 登录页使用独立布局，不显示侧边栏
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
