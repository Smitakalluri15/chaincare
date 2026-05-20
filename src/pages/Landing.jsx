import { Link } from "react-router-dom";
import { useWallet } from "../context/useWallet";

const stats = [
  { value: "$48,320", label: "Total Donated", icon: "💚" },
  { value: "1,204",   label: "Donors",         icon: "🤝" },
  { value: "4",       label: "NGOs Supported",  icon: "🌍" },
  { value: "0 ETH",  label: "Gas Paid by Users",icon: "⚡" },
];

const features = [
  {
    icon: "✦",
    title: "AI-Powered Advisor",
    desc: "Claude recommends the perfect NGO based on your values through natural conversation.",
    color: "var(--teal)",
    bg: "linear-gradient(135deg, #f0fdf9, #e0f2fe)",
  },
  {
    icon: "⚡",
    title: "Gasless Donations",
    desc: "Powered by UGF — you only need TYI Mock USD. Zero ETH required.",
    color: "var(--gold)",
    bg: "linear-gradient(135deg, #fffbeb, #fef3c7)",
  },
  {
    icon: "🏅",
    title: "NFT Donor Badges",
    desc: "Every donation mints a permanent on-chain badge to your wallet — Bronze, Silver, or Gold.",
    color: "var(--emerald)",
    bg: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
  },
  {
    icon: "🔗",
    title: "Fully On-Chain",
    desc: "All records live on Base Sepolia. Transparent, tamper-proof, and verifiable by anyone.",
    color: "var(--royal)",
    bg: "linear-gradient(135deg, #eff6ff, #dbeafe)",
  },
];

const causes = [
  { icon: "🍱", name: "Food Relief Fund", tag: "Hunger", color: "#f97316", pct: 64 },
  { icon: "📚", name: "Education Support NGO", tag: "Education", color: "#8b5cf6", pct: 41 },
  { icon: "🐾", name: "Animal Welfare NGO", tag: "Animals", color: "#10b981", pct: 78 },
  { icon: "🆘", name: "Disaster Relief Campaign", tag: "Emergency", color: "#ef4444", pct: 29 },
];

export default function Landing() {
  const { account, connectWallet, isConnecting } = useWallet();

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <section className="hero-gradient texture" style={{ position: "relative", padding: "80px 24px 64px", textAlign: "center", overflow: "hidden" }}>
        {/* Orbs */}
        <div className="orb orb-teal" style={{ width: 500, height: 500, top: -200, left: -100, zIndex: 0 }} />
        <div className="orb orb-gold" style={{ width: 400, height: 400, top: -100, right: -80, zIndex: 0 }} />
        <div className="orb orb-blue" style={{ width: 300, height: 300, bottom: -100, left: "40%", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto" }}>
          <div className="animate-fade-up" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.2)",
            borderRadius: 100, padding: "6px 18px", marginBottom: 28,
            fontSize: "0.8rem", fontWeight: 600, color: "var(--teal-dark)",
            backdropFilter: "blur(8px)"
          }}>
            ✦ AI-Powered · Gasless · On-Chain
          </div>

          <h1 className="font-display animate-fade-up delay-100" style={{
            fontSize: "clamp(2.4rem, 5vw, 3.8rem)", fontWeight: 700,
            lineHeight: 1.15, letterSpacing: "-0.03em",
            color: "var(--dark-text)", marginBottom: 20
          }}>
            Give with Intelligence.
            <br />
            <span className="text-gradient-teal">Impact with Purpose.</span>
          </h1>

          <p className="animate-fade-up delay-200" style={{
            fontSize: "1.05rem", color: "var(--warm-gray)", lineHeight: 1.75,
            maxWidth: 560, margin: "0 auto 36px"
          }}>
            ChainCare uses AI to guide your charitable giving and blockchain to make it transparent.
            No ETH needed — UGF handles the gas, you handle the heart.
          </p>

          <div className="animate-fade-up delay-300" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/advisor" style={{ textDecoration: "none" }}>
              <button className="btn-primary" style={{ fontSize: "0.95rem", padding: "14px 32px" }}>
                ✦ Chat with AI Advisor
              </button>
            </Link>
            {account ? (
              <Link to="/dashboard" style={{ textDecoration: "none" }}>
                <button className="btn-outline" style={{ fontSize: "0.95rem", padding: "13px 28px" }}>
                  Go to Dashboard →
                </button>
              </Link>
            ) : (
              <button className="btn-outline" onClick={connectWallet} disabled={isConnecting}
                style={{ fontSize: "0.95rem", padding: "13px 28px" }}>
                {isConnecting ? "Connecting…" : "Connect Wallet"}
              </button>
            )}
          </div>

          <div className="animate-fade-up delay-400" style={{ marginTop: 24, fontSize: "0.78rem", color: "var(--warm-gray-light)" }}>
            Built on Base Sepolia · Powered by UGF · Audited by Claude AI
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ background: "white", borderTop: "1px solid var(--ivory-border)", borderBottom: "1px solid var(--ivory-border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, textAlign: "center" }}>
          {stats.map(({ value, label, icon }) => (
            <div key={label}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
              <div className="font-display" style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--teal)" }}>{value}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--warm-gray-light)", fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section style={{ padding: "72px 24px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="font-display" style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--dark-text)", marginBottom: 10 }}>
            Why ChainCare Is Different
          </h2>
          <p style={{ color: "var(--warm-gray)", fontSize: "0.95rem", maxWidth: 500, margin: "0 auto" }}>
            The only humanitarian platform that combines AI intelligence with blockchain transparency and gasless UX.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {features.map(({ icon, title, desc, color, bg }) => (
            <div key={title} className="card card-hover animate-fade-up" style={{ padding: 24 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, marginBottom: 14, color
              }}>{icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--dark-text)", marginBottom: 6 }}>{title}</h3>
              <p style={{ fontSize: "0.83rem", color: "var(--warm-gray)", lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Causes preview */}
      <section style={{ background: "var(--ivory-dark)", padding: "64px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 className="font-display" style={{ fontSize: "1.9rem", fontWeight: 700, color: "var(--dark-text)", marginBottom: 8 }}>
              Causes You Can Support
            </h2>
            <p style={{ color: "var(--warm-gray)", fontSize: "0.9rem" }}>Each donation is recorded permanently on Base Sepolia</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {causes.map(({ icon, name, tag, color, pct }) => (
              <div key={name} className="card" style={{ padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
                <div className="badge" style={{ background: `${color}15`, color, border: `1px solid ${color}30`, marginBottom: 10 }}>{tag}</div>
                <h3 style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--dark-text)", marginBottom: 12, lineHeight: 1.35 }}>{name}</h3>
                <div className="progress-bar" style={{ marginBottom: 6 }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--warm-gray-light)" }}>{pct}% funded</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "72px 24px", textAlign: "center", background: "white" }}>
        <div style={{
          maxWidth: 600, margin: "0 auto",
          background: "linear-gradient(135deg, #f0fdf9, #eff6ff)",
          border: "1px solid rgba(13,148,136,0.15)", borderRadius: 24, padding: "48px 36px"
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🌿</div>
          <h2 className="font-display" style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--dark-text)", marginBottom: 12 }}>
            Ready to Make an Impact?
          </h2>
          <p style={{ color: "var(--warm-gray)", marginBottom: 28, lineHeight: 1.7 }}>
            Let our AI advisor guide you to the cause that matches your heart. Takes 2 minutes. Zero gas needed.
          </p>
          <Link to="/advisor" style={{ textDecoration: "none" }}>
            <button className="btn-primary" style={{ fontSize: "0.95rem", padding: "14px 36px" }}>
              ✦ Start with AI Advisor
            </button>
          </Link>
          <div style={{ marginTop: 16, fontSize: "0.78rem", color: "var(--warm-gray-light)" }}>
            Or <Link to="/dashboard" style={{ color: "var(--teal)" }}>browse NGOs directly →</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "var(--ivory-dark)", borderTop: "1px solid var(--ivory-border)", padding: "28px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "0.8rem", color: "var(--warm-gray-light)" }}>
          Built with ❤️ for the UGF Hackathon · Base Sepolia · Powered by{" "}
          <a href="https://universalgasframework.com" target="_blank" rel="noreferrer" style={{ color: "var(--teal)" }}>UGF</a> &{" "}
          <a href="https://anthropic.com" target="_blank" rel="noreferrer" style={{ color: "var(--teal)" }}>Claude AI</a>
        </div>
      </footer>
    </div>
  );
}
