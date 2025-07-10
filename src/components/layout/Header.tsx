'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Private Insurance</h1>
              <p className="text-xs text-muted-foreground">FHE-Powered Security</p>
            </div>
          </div>

          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
