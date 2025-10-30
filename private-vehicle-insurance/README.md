# Private Vehicle Insurance Platform

A secure, confidential vehicle insurance platform powered by Zama FHE technology and the Universal FHEVM SDK.

## Features

- **🔒 Privacy-First**: All sensitive data (age, vehicle value, damage amounts) encrypted using FHE
- **📋 Policy Management**: Create and manage insurance policies with encrypted personal information
- **📑 Claim Processing**: Submit and track claims with complete confidentiality
- **👥 Reviewer Interface**: Authorized reviewers can process claims while maintaining data privacy
- **⚡ Real-time Updates**: Live status dashboard showing policies and claims
- **🔗 Web3 Integration**: Connect with MetaMask for blockchain transactions

## Technology Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Ethereum (Sepolia Testnet)
- **FHE SDK**: @fhevm/universal-sdk
- **Smart Contract**: PrivateVehicleInsurance.sol

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- Sepolia testnet ETH (for gas fees)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Usage

### 1. Connect Wallet

Click "Connect Wallet" to connect your MetaMask wallet. The app will automatically switch to Sepolia testnet if needed.

### 2. Create a Policy

Fill in your information:
- Age (18-100)
- Years of driving experience
- Vehicle value (USD)
- Annual premium (USD)

All data is encrypted client-side before sending to the blockchain.

### 3. Submit a Claim

Once you have a policy:
- Enter your Policy ID
- Provide damage amount and repair cost
- Select accident severity
- Add document hash (IPFS)
- Optionally mark as confidential

### 4. Review Claims (For Authorized Reviewers)

If you're an authorized reviewer:
- Enter the Claim ID
- Provide assessed damage and recommended payout
- Add review notes
- Update claim status

## Smart Contract

**Contract Address**: `0x2A86c562acc0a861A96E4114d7323987e313795F` (Sepolia)

**Network**: Sepolia Testnet (Chain ID: 11155111)

## Security Features

- Client-side encryption using FHE
- EIP-712 signature verification
- Encrypted storage of sensitive data
- Privacy-preserving computations
- Access control for reviewers

## Environment

The application connects to:
- **Network**: Sepolia Testnet
- **RPC**: Infura Sepolia endpoint
- **Contract**: 0x2A86c562acc0a861A96E4114d7323987e313795F

## Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## Project Structure

```
private-vehicle-insurance/
├── app/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main application page
│   └── globals.css       # Global styles
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Learn More

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Zama FHEVM](https://docs.zama.ai/fhevm)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
