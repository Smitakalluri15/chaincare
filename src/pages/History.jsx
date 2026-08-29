import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useContracts } from "../hooks/useContracts";
import { shortenAddress } from "../utils/helpers";

export default function History() {
  const { donationReader } = useContracts();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      if (!donationReader) {
        setItems([]);
        setError("Donation contract is not configured.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const records = await donationReader.getAllDonations();
        const rows = records.map((record, index) => ({
          donationId: index,
          donor: record.donor,
          ngoName: record.ngoName,
          amount: parseFloat(ethers.formatEther(record.amount)),
          timestamp: Number(record.timestamp),
          txHash: null,
        })).reverse();

        // Show the history list immediately. Tx-hash enrichment is optional and
        // can be expensive when no deployment start block is configured.
        setItems(rows);
        setLoading(false);

        const startBlockValue = import.meta.env.VITE_DONATION_START_BLOCK;
        if (!startBlockValue) {
          return;
        }

        const runner = donationReader.runner?.provider ?? donationReader.runner;
        const startBlock = Number(startBlockValue);
        if (!runner?.getBlockNumber || !Number.isFinite(startBlock) || startBlock < 0) {
          return;
        }

        try {
          const currentBlock = await runner.getBlockNumber();
          const step = 1800;
          const txHashesByDonationId = new Map();

          for (let start = startBlock; start <= currentBlock; start += step) {
            const end = Math.min(start + step - 1, currentBlock);
            const events = await donationReader.queryFilter(
              donationReader.filters.DonationMade(),
              start,
              end,
            );

            events.forEach((event) => {
              const donationId = Number(event.args?.donationId);
              if (Number.isFinite(donationId)) {
                txHashesByDonationId.set(donationId, event.transactionHash);
              }
            });
          }

          setItems((currentItems) =>
            currentItems.map((row) => ({
              ...row,
              txHash: txHashesByDonationId.get(row.donationId) ?? row.txHash,
            })),
          );
        } catch (eventError) {
          console.warn("Failed to enrich donation history with tx hashes:", eventError);
        }
      } catch (error) {
        console.error("Failed to load donation history:", error);
        setItems([]);
        setError("Unable to load donation history from Base Sepolia right now.");
      } finally {
        setLoading(false);
      }
    };

    void loadHistory();
  }, [donationReader]);

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-syne text-3xl font-bold text-slate-100 mb-1">
          Donation History
        </h1>
        <p className="text-slate-400 text-sm">
          Live on-chain donations recorded through ChainCare on Base Sepolia.
        </p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[880px]">
            <div className="grid grid-cols-[1.1fr_1.2fr_.7fr_1.1fr_1fr] gap-4 px-5 py-4 border-b border-border text-xs text-slate-500 uppercase tracking-wide">
              <span>Donor</span>
              <span>NGO</span>
              <span>Amount</span>
              <span>Timestamp</span>
              <span>Tx Hash</span>
            </div>

            {loading && (
              <div className="px-5 py-10 text-sm text-slate-400">
                Loading donation history...
              </div>
            )}

            {!loading && error && (
              <div className="px-5 py-10 text-sm text-rose-300">
                {error}
              </div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="px-5 py-10 text-sm text-slate-400">
                No donations found yet.
              </div>
            )}

            {!loading &&
              !error &&
              items.map((item) => (
                <div
                  key={`${item.txHash ?? "donation"}-${item.donationId}`}
                  className="grid grid-cols-[1.1fr_1.2fr_.7fr_1.1fr_1fr] gap-4 px-5 py-4 border-b border-border last:border-0 text-sm"
                >
                  <div className="text-slate-200">{shortenAddress(item.donor)}</div>
                  <div className="text-slate-300">{item.ngoName}</div>
                  <div className="text-accent font-medium">
                    {item.amount.toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}{" "}
                    TYI
                  </div>
                  <div className="text-slate-300">
                    {new Date(item.timestamp * 1000).toLocaleString()}
                  </div>
                  <div>
                    {item.txHash ? (
                      <a
                        href={`https://sepolia.basescan.org/tx/${item.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent hover:underline break-all"
                      >
                        {shortenAddress(item.txHash)}
                      </a>
                    ) : (
                      <span className="text-slate-500">Unavailable</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
