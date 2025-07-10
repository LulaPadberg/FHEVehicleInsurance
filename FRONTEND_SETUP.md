# Frontend Setup Complete - Port 1361

## ✅ Setup Status


**Location**: `D:`
**Port**: 1361
**Status**: ✅ Running Successfully

## 🚀 Frontend is Live!

Your Next.js insurance platform is now running at:

**URL**: http://localhost:1361

## 📦 What Was Done

### 1. Files Moved from insurance-platform
- ✅ `src/` directory - All components, hooks, pages
- ✅ `next.config.js` - Next.js configuration
- ✅ `tailwind.config.ts` - Tailwind CSS theme
- ✅ `postcss.config.js` - PostCSS configuration
- ✅ `public/` directory created

### 2. Configuration Updated
- ✅ `package.json` - Added Next.js scripts with port 1361
- ✅ `tsconfig.json` - Configured for Next.js + Hardhat
- ✅ `.gitignore` - Added Next.js build files
- ✅ `.env` - Added frontend environment variables

### 3. Dependencies Installed
- ✅ Next.js 14.2.33
- ✅ React 18.3.0
- ✅ wagmi 2.12.0
- ✅ RainbowKit 2.1.0
- ✅ Radix UI components
- ✅ Tailwind CSS 3.4.0
- ✅ All supporting libraries

Total: 1,597 packages installed

## 📝 Available Scripts

```bash
# Start development server (Port 1361)
npm run dev

# Build for production
npm run build

# Start production server (Port 1361)
npm start

# Lint code
npm run lint

# Type check
npm run type-check

# Hardhat commands
npm run compile
npm run deploy:sepolia
```

## 🔧 Environment Variables

Added to `.env`:

```env
# Next.js Frontend Configuration
NEXT_PUBLIC_INSURANCE_CONTRACT=0x07e59aEcC74578c859a89a4CD7cD40E760625890
NEXT_PUBLIC_PAUSERSET_CONTRACT=0xF1a0db0b5c83a341Ac44EAc5cABFbB7cbf37603D
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID_HERE
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_APP_NAME=Private Insurance Platform
PORT=1361
```

### ⚠️ Important: WalletConnect Project ID

You need to add your WalletConnect Project ID:

1. Go to https://cloud.walletconnect.com
2. Create a new project
3. Copy your Project ID
4. Edit `.env` and replace `YOUR_PROJECT_ID_HERE` with your actual ID

## 📂 Project Structure

```
D:\
├── contracts/              # Solidity contracts
├── scripts/               # Deployment scripts
├── src/                   # Next.js frontend
│   ├── app/              # Pages (layout, home, policies, claims, history)
│   ├── components/       # UI components
│   │   ├── ui/          # Base UI (button, input, card, etc.)
│   │   ├── layout/      # Header, Footer, Navigation
│   │   ├── insurance/   # PolicyForm, ClaimForm, etc.
│   │   └── shared/      # LoadingSpinner, ErrorMessage, etc.
│   ├── hooks/           # Custom React hooks
│   ├── config/          # Contract ABIs & wagmi config
│   ├── providers/       # Web3Provider
│   ├── types/           # TypeScript types
│   └── lib/             # Utilities
├── public/              # Static assets
├── .env                 # Environment variables
├── package.json         # Dependencies & scripts
├── tsconfig.json        # TypeScript config
├── next.config.js       # Next.js config
├── tailwind.config.ts   # Tailwind theme
└── hardhat.config.ts    # Hardhat config
```

## 🎯 Features Available

### ✅ Wallet Connection
- RainbowKit integration
- Multiple wallet support (MetaMask, WalletConnect, etc.)
- Network switching to Sepolia

### ✅ Policy Management
- Create new policies
- View all user policies
- Display policy details
- Real-time status updates

### ✅ Claim Management
- Submit claims for policies
- Search claims by policy ID
- View claim details and status
- Severity level selection

### ✅ Transaction History
- Real-time blockchain transaction tracking
- View transaction details
- Direct links to Etherscan
- Transaction status indicators

### ✅ UX Features
- Loading states on all async operations
- Toast notifications for success/error
- Comprehensive error handling
- Form validation
- Responsive mobile design
- Status badges with color coding

## 🌐 How to Use

### 1. Access the Frontend
Open your browser and go to: http://localhost:1361

### 2. Connect Wallet
Click "Connect Wallet" button in the header

### 3. Switch to Sepolia
Make sure your wallet is connected to Sepolia testnet

### 4. Get Test ETH
Get Sepolia ETH from faucet: https://sepoliafaucet.com

### 5. Use Features

**Create Policy**:
- Fill in age, driving years, vehicle value, premium
- Click "Create Policy"
- Approve transaction in wallet

**Submit Claim**:
- Enter policy ID
- Fill damage amount, repair cost, severity
- Optional: Add IPFS document hash
- Click "Submit Claim"

**View Policies**:
- Navigate to "Policies" page
- See all your created policies

**View Claims**:
- Navigate to "Claims" page
- Search by policy ID

**Transaction History**:
- Navigate to "History" page
- View all your transactions with the contract

## 🔗 Smart Contracts (Sepolia)

**PrivateVehicleInsurance**
- Address: `0x07e59aEcC74578c859a89a4CD7cD40E760625890`
- Etherscan: https://sepolia.etherscan.io/address/0x07e59aEcC74578c859a89a4CD7cD40E760625890

**PauserSet**
- Address: `0xF1a0db0b5c83a341Ac44EAc5cABFbB7cbf37603D`
- Etherscan: https://sepolia.etherscan.io/address/0xF1a0db0b5c83a341Ac44EAc5cABFbB7cbf37603D

## 🐛 Troubleshooting

### Server Not Starting
```bash
# Kill any process on port 1361
# Windows:
netstat -ano | findstr :1361
taskkill /PID <pid> /F

# Restart
npm run dev
```

### Build Errors
```bash
# Clear cache
rm -rf .next
npm run dev
```

### Wallet Connection Issues
1. Ensure you have a WalletConnect Project ID in `.env`
2. Check that you're on Sepolia network
3. Clear browser cache
4. Try a different wallet

### Transaction Failures
1. Ensure you have Sepolia ETH
2. Check contract addresses in `.env`
3. Verify network is Sepolia (Chain ID: 11155111)

## 📊 Current Status

### Server Status
✅ Running on http://localhost:1361

### Components Status
- ✅ 16 UI Components
- ✅ 5 Insurance Components
- ✅ 3 Layout Components
- ✅ 3 Shared Components
- ✅ 5 Custom Hooks
- ✅ 4 Pages + Layout

### Configuration Status
- ✅ Next.js configured
- ✅ TypeScript configured
- ✅ Tailwind CSS configured
- ✅ wagmi + RainbowKit configured
- ✅ Contract ABIs configured
- ⚠️ WalletConnect Project ID needed

## 🚀 Next Steps

1. **Add WalletConnect Project ID** to `.env`
2. **Test the application** at http://localhost:1361
3. **Connect your wallet** and switch to Sepolia
4. **Create a test policy** to verify functionality
5. **Submit a test claim** to verify claim flow

## 📚 Additional Documentation

- `README.md` - Project overview
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `PROJECT_STRUCTURE.md` - Code architecture
- `IMPLEMENTATION_COMPLETE.md` - Implementation details

## 🎉 Success!

Your frontend is now running and ready to use!

- **Frontend**: http://localhost:1361
- **Network**: Sepolia Testnet
- **Port**: 1361 ✅

---

**Built with**: Next.js + TypeScript + wagmi + RainbowKit + Tailwind CSS

**Location**: D:\

**Status**: ✅ Live and Running
