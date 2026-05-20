import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useContracts } from "./useContracts";
import { NGO_LIST } from "../constants/ngos";

const EMPTY_STATS = {
  total: 0,
  donorCount: 0,
  ngoStats: NGO_LIST.map((ngo) => ({
    ...ngo,
    raised: 0,
    donors: 0,
  })),
};

export function useDonationStats() {
  const { donationReader } = useContracts();
  const [stats, setStats]     = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!donationReader) {
      setStats(EMPTY_STATS);
      setLoading(false);
      return EMPTY_STATS;
    }

    setLoading(true);

    try {
      const [total, donorCount, allDonations, ...ngoDonations] = await Promise.all([
        donationReader.getTotalDonations(),
        donationReader.getDonorCount(),
        donationReader.getAllDonations(),
        ...NGO_LIST.map((n) => donationReader.getNGODonations(n.name)),
      ]);

      const donorSetsByNgo = new Map(
        NGO_LIST.map((ngo) => [ngo.name, new Set()]),
      );

      allDonations.forEach((donation) => {
        donorSetsByNgo.get(donation.ngoName)?.add(donation.donor.toLowerCase());
      });

      const ngoStats = NGO_LIST.map((ngo, i) => ({
        ...ngo,
        raised: parseFloat(ethers.formatEther(ngoDonations[i])),
        donors: donorSetsByNgo.get(ngo.name)?.size ?? 0,
      }));

      const nextStats = {
        total:      parseFloat(ethers.formatEther(total)),
        donorCount: Number(donorCount),
        ngoStats,
      };

      setStats(nextStats);
      return nextStats;
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStats(EMPTY_STATS);
      return EMPTY_STATS;
    } finally {
      setLoading(false);
    }
  }, [donationReader]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchStats();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
