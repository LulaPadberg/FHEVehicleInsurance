import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Private Vehicle Insurance Platform',
  description: 'Secure private vehicle insurance platform powered by Zama FHE technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
