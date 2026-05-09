import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nutri-Companion',
  description: 'AI 기반 맞춤 영양 관리 앱',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
