<div align="center">
  <img src="public/favicon.svg" alt="ChainCare Logo" width="120" />
  
  # ChainCare 🌍
  
  **AI-Powered Philanthropy, Gasless Transactions, and On-Chain Gamification.**
  
  [![Base Sepolia](https://img.shields.io/badge/Network-Base_Sepolia-blue?style=flat-square&logo=base)](https://sepolia.basescan.org/)
  [![Vite](https://img.shields.io/badge/Vite-React-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
  [![Groq AI](https://img.shields.io/badge/AI-Groq_Llama_3-f59e0b?style=flat-square)](https://groq.com/)
  
  ---
</div>

## 🌟 The Vision

Donating to causes you care about shouldn't be difficult, opaque, or unrewarding. **ChainCare** revolutionizes Web3 philanthropy by removing friction and adding a sense of permanent digital ownership to your generosity. 

By combining the advisory intelligence of Large Language Models, the frictionless onboarding of EVM Paymasters, and the gamification of purely on-chain NFTs, ChainCare makes donating a seamless, joyful experience.

## ✨ Key Features

### 🤖 AI Philanthropy Advisor
Not sure where your money will make the most impact? Our Groq-powered AI (Llama-3) talks to you, understands your core values, and recommends the perfect cause. When you are ready, the AI directly triggers a frictionless donation payload directly to your wallet.

### ⚡ Gasless Transactions (Paymasters)
Say goodbye to the "insufficient gas" nightmare. ChainCare integrates the **Universal Gas Fund (UGF)** via Ethers.js. All transaction gas fees on Base Sepolia are fully sponsored by our Paymaster. You only pay what you donate.

### 🏆 3D On-Chain NFT Badges
Your generosity deserves permanent recognition. Every successful donation automatically triggers the `DonorBadge.sol` smart contract to mint a stunning, tiered (Gold, Silver, Bronze) NFT straight to your wallet. 
*No IPFS required!* The 3D CSS physics and metadata are generated entirely on-chain via custom Base64 encoding.

### 🌐 Real-Time Transparency
The Dashboard and History pages index blockchain events directly from Base Sepolia in real-time, providing total transparency on exactly where funds are going, complete with TxHashes and dynamic Leaderboards.

---

## 🏗️ Architecture

- **Frontend:** React + Vite, styled with custom Glassmorphism and CSS physics to provide a premium, non-robotic user experience.
- **AI Integration:** Llama-3-8b via the Groq API, leveraging deep regex payload parsing.
- **Blockchain:** Base Sepolia Testnet.
- **Smart Contracts:** Solidty (`Donation.sol` & `DonorBadge.sol`) with strict authorization wiring.

---

## 🛠️ Quick Start

Want to run ChainCare locally? 

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Smitakalluri15/chaincare.git
   cd chaincare
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_GROQ_API_KEY="your_groq_key"
   VITE_DONATION_CONTRACT=
   VITE_BADGE_CONTRACT=
   VITE_DONATION_START_BLOCK=
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 🤝 Smart Contracts (Base Sepolia)

- **Donation Manager:** [`0xcD78Daa7f9d7F3DfEFC53df89FED946d0712DA5a`](https://sepolia.basescan.org/address/0xcD78Daa7f9d7F3DfEFC53df89FED946d0712DA5a)
- **NFT Donor Badge:** [`0xe2f1D9755aBB7421D8E2257C4C3061d713d95642`](https://sepolia.basescan.org/address/0xe2f1D9755aBB7421D8E2257C4C3061d713d95642)

<div align="center">
  <br />
  <i>Built with ❤️ for a better, more transparent world.</i>
</div>
