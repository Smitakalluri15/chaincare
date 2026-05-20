import { useWallet } from "../context/useWallet";

function shortenAddr(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export default function WalletButton() {
  const { account, connectWallet, disconnectWallet, isConnecting } = useWallet();

  if (account) {
    return (
      <button
        onClick={disconnectWallet}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--surface)", border: "1px solid var(--ivory-border)",
          borderRadius: 12, padding: "8px 14px", cursor: "pointer",
          fontSize: "0.82rem", fontWeight: 500, color: "var(--mid-text)",
          boxShadow: "0 2px 8px var(--shadow-warm)", transition: "all 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--rose)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--ivory-border)"}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--emerald-light)" }} />
        <span style={{ fontFamily: "DM Mono, monospace", fontSize: "0.8rem" }}>{shortenAddr(account)}</span>
      </button>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="btn-primary"
      style={{ padding: "9px 20px", fontSize: "0.82rem" }}
    >
      {isConnecting ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
