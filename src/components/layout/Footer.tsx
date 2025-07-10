'use client';

import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3">About</h3>
            <p className="text-sm text-muted-foreground">
              Secure vehicle insurance platform powered by Fully Homomorphic Encryption
              technology on Sepolia testnet.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://sepolia.etherscan.io/address/0x07e59aEcC74578c859a89a4CD7cD40E760625890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                >
                  Contract on Etherscan
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://docs.zama.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                >
                  Zama FHE Docs
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Network</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Network: Sepolia Testnet</li>
              <li>Chain ID: 11155111</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>Built with Next.js, TypeScript, wagmi, and RainbowKit</p>
        </div>
      </div>
    </footer>
  );
}
