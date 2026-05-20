import { useState } from "react";
import StepProgress from "./StepProgress";

const IMPACT_DESCRIPTIONS = {
  "Food Relief Fund": ["10 TYI = 2 families fed for a day", "50 TYI = Emergency ration kit", "100 TYI = Week of meals for 5 children"],
  "Education Support NGO": ["10 TYI = School supplies for 1 child", "50 TYI = Scholarship for 1 month", "100 TYI = Full semester funding"],
  "Animal Welfare NGO": ["10 TYI = Shelter care for 3 animals", "50 TYI = Veterinary checkup", "100 TYI = Rescue & rehab operation"],
  "Disaster Relief Campaign": ["10 TYI = Emergency water supply", "50 TYI = Temporary shelter kit", "100 TYI = Medical aid for a family"],
};

const NGO_GRADIENTS = {
  "Food Relief Fund":         "linear-gradient(135deg, #fed7aa, #fdba74)",
  "Education Support NGO":    "linear-gradient(135deg, #ddd6fe, #c4b5fd)",
  "Animal Welfare NGO":       "linear-gradient(135deg, #bbf7d0, #86efac)",
  "Disaster Relief Campaign": "linear-gradient(135deg, #fecaca, #fca5a5)",
};

export default function NGOCard({ ngo, onDonate, activeStep, isActive }) {
  const [amount, setAmount] = useState("");
  const isDonating = isActive && activeStep > 0;
  const pct = ngo.goal > 0 ? Math.min(Math.round((ngo.raised / ngo.goal) * 100), 100) : 0;
  const impacts = IMPACT_DESCRIPTIONS[ngo.name] || [];

  const handleDonate = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    onDonate(ngo.name, val, ngo.id);
  };

  const quickAmounts = [10, 25, 50, 100];

  return (
    <div className="card card-hover animate-fade-up" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 24,
            background: NGO_GRADIENTS[ngo.name] || "var(--ivory-dark)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
          }}>
            {ngo.icon}
          </div>
          <div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--dark-text)", lineHeight: 1.3 }}>
              {ngo.name}
            </h3>
            <span style={{ fontSize: "0.78rem", color: "var(--warm-gray-light)" }}>
              {ngo.donors ?? 0} donors
            </span>
          </div>
        </div>
        <div className="badge badge-teal">{pct}% funded</div>
      </div>

      {/* Description */}
      <p style={{ fontSize: "0.85rem", color: "var(--warm-gray)", lineHeight: 1.7 }}>{ngo.description}</p>

      {/* Impact hints */}
      <div style={{ background: "var(--ivory)", borderRadius: 10, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
        {impacts.slice(0, 2).map((imp, i) => (
          <div key={i} style={{ fontSize: "0.78rem", color: "var(--teal-dark)", display: "flex", alignItems: "center", gap: 6 }}>
            <span>✦</span> {imp}
          </div>
        ))}
      </div>

      {/* Progress */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--warm-gray-light)", marginBottom: 6 }}>
          <span style={{ fontWeight: 600, color: "var(--dark-text)" }}>${ngo.raised?.toLocaleString() ?? 0} raised</span>
          <span>Goal: ${ngo.goal.toLocaleString()}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%`, background: ngo.color }} />
        </div>
      </div>

      {/* Quick amounts */}
      <div style={{ display: "flex", gap: 6 }}>
        {quickAmounts.map(q => (
          <button key={q} onClick={() => setAmount(q.toString())}
            style={{
              flex: 1, padding: "6px 4px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600,
              border: amount == q ? "1.5px solid var(--teal)" : "1.5px solid var(--ivory-border)",
              background: amount == q ? "rgba(13,148,136,0.08)" : "var(--ivory)",
              color: amount == q ? "var(--teal)" : "var(--warm-gray)", cursor: "pointer",
              transition: "all 0.15s"
            }}>
            {q}
          </button>
        ))}
      </div>

      {/* Donation input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="number" min="1" placeholder="Custom amount (TYI)"
          value={amount} onChange={e => setAmount(e.target.value)}
          disabled={isDonating} className="input-warm"
          style={{ flex: 1 }}
        />
        <button onClick={handleDonate} disabled={isDonating || !amount} className="btn-primary"
          style={{ whiteSpace: "nowrap", padding: "10px 18px" }}>
          {isDonating ? "Processing…" : "Donate →"}
        </button>
      </div>

      {/* Step progress */}
      {isActive && <StepProgress activeStep={activeStep} />}
    </div>
  );
}
