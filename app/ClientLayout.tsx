'use client';
import { ConfigProvider } from 'antd';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConfigProvider>{children}</ConfigProvider>;
}
