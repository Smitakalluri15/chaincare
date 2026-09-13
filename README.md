# ChainCare — AI-Powered Humanitarian Giving Platform

> Merged Project · Built for the UGF Hackathon · Base Sepolia · Powered by Claude AI + UGF

---

## 🌿 What's Included (Merged)

This is the **fully merged** version combining:
- **chaincare_2** — Smart contracts, deployment scripts, `.env` config, production `dist/`
- **chaincare-ai-upgraded** — Full UI redesign + AI Philanthropy Advisor feature

---

## ✨ Features

### ✦ AI Philanthropy Advisor (`/advisor`)
Powered by **Claude (claude-sonnet-4-20250514)**:
- Conversational NGO recommendation engine
- Real-world impact prediction before you donate
- One-click gasless donation via UGF
- Autonomous donation plan builder
- NFT badge minting on-chain after confirmation

### 🎨 Warm Humanitarian UI
- **Theme**: Premium ivory, teal, gold, emerald, royal blue
- **Fonts**: Playfair Display + DM Sans + DM Mono
- Animated orbs, glass cards, smooth fade-up animations

### ⛓️ On-Chain Infrastructure
- `contracts/Donation.sol` — Donation contract with events
- `contracts/DonorBadge.sol` — NFT badge minting
- `scripts/verify-and-wire-contracts.mjs` — Deployment helper
- Fully gasless via UGF on Base Sepolia

### 📄 Pages
| Route | Description |
|---|---|
| `/` | Landing page with hero, stats, features |
| `/advisor` | ✦ AI Philanthropy Advisor (new) |
| `/dashboard` | NGO cards + donation UI |
| `/history` | On-chain donation history |
| `/leaderboard` | Top donors ranking |
| `/badges` | My NFT donor badges |

---

## 🚀 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env` and fill in your contract addresses:
```env
VITE_BASE_SEPOLIA_CHAIN_ID=84532
VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org
VITE_DONATION_CONTRACT=0xcD78Daa7f9d7F3DfEFC53df89FED946d0712DA5a
VITE_BADGE_CONTRACT=0xe2f1D9755aBB7421D8E2257C4C3061d713d95642
VITE_TYI_TOKEN_ADDRESS=
VITE_DONATION_START_BLOCK=
# Optional: Anthropic Claude API Key (built-in intelligent advisor active by default)
VITE_ANTHROPIC_API_KEY=
```

### 3. Run dev server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```

---

## 📋 Project Structure

```
chaincare/
├── contracts/
│   ├── Donation.sol
│   └── DonorBadge.sol
├── scripts/
│   └── verify-and-wire-contracts.mjs
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── NGOCard.jsx
│   │   ├── StatsBar.jsx
│   │   ├── StepProgress.jsx
│   │   └── WalletButton.jsx
│   ├── context/
│   │   └── WalletContext.jsx
│   ├── hooks/
│   │   ├── useContracts.js
│   │   ├── useDonate.js
│   │   └── useDonationStats.js
│   ├── pages/
│   │   ├── AIAdvisor.jsx   ← NEW
│   │   ├── Badges.jsx
│   │   ├── Dashboard.jsx
│   │   ├── History.jsx
│   │   ├── Landing.jsx
│   │   └── Leaderboard.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── public/
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

Built with ❤️ for the UGF Hackathon · [UGF](https://universalgasframework.com) · [Claude AI](https://anthropic.com)
