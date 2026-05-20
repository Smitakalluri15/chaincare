import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useContracts } from "../hooks/useContracts";

function shortenAddress(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

const RANK_STYLES = [
  { bg: "linear-gradient(135deg, #fef3c7, #fde68a)", color: "#92400e", border: "rgba(217,119,6,0.3)", label: "🥇" },
  { bg: "linear-gradient(135deg, #f1f5f9, #e2e8f0)", color: "#475569", border: "rgba(100,116,139,0.3)", label: "🥈" },
  { bg: "linear-gradient(135deg, #fef3c7, #fdba74)", color: "#9a3412", border: "rgba(234,88,12,0.2)", label: "🥉" },
];

export default function Leaderboard() {
  const { donationReader } = useContracts();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!donationReader) { setError("Contract not configured."); setLoading(false); return; }
      try {
        const donors = await donationReader.getAllDonors();
        const rows = await Promise.all(donors.map(async donor => ({
          donor,
          total: parseFloat(ethers.formatEther(await donationReader.donorTotals(donor))),
        })));
        setLeaders(rows.sort((a, b) => b.total - a.total).map((r, i) => ({ ...r, rank: i + 1 })));
      } catch { setError("Unable to load leaderboard."); }
      finally { setLoading(false); }
    };
    load();
  }, [donationReader]);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "36px 24px" }}>
      <div className="animate-fade-up" style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--dark-text)", marginBottom: 6 }}>
          Donor Leaderboard
        </h1>
        <p style={{ color: "var(--warm-gray)", fontSize: "0.9rem" }}>
          Ranked by total TYI donated — every contribution counts.
        </p>
      </div>

      {/* Top 3 podium */}
      {!loading && leaders.length >= 3 && (
        <div className="animate-fade-up delay-100" style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "flex-end" }}>
          {[leaders[1], leaders[0], leaders[2]].map((l, i) => {
            const isFirst = i === 1;
            const originalRank = isFirst ? 1 : i === 0 ? 2 : 3;
            const style = RANK_STYLES[originalRank - 1];
            return (
              <div key={l.donor} style={{
                flex: isFirst ? 1.3 : 1, textAlign: "center",
                background: style.bg, border: `1px solid ${style.border}`,
                borderRadius: 16, padding: isFirst ? "24px 16px" : "16px 12px",
                marginBottom: isFirst ? 0 : 8
              }}>
                <div style={{ fontSize: isFirst ? 28 : 22, marginBottom: 6 }}>{style.label}</div>
                <div style={{ fontFamily: "DM Mono, monospace", fontSize: "0.75rem", color: style.color, fontWeight: 600 }}>
                  {shortenAddress(l.donor)}
                </div>
                <div className="font-display" style={{ fontSize: isFirst ? "1.4rem" : "1.1rem", fontWeight: 700, color: style.color, marginTop: 4 }}>
                  {l.total} TYI
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="card animate-fade-up delay-200" style={{ overflow: "hidden" }}>
        {loading && <div style={{ padding: 32, textAlign: "center", color: "var(--warm-gray-light)" }}>Loading leaderboard…</div>}
        {error && <div style={{ padding: 32, color: "var(--rose)", textAlign: "center" }}>{error}</div>}
        {!loading && !error && leaders.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: "var(--warm-gray-light)" }}>No donors yet. Be the first!</div>
        )}
        {leaders.map((l, idx) => (
          <div key={l.donor} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: idx < leaders.length - 1 ? "1px solid var(--ivory-border)" : "none",
            background: l.rank <= 3 ? "rgba(13,148,136,0.02)" : "transparent"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: l.rank <= 3 ? "linear-gradient(135deg, var(--teal), var(--royal))" : "var(--ivory-dark)",
                color: l.rank <= 3 ? "white" : "var(--warm-gray)", fontSize: "0.82rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>#{l.rank}</div>
              <div>
                <div style={{ fontFamily: "DM Mono, monospace", fontSize: "0.88rem", fontWeight: 600, color: "var(--dark-text)" }}>
                  {shortenAddress(l.donor)}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--warm-gray-light)" }}>Base Sepolia donor</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="font-display" style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--teal)" }}>{l.total} TYI</div>
              <div style={{ fontSize: "0.72rem", color: "var(--warm-gray-light)" }}>total donated</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
