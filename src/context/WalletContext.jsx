import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { WalletContext } from "./wallet-context";
import {
  shortenAddress,
  BASE_SEPOLIA_CHAIN_ID,
  BASE_SEPOLIA_CHAIN_ID_DEC,
} from "../utils/helpers";

const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

// 2. Provider component — wraps the whole app
export function WalletProvider({ children }) {
  const [account, setAccount]           = useState(null);   // connected address
  const [provider, setProvider]         = useState(null);   // ethers provider
  const [signer, setSigner]             = useState(null);   // ethers signer
  const [balance, setBalance]           = useState("0");    // ETH balance
  const [tokenBalance, setTokenBalance] = useState(null);   // TYI balance
  const [chainId, setChainId]           = useState(null);   // current network
  const [isConnecting, setIsConnecting] = useState(false);  // loading state
  const tokenAddress = import.meta.env.VITE_TYI_TOKEN_ADDRESS ?? null;

  // Is the user on Base Sepolia?
  const isCorrectNetwork = Number(chainId) === BASE_SEPOLIA_CHAIN_ID_DEC;

  // ─── Connect wallet ──────────────────────────────────────────────────────
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not found. Please install it.");
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer   = await web3Provider.getSigner();
      const network      = await web3Provider.getNetwork();
      const ethBalance   = await web3Provider.getBalance(accounts[0]);

      setAccount(accounts[0]);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setChainId(Number(network.chainId));
      setBalance(ethers.formatEther(ethBalance));

      toast.success(`Connected: ${shortenAddress(accounts[0])}`);
    } catch (err) {
      toast.error("Connection rejected.");
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // ─── Disconnect wallet ───────────────────────────────────────────────────
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setBalance("0");
    setTokenBalance(null);
    setChainId(null);
    toast("Wallet disconnected", { icon: "👋" });
  }, []);

  // ─── Switch to Base Sepolia ───────────────────────────────────────────────
  const switchToBaseSepolia = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      // Chain not added yet — add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: BASE_SEPOLIA_CHAIN_ID,
                chainName: "Base Sepolia Testnet",
                nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://sepolia.base.org"],
                blockExplorerUrls: ["https://sepolia.basescan.org"],
              },
            ],
          });
        } catch {
          toast.error("Failed to add Base Sepolia network.");
        }
      }
    }
  }, []);

  // ─── Listen for account/network changes ──────────────────────────────────
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        toast(`Switched to ${shortenAddress(accounts[0])}`);
      }
    };

    const handleChainChanged = (chainIdHex) => {
      setChainId(parseInt(chainIdHex, 16));
      // Reload to reset provider state cleanly
      window.location.reload();
    };

    try {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    } catch {
      // Extension not fully initialized — skip listeners
    }

    return () => {
      try {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      } catch { /* ignore */ }
    };
  }, [disconnectWallet]);

  // ─── Auto-reconnect if already authorized ─────────────────────────────────
  // Delay slightly so browser extension content scripts are ready (avoids
  // "Receiving end does not exist" errors from MetaMask on first load)
  useEffect(() => {
    let cancelled = false;
    const autoConnect = async () => {
      // Wait for extension to initialize
      await new Promise((r) => setTimeout(r, 150));
      if (cancelled) return;
      try {
        if (!window.ethereum) return;
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (!cancelled && accounts.length > 0) {
          connectWallet();
        }
      } catch {
        // Extension not ready or user hasn't connected — silently ignore
      }
    };
    autoConnect();
    return () => { cancelled = true; };
  }, [connectWallet]);

  useEffect(() => {
    const loadTokenBalance = async () => {
      if (!provider || !account || !tokenAddress) {
        setTokenBalance(null);
        return;
      }

      try {
        const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const [rawBalance, decimals] = await Promise.all([
          token.balanceOf(account),
          token.decimals(),
        ]);
        setTokenBalance(ethers.formatUnits(rawBalance, decimals));
      } catch (error) {
        console.error("Failed to load TYI balance:", error);
        setTokenBalance(null);
      }
    };

    loadTokenBalance();
  }, [provider, account, tokenAddress, chainId]);

  const value = {
    account,
    provider,
    signer,
    balance,
    tokenBalance,
    chainId,
    isConnecting,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchToBaseSepolia,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}
