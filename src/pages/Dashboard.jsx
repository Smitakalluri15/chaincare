import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { useWallet } from "../context/useWallet";
import { useDonationStats } from "../hooks/useDonationStats";
import { useDonate } from "../hooks/useDonate";
import NGOCard from "../components/NGOCard";
import StatsBar from "../components/StatsBar";

export default function Dashboard() {
  const { account, connectWallet } = useWallet();
  const { stats, loading, refetch } = useDonationStats();
  const { donate, activeStep, donatingId, lastDonation } = useDonate({ onSuccess: refetch });

  if (!account) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 20, textAlign: "center", padding: 24 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: "linear-gradient(135deg, #f0fdf9, #e0f2fe)",
          border: "1px solid rgba(13,148,136,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36
        }}>🌿</div>
        <h2 className="font-display" style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--dark-text)" }}>
          Connect Your Wallet
        </h2>
        <p style={{ color: "var(--warm-gray)", maxWidth: 400, lineHeight: 1.7 }}>
          Connect MetaMask to start donating to causes you care about — no ETH needed.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={connectWallet} className="btn-primary" style={{ fontSize: "0.95rem", padding: "13px 28px" }}>
            Connect Wallet
          </button>
          <Link to="/advisor" style={{ textDecoration: "none" }}>
            <button className="btn-outline" style={{ fontSize: "0.95rem", padding: "12px 24px" }}>
              ✦ Try AI Advisor
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px" }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--dark-text)", marginBottom: 6 }}>
            NGO Dashboard
          </h1>
          <p style={{ color: "var(--warm-gray)", fontSize: "0.9rem" }}>
            Make a donation below — UGF sponsors all gas fees, you pay only in TYI
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/advisor" style={{ textDecoration: "none" }}>
            <button className="btn-primary" style={{ padding: "9px 18px", fontSize: "0.85rem" }}>
              ✦ AI Advisor
            </button>
          </Link>
          <Link to="/leaderboard" style={{ textDecoration: "none" }}>
            <button className="btn-outline" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
              Leaderboard
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="animate-fade-up delay-100">
        <StatsBar stats={stats} loading={loading} />
      </div>

      {/* UGF banner */}
      <div className="animate-fade-up delay-200" style={{
        display: "flex", alignItems: "center", gap: 12,
        background: "linear-gradient(135deg, #f0fdf9, #eff6ff)",
        border: "1px solid rgba(13,148,136,0.15)",
        borderRadius: 14, padding: "14px 20px", marginBottom: 28
      }}>
        <span style={{ fontSize: 20 }}>⚡</span>
        <div>
          <span style={{ fontWeight: 600, color: "var(--dark-text)", fontSize: "0.9rem" }}>Gasless transactions active </span>
          <span style={{ color: "var(--warm-gray)", fontSize: "0.85rem" }}>— All gas fees sponsored by UGF on Base Sepolia. You only need TYI Mock USD.</span>
        </div>
      </div>

      {/* Success banner */}
      {lastDonation && (
        <div className="animate-fade-in" style={{
          background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
          border: "1px solid rgba(5,150,105,0.2)", borderRadius: 16, padding: "20px 24px", marginBottom: 24
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div className="font-display" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--dark-text)", marginBottom: 4 }}>
                🎉 Donation Confirmed!
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--warm-gray)" }}>
                {lastDonation.amountTYI} TYI sent to {lastDonation.ngoName}. Your NFT badge has been minted.
              </div>
            </div>
            <a href={`https://sepolia.basescan.org/tx/${lastDonation.txHash}`} target="_blank" rel="noreferrer"
              style={{ fontSize: "0.85rem", color: "var(--teal)", fontWeight: 600, textDecoration: "underline" }}>
              View on BaseScan →
            </a>
          </div>
        </div>
      )}

      {/* NGO Cards */}
      <div className="animate-fade-up delay-300" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {stats?.ngoStats?.map(ngo => (
          <NGOCard key={ngo.id} ngo={ngo} onDonate={donate} activeStep={activeStep} isActive={donatingId === ngo.id} />
        ))}
        {loading && Array(4).fill(0).map((_, i) => (
          <div key={i} style={{ height: 340, borderRadius: 20 }} className="shimmer" />
        ))}
      </div>
    </div>
  );
}
