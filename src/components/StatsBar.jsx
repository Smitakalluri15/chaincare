export default function StatsBar({ stats, loading }) {
  const items = [
    { label: "Total Donated", value: loading ? "—" : `$${(stats?.total ?? 0).toLocaleString()}`, icon: "💚", color: "var(--emerald)" },
    { label: "Unique Donors", value: loading ? "—" : (stats?.donorCount ?? 0).toLocaleString(), icon: "🤝", color: "var(--teal)" },
    { label: "NGOs Supported", value: "4", icon: "🌍", color: "var(--royal)" },
    { label: "Gas Paid by Users", value: "0 ETH", icon: "⚡", color: "var(--gold)" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
      {items.map(({ label, value, icon, color }) => (
        <div key={label} className="stat-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
          <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", fontWeight: 700, color }}>{value}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--warm-gray-light)", fontWeight: 500, marginTop: 2 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}
