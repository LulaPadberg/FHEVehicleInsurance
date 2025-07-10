import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/providers/Web3Provider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Private Insurance Platform',
  description: 'Secure Vehicle Insurance with FHE Technology on Sepolia',
  keywords: ['insurance', 'blockchain', 'FHE', 'privacy', 'vehicle insurance'],
  authors: [{ name: 'Private Insurance Platform' }],
  openGraph: {
    title: 'Private Insurance Platform',
    description: 'Secure Vehicle Insurance with FHE Technology',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          {children}
          <Toaster />
        </Web3Provider>
      </body>
    </html>
  );
}
