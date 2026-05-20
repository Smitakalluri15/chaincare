import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useContracts } from "../hooks/useContracts";

function shortenAddress(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

const NGO_ICONS = {
  "Food Relief Fund": "🍱",
  "Education Support NGO": "📚",
  "Animal Welfare NGO": "🐾",
  "Disaster Relief Campaign": "🆘",
};

export default function History() {
  const { donationReader } = useContracts();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!donationReader) { setError("Contract not configured."); setLoading(false); return; }
      try {
        const records = await donationReader.getAllDonations();
        const rows = records.map((r, i) => ({
          donationId: i,
          donor: r.donor,
          ngoName: r.ngoName,
          amount: parseFloat(ethers.formatEther(r.amount)),
          timestamp: Number(r.timestamp),
          txHash: null,
        }));
        
        // Show immediately
        setItems([...rows].reverse());
        setLoading(false);

        // Fetch txHash asynchronously in the background
        const runner = donationReader.runner?.provider ?? donationReader.runner;
        const startBlock = Number(import.meta.env.VITE_DONATION_START_BLOCK ?? 0);
        if (runner?.getBlockNumber) {
          try {
            const currentBlock = await runner.getBlockNumber();
            // Start from at most 10,000 blocks ago to prevent rate limits
            const safeStartBlock = Math.max(startBlock, currentBlock - 10000);
            const step = 2000;
            const txMap = new Map();
            for (let s = safeStartBlock; s <= currentBlock; s += step) {
              const end = Math.min(s + step - 1, currentBlock);
              const events = await donationReader.queryFilter(donationReader.filters.DonationMade(), s, end);
              events.forEach(e => { const id = Number(e.args?.donationId); if (Number.isFinite(id)) txMap.set(id, e.transactionHash); });
            }
            if (txMap.size > 0) {
              setItems(currentItems => currentItems.map(item => ({
                ...item,
                txHash: txMap.get(item.donationId) ?? item.txHash
              })));
            }
          } catch { /* silently fail */ }
        }
      } catch { setError("Unable to load donation history."); setLoading(false); }
    };
    load();
  }, [donationReader]);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px" }}>
      <div className="animate-fade-up" style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--dark-text)", marginBottom: 6 }}>
          Donation History
        </h1>
        <p style={{ color: "var(--warm-gray)", fontSize: "0.9rem" }}>
          Live on-chain donations recorded on Base Sepolia — fully transparent.
        </p>
      </div>

      <div className="card animate-fade-up delay-100" style={{ overflow: "hidden" }}>
        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1.3fr 0.7fr 1.1fr 1fr",
          gap: 12, padding: "14px 24px", borderBottom: "1px solid var(--ivory-border)",
          fontSize: "0.72rem", fontWeight: 700, color: "var(--warm-gray-light)",
          letterSpacing: "0.06em", textTransform: "uppercase"
        }}>
          <span>Donor</span><span>NGO</span><span>Amount</span><span>Time</span><span>Tx Hash</span>
        </div>

        {loading && <div style={{ padding: 40, textAlign: "center", color: "var(--warm-gray-light)" }}>Loading history…</div>}
        {error && <div style={{ padding: 40, textAlign: "center", color: "var(--rose)" }}>{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--warm-gray-light)" }}>No donations found yet.</div>
        )}

        {items.map((item, idx) => (
          <div key={`${item.txHash}-${item.donationId}`} style={{
            display: "grid", gridTemplateColumns: "1fr 1.3fr 0.7fr 1.1fr 1fr",
            gap: 12, padding: "16px 24px",
            borderBottom: idx < items.length - 1 ? "1px solid var(--ivory-border)" : "none",
            transition: "background 0.15s"
          }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--ivory)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: "0.82rem", color: "var(--mid-text)" }}>{shortenAddress(item.donor)}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "var(--dark-text)", fontWeight: 500 }}>
              <span>{NGO_ICONS[item.ngoName] || "🌍"}</span> {item.ngoName}
            </div>
            <div style={{ fontWeight: 700, color: "var(--teal)", fontSize: "0.9rem" }}>{item.amount} TYI</div>
            <div style={{ fontSize: "0.8rem", color: "var(--warm-gray)" }}>
              {new Date(item.timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
            <div style={{ fontSize: "0.8rem" }}>
              {item.txHash ? (
                <a href={`https://sepolia.basescan.org/tx/${item.txHash}`} target="_blank" rel="noreferrer"
                  style={{ color: "var(--teal)", fontFamily: "DM Mono, monospace", textDecoration: "underline" }}>
                  {shortenAddress(item.txHash)}
                </a>
              ) : (
                <span style={{ color: "var(--warm-gray-light)" }}>—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
