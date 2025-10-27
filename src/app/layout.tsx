'use client';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useServiceWorker();

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}