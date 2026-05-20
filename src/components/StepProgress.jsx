const STEPS = [
  { id: 1, label: "Quoting gas" },
  { id: 2, label: "Authorizing TYI" },
  { id: 3, label: "Executing via UGF" },
  { id: 4, label: "Confirmed" },
];

export default function StepProgress({ activeStep }) {
  return (
    <div style={{
      background: "var(--ivory)", borderRadius: 12, padding: "12px 16px",
      border: "1px solid var(--ivory-border)", display: "flex", flexDirection: "column", gap: 8
    }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--warm-gray-light)", letterSpacing: "0.05em", marginBottom: 2 }}>
        TRANSACTION PROGRESS
      </div>
      {STEPS.map(step => {
        const isDone = activeStep > step.id;
        const isActive = activeStep === step.id;
        return (
          <div key={step.id} className={`step-item${isActive ? " active" : ""}${isDone ? " done" : ""}`}>
            <div className="step-dot" />
            <span>{step.label}</span>
            {isDone && <span style={{ marginLeft: "auto", color: "var(--emerald)" }}>✓</span>}
            {isActive && (
              <span style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
                <span className="typing-dot" style={{ width: 5, height: 5 }} />
                <span className="typing-dot" style={{ width: 5, height: 5 }} />
                <span className="typing-dot" style={{ width: 5, height: 5 }} />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
