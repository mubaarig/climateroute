import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ClimateRoute - Eco-Friendly Travel Planner',
  description: 'Find the most fuel-efficient routes using real-time traffic, weather, and elevation data. Reduce your carbon footprint with intelligent route planning.',
  keywords: 'eco-friendly, route planning, carbon footprint, green travel, climate change',
  authors: [{ name: 'Your Name' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#10b981',
  manifest: '/manifest.json',
  robots: 'index, follow',
  openGraph: {
    title: 'ClimateRoute - Eco-Friendly Travel Planner',
    description: 'Find the most fuel-efficient routes using real-time environmental data',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}