import { useEffect, useState } from "react";
import { useContracts } from "../hooks/useContracts";
import { useWallet } from "../context/useWallet";

function parseTokenMetadata(uri) {
  if (!uri) return {};
  if (uri.startsWith("data:application/json;base64,")) {
    const [, base64] = uri.split("base64,");
    return JSON.parse(window.atob(base64));
  }
  if (uri.startsWith("data:application/json,")) {
    return JSON.parse(decodeURIComponent(uri.split("data:application/json,")[1]));
  }
  return JSON.parse(uri);
}

const TIER_CONFIG = {
  Gold:   { emoji: "🥇", gradient: "linear-gradient(135deg, #FFE87C, #D4AF37, #B8860B)", color: "#78350f", border: "rgba(217,119,6,0.6)", badge: "badge-gold" },
  Silver: { emoji: "🥈", gradient: "linear-gradient(135deg, #F8F9FA, #E2E8F0, #94A3B8)", color: "#334155", border: "rgba(100,116,139,0.5)", badge: "badge-royal" },
  Bronze: { emoji: "🥉", gradient: "linear-gradient(135deg, #FFEDD5, #FDBA74, #C2410C)", color: "#7c2d12", border: "rgba(234,88,12,0.5)", badge: "badge-teal" },
};

const NGO_ICONS = {
  "Food Relief Fund": "🍱",
  "Education Support NGO": "📚",
  "Animal Welfare NGO": "🐾",
  "Disaster Relief Campaign": "🆘",
};

export default function Badges() {
  const { account, connectWallet } = useWallet();
  const { badgeReader } = useContracts();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!account) { setBadges([]); setLoading(false); return; }
      if (!badgeReader) { setError("Badge contract not configured."); setLoading(false); return; }
      try {
        const tokenIds = await badgeReader.getBadgesByDonor(account);
        const rows = await Promise.all(tokenIds.map(async tokenId => {
          const uri = await badgeReader.tokenURI(tokenId);
          const meta = parseTokenMetadata(uri);
          const ngo = meta.attributes?.find(a => a.trait_type === "NGO")?.value;
          const tier = meta.attributes?.find(a => a.trait_type === "Tier")?.value;
          return { tokenId: Number(tokenId), name: meta.name ?? `Badge #${tokenId}`, description: meta.description ?? "", ngo: ngo ?? "ChainCare", tier: tier ?? "Bronze" };
        }));
        setBadges(rows.reverse());
      } catch { setError("Unable to load badges."); }
      finally { setLoading(false); }
    };
    load();
  }, [account, badgeReader]);

  const goldCount = badges.filter(b => b.tier === "Gold").length;
  const silverCount = badges.filter(b => b.tier === "Silver").length;
  const bronzeCount = badges.filter(b => b.tier === "Bronze").length;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px" }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--dark-text)", marginBottom: 6 }}>
            My Donor Badges
          </h1>
          <p style={{ color: "var(--warm-gray)", fontSize: "0.9rem" }}>
            NFT badges minted on-chain — permanent proof of your generosity.
          </p>
        </div>
        {account?.toLowerCase() === "0xe7862283741f429a3f7492e58b1182930dd4a9f5" && (
          <button 
            className="btn-primary" 
            style={{ padding: "10px 20px" }}
            onClick={async () => {
              try {
                const badgeAddress = import.meta.env.VITE_DONOR_BADGE_CONTRACT_ADDRESS ?? import.meta.env.VITE_BADGE_CONTRACT;
                const ethers = await import("ethers").then(m => m.ethers);
                // eslint-disable-next-line no-undef
                const signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
                const contract = new ethers.Contract(badgeAddress, ["function mintBadge(address,string,uint256) external"], signer);
                await contract.mintBadge(account, "Food Relief Fund", ethers.parseEther("50"));
                alert("Claiming badge... Please wait for the transaction to confirm, then refresh!");
              } catch (e) {
                console.error(e);
                alert("Failed to claim badge. Check console.");
              }
            }}
          >
            ✦ Claim Badge (Admin)
          </button>
        )}
      </div>

      {/* Summary row */}
      {!loading && badges.length > 0 && (
        <div className="animate-fade-up delay-100" style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
          <div className="stat-card" style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px" }}>
            <span style={{ fontSize: 24 }}>🏅</span>
            <div>
              <div className="font-display" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--teal)" }}>{badges.length}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--warm-gray-light)" }}>Total Badges</div>
            </div>
          </div>
          {goldCount > 0 && <div className="stat-card" style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px" }}>
            <span style={{ fontSize: 22 }}>🥇</span>
            <div><div style={{ fontWeight: 700, color: "#92400e" }}>{goldCount}</div><div style={{ fontSize: "0.72rem", color: "var(--warm-gray-light)" }}>Gold</div></div>
          </div>}
          {silverCount > 0 && <div className="stat-card" style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px" }}>
            <span style={{ fontSize: 22 }}>🥈</span>
            <div><div style={{ fontWeight: 700, color: "#475569" }}>{silverCount}</div><div style={{ fontSize: "0.72rem", color: "var(--warm-gray-light)" }}>Silver</div></div>
          </div>}
          {bronzeCount > 0 && <div className="stat-card" style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px" }}>
            <span style={{ fontSize: 22 }}>🥉</span>
            <div><div style={{ fontWeight: 700, color: "#9a3412" }}>{bronzeCount}</div><div style={{ fontSize: "0.72rem", color: "var(--warm-gray-light)" }}>Bronze</div></div>
          </div>}
        </div>
      )}

      {/* Not connected */}
      {!account && !loading && (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
          <p style={{ color: "var(--warm-gray)", marginBottom: 20 }}>Connect your wallet to view your donor badges.</p>
          <button onClick={connectWallet} className="btn-primary">Connect Wallet</button>
        </div>
      )}

      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {Array(3).fill(0).map((_, i) => <div key={i} style={{ height: 300, borderRadius: 20 }} className="shimmer" />)}
        </div>
      )}

      {error && <div style={{ padding: 32, textAlign: "center", color: "var(--rose)" }}>{error}</div>}

      {!loading && !error && account && badges.length === 0 && (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
          <h3 className="font-display" style={{ fontSize: "1.2rem", color: "var(--dark-text)", marginBottom: 8 }}>No badges yet</h3>
          <p style={{ color: "var(--warm-gray)", fontSize: "0.9rem" }}>Make your first donation to earn a ChainCare donor badge.</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {badges.map(badge => {
          const cfg = TIER_CONFIG[badge.tier] || TIER_CONFIG.Bronze;
          return (
            <div key={badge.tokenId} className="card card-hover animate-fade-up" style={{ padding: 24, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1rem", fontWeight: 700, color: "var(--dark-text)", marginBottom: 2 }}>
                    {badge.name}
                  </h2>
                  <div style={{ fontFamily: "DM Mono, monospace", fontSize: "0.72rem", color: "var(--warm-gray-light)" }}>
                    Token #{badge.tokenId}
                  </div>
                </div>
                <div className={`badge ${cfg.badge}`}>{badge.tier}</div>
              </div>

              {/* Badge visual */}
              <div 
                className="badge-nft-card"
                style={{
                  background: cfg.gradient, 
                  border: `1px solid ${cfg.border}`,
                }}
              >
                <div className="badge-nft-icon">{cfg.emoji}</div>
                <div style={{ fontSize: 16, marginBottom: 8 }}>{NGO_ICONS[badge.ngo] || "🌍"}</div>
                <div className="badge-nft-ngo" style={{ color: cfg.color }}>
                  {badge.ngo}
                </div>
              </div>

              <p style={{ fontSize: "0.82rem", color: "var(--warm-gray)", lineHeight: 1.6 }}>{badge.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
