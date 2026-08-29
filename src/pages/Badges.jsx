import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useContracts } from "../hooks/useContracts";
import { useWallet } from "../context/useWallet";

export default function Badges() {
  const { account } = useWallet();
  const { badgeReader, badgeWriter, donationReader } = useContracts();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mintingMissing, setMintingMissing] = useState(false);
  const [missingBadgeCount, setMissingBadgeCount] = useState(0);
  const [canMintMissing, setCanMintMissing] = useState(false);
  const [helperText, setHelperText] = useState("");

  const loadBadges = useCallback(async () => {
    if (!account) {
      setBadges([]);
      setError("");
      setHelperText("");
      setMissingBadgeCount(0);
      setCanMintMissing(false);
      setLoading(false);
      return;
    }

    if (!badgeReader) {
      setBadges([]);
      setError("Badge contract is not configured.");
      setHelperText("");
      setMissingBadgeCount(0);
      setCanMintMissing(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setHelperText("");

      const [tokenIds, donations, badgeOwner] = await Promise.all([
        badgeReader.getBadgesByDonor(account),
        donationReader?.getDonationsByUser(account) ?? Promise.resolve([]),
        badgeReader.owner().catch(() => null),
      ]);

      const rows = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const tokenUri = await badgeReader.tokenURI(tokenId);
          const metadata = parseTokenMetadata(tokenUri);
          const ngo = metadata.attributes?.find(
            (attr) => attr.trait_type === "NGO",
          )?.value;
          const tier = metadata.attributes?.find(
            (attr) => attr.trait_type === "Tier",
          )?.value;

          return {
            tokenId: Number(tokenId),
            name: metadata.name ?? `ChainCare Donor Badge #${tokenId}`,
            description:
              metadata.description ??
              "A donor badge earned through a ChainCare donation.",
            ngo: ngo ?? "ChainCare NGO",
            tier: tier ?? "Bronze",
          };
        }),
      );

      const missingCount = Math.max(0, donations.length - tokenIds.length);
      const ownsMintRole =
        Boolean(badgeOwner) &&
        badgeOwner.toLowerCase() === account.toLowerCase();

      setBadges(rows.reverse());
      setMissingBadgeCount(missingCount);
      setCanMintMissing(Boolean(missingCount > 0 && ownsMintRole && badgeWriter));

      if (missingCount > 0) {
        if (ownsMintRole && badgeWriter) {
          setHelperText(
            `${missingCount} donation badge${missingCount > 1 ? "s are" : " is"} missing from the live contract. You can mint ${missingCount > 1 ? "them" : "it"} here.`,
          );
        } else {
          setHelperText(
            "This deployed badge contract has not auto-minted your past donations yet.",
          );
        }
      }
    } catch (error) {
      console.error("Failed to load badges:", error);
      setBadges([]);
      setError("Unable to load badges for this wallet right now.");
      setMissingBadgeCount(0);
      setCanMintMissing(false);
      setHelperText("");
    } finally {
      setLoading(false);
    }
  }, [account, badgeReader, badgeWriter, donationReader]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadBadges();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadBadges]);

  const handleMintMissing = async () => {
    if (!account || !badgeWriter || !donationReader) {
      toast.error("Badge minting is not ready.");
      return;
    }

    try {
      setMintingMissing(true);
      const [donations, existingTokenIds] = await Promise.all([
        donationReader.getDonationsByUser(account),
        badgeWriter.getBadgesByDonor(account),
      ]);

      const pendingDonations = donations.slice(existingTokenIds.length);
      if (!pendingDonations.length) {
        toast.success("No missing badges left to mint.");
        await loadBadges();
        return;
      }

      for (const donation of pendingDonations) {
        const mintTx = await badgeWriter.mintBadge(
          account,
          donation.ngoName,
          donation.amount,
        );
        await mintTx.wait();
      }

      toast.success("Missing badges minted successfully.");
      await loadBadges();
    } catch (mintError) {
      console.error("Failed to mint missing badges:", mintError);
      toast.error("Badge mint failed. Check wallet confirmation and try again.");
    } finally {
      setMintingMissing(false);
    }
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h1 className="font-syne text-3xl font-bold text-slate-100 mb-1">
          My Badges
        </h1>
        <div className="md:text-right">
          <p className="text-slate-400 text-sm">
            NFT donor badges minted from your ChainCare donations.
          </p>
          {canMintMissing && (
            <button
              type="button"
              onClick={handleMintMissing}
              disabled={mintingMissing}
              className="mt-3 rounded-xl bg-gradient-to-r from-accent2 to-indigo-500 px-4 py-2 text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
            >
              {mintingMissing
                ? "Minting missing badges..."
                : `Mint ${missingBadgeCount} Missing Badge${missingBadgeCount > 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      </div>

      {!loading && !error && helperText && (
        <div className="mb-5 glass rounded-2xl p-4 text-sm text-slate-300">
          {helperText}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {!account && !loading && (
          <div className="glass rounded-2xl p-5 text-sm text-slate-400 md:col-span-2 lg:col-span-3">
            Connect your wallet to view your ChainCare donor badges.
          </div>
        )}

        {loading && (
          <div className="glass rounded-2xl p-5 text-sm text-slate-400">
            Loading badges...
          </div>
        )}

        {!loading && error && (
          <div className="glass rounded-2xl p-5 text-sm text-rose-300 md:col-span-2 lg:col-span-3">
            {error}
          </div>
        )}

        {!loading && !error && account && badges.length === 0 && (
          <div className="glass rounded-2xl p-5 text-sm text-slate-400">
            No badges minted yet. Make a donation to earn your first donor badge.
          </div>
        )}

        {!loading &&
          !error &&
          badges.map((badge) => (
            <div key={badge.tokenId} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="font-syne text-xl font-bold text-slate-100">
                    {badge.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Token #{badge.tokenId}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium border border-accent/20 text-accent bg-accent/10">
                  {badge.tier}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface/70 p-6 mb-4 text-center">
                <div className="font-syne text-4xl text-accent mb-2">
                  {tierEmoji(badge.tier)}
                </div>
                <div className="text-slate-200 font-medium">{badge.ngo}</div>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed">
                {badge.description}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

function parseTokenMetadata(uri) {
  if (!uri) {
    return {};
  }

  if (uri.startsWith("data:application/json;base64,")) {
    const [, base64] = uri.split("base64,");
    return JSON.parse(window.atob(base64));
  }

  if (uri.startsWith("data:application/json,")) {
    const [, encodedJson] = uri.split("data:application/json,");
    return JSON.parse(decodeURIComponent(encodedJson));
  }

  return JSON.parse(uri);
}

function tierEmoji(tier) {
  if (tier === "Gold") return "🥇";
  if (tier === "Silver") return "🥈";
  return "🥉";
}
