// Shortens 0x4f3b...9a2c style
export function shortenAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Copy text to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Format ETH balance to 4 decimals
export function formatBalance(balance) {
  if (!balance) return "0.0000";
  return parseFloat(balance).toFixed(4);
}

// Base Sepolia chain ID in hex (for MetaMask)
export const BASE_SEPOLIA_CHAIN_ID     = "0x14A34";   // 84532
export const BASE_SEPOLIA_CHAIN_ID_DEC = 84532;