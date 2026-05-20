import { Link, useLocation } from "react-router-dom";
import WalletButton from "./WalletButton";
import { useWallet } from "../context/useWallet";

const links = [
  { to: "/dashboard",   label: "Dashboard"   },
  { to: "/advisor",     label: "AI Advisor"  },
  { to: "/history",     label: "History"     },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/badges",      label: "My Badges"   },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { isCorrectNetwork, switchToBaseSepolia } = useWallet();

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg, var(--teal), var(--royal))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, boxShadow: "0 4px 12px var(--shadow-teal)"
        }}>🌿</div>
        <span className="font-display" style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--dark-text)", letterSpacing: "-0.02em" }}>
          Chain<span style={{ color: "var(--teal)" }}>Care</span>
        </span>
        <span className="badge badge-teal hide-mobile" style={{ marginLeft: 4 }}>AI-Powered</span>
      </Link>

      {/* Nav links */}
      <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 32 }}>
        {links.map(({ to, label }) => (
          <Link key={to} to={to} style={{
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: pathname === to ? "var(--teal)" : "var(--warm-gray)",
            borderBottom: pathname === to ? "2px solid var(--teal)" : "2px solid transparent",
            paddingBottom: 2,
            transition: "color 0.2s, border-color 0.2s",
          }}>
            {label === "AI Advisor" ? "✦ " + label : label}
          </Link>
        ))}
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {!isCorrectNetwork ? (
          <button onClick={switchToBaseSepolia} style={{
            display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 100, padding: "5px 12px", fontSize: "0.75rem",
            color: "var(--error)", fontWeight: 600, transition: "all 0.2s"
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--error)", display: "inline-block" }} />
            Switch to Base Sepolia
          </button>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.2)",
            borderRadius: 100, padding: "5px 12px", fontSize: "0.75rem",
            color: "var(--teal)", fontWeight: 600
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--emerald-light)", display: "inline-block", animation: "pulse-soft 2s infinite" }} />
            Base Sepolia
          </div>
        )}
        <WalletButton />
      </div>
    </nav>
  );
}
