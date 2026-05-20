import { useMemo } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/useWallet";

const DONATION_ABI = [
  "function donateToNGO(string ngoName, uint256 amount) external",
  "function getTotalDonations() external view returns (uint256)",
  "function getDonorCount() external view returns (uint256)",
  "function getNGODonations(string ngoName) external view returns (uint256)",
  "function getAllDonations() external view returns ((address donor,string ngoName,uint256 amount,uint256 timestamp)[])",
  "function getAllDonors() external view returns (address[])",
  "function donorTotals(address) external view returns (uint256)",
  "event DonationMade(address indexed donor, string indexed ngoName, uint256 amount, uint256 timestamp, uint256 donationId)",
];

const DONOR_BADGE_ABI = [
  "function mintBadge(address donor, string ngoName, uint256 amount) external returns (uint256)",
  "function getBadgesByDonor(address donor) external view returns (uint256[])",
  "function tokenURI(uint256 tokenId) external view returns (string)",
];

export function useContracts() {
  const { provider, signer, isCorrectNetwork } = useWallet();
  const publicRpcUrl = import.meta.env.VITE_BASE_SEPOLIA_RPC ?? null;

  const donationAddress =
    import.meta.env.VITE_DONATION_CONTRACT_ADDRESS ??
    import.meta.env.VITE_DONATION_CONTRACT;
  const badgeAddress =
    import.meta.env.VITE_DONOR_BADGE_CONTRACT_ADDRESS ??
    import.meta.env.VITE_BADGE_CONTRACT;

  const readProvider = useMemo(() => {
    if (provider && isCorrectNetwork) {
      return provider;
    }
    if (!publicRpcUrl) {
      return null;
    }

    return new ethers.JsonRpcProvider(publicRpcUrl);
  }, [provider, isCorrectNetwork, publicRpcUrl]);

  const donationReader = useMemo(() => {
    if (!readProvider || !donationAddress) {
      return null;
    }

    return new ethers.Contract(donationAddress, DONATION_ABI, readProvider);
  }, [readProvider, donationAddress]);

  const donationWriter = useMemo(() => {
    if (!signer || !donationAddress || !isCorrectNetwork) {
      return null;
    }

    return new ethers.Contract(donationAddress, DONATION_ABI, signer);
  }, [signer, donationAddress, isCorrectNetwork]);

  const badgeReader = useMemo(() => {
    if (!readProvider || !badgeAddress) {
      return null;
    }

    return new ethers.Contract(badgeAddress, DONOR_BADGE_ABI, readProvider);
  }, [readProvider, badgeAddress]);

  const badgeWriter = useMemo(() => {
    if (!signer || !badgeAddress || !isCorrectNetwork) {
      return null;
    }

    return new ethers.Contract(badgeAddress, DONOR_BADGE_ABI, signer);
  }, [signer, badgeAddress, isCorrectNetwork]);

  return {
    donationAddress: donationAddress ?? null,
    badgeAddress: badgeAddress ?? null,
    readProvider,
    donationReader,
    donationWriter,
    badgeReader,
    badgeWriter,
    contractsReady: Boolean(donationAddress && readProvider),
  };
}
