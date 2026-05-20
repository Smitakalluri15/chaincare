import { useState, useRef, useEffect } from "react";
import { useWallet } from "../context/useWallet";
import { useDonate } from "../hooks/useDonate";
import { useDonationStats } from "../hooks/useDonationStats";
import StepProgress from "../components/StepProgress";

// ─── Constants ───────────────────────────────────────────────────────────────

const NGO_LIST = [
  { id: "food",     name: "Food Relief Fund",         icon: "🍱", color: "#f97316" },
  { id: "edu",      name: "Education Support NGO",    icon: "📚", color: "#8b5cf6" },
  { id: "animal",   name: "Animal Welfare NGO",       icon: "🐾", color: "#10b981" },
  { id: "disaster", name: "Disaster Relief Campaign", icon: "🆘", color: "#ef4444" },
];

// Granular impact table — amount in TYI → real-world outcomes
const IMPACT_TABLE = {
  "food": {
    label: "Food Relief Fund",
    icon: "🍱",
    color: "#f97316",
    bg: "linear-gradient(135deg, #fff7ed, #ffedd5)",
    border: "rgba(249,115,22,0.2)",
    unit: "meals",
    mealsPerTYI: 0.4,   // 1 TYI ≈ 0.4 family-meals
    milestones: [
      { tyi: 5,   icon: "🥣", label: "1 family's daily meal" },
      { tyi: 10,  icon: "🍱", label: "2 families fed for a day" },
      { tyi: 25,  icon: "🧺", label: "Emergency ration kit" },
      { tyi: 50,  icon: "🏕️", label: "Week of meals for 5 children" },
      { tyi: 100, icon: "🏘️", label: "Monthly nutrition for 8 families" },
      { tyi: 250, icon: "🌾", label: "Community feeding program — 1 month" },
    ],
    impactLines: (amt) => [
      { icon: "🥣", text: `~${Math.round(amt * 0.4 * 2)} meals provided` },
      { icon: "👨‍👩‍👧", text: `${Math.round(amt * 0.08)} families fed for 1 day` },
      { icon: "🌍", text: `${(amt * 0.6).toFixed(1)} kg of food distributed` },
    ],
  },
  "edu": {
    label: "Education Support NGO",
    icon: "📚",
    color: "#8b5cf6",
    bg: "linear-gradient(135deg, #faf5ff, #ede9fe)",
    border: "rgba(139,92,246,0.2)",
    unit: "school days",
    mealsPerTYI: 0,
    milestones: [
      { tyi: 5,   icon: "✏️", label: "School supplies for 1 child" },
      { tyi: 10,  icon: "📖", label: "Textbooks for a semester" },
      { tyi: 25,  icon: "🎒", label: "Full kit for 3 children" },
      { tyi: 50,  icon: "🏫", label: "1-month scholarship" },
      { tyi: 100, icon: "🎓", label: "Full semester funded" },
      { tyi: 250, icon: "🌟", label: "Annual scholarship for 1 student" },
    ],
    impactLines: (amt) => [
      { icon: "📚", text: `${Math.round(amt * 0.5)} days of school funded` },
      { icon: "✏️", text: `${Math.round(amt * 0.3)} children receive supplies` },
      { icon: "🎓", text: `${(amt / 100).toFixed(1)} months of scholarship` },
    ],
  },
  "animal": {
    label: "Animal Welfare NGO",
    icon: "🐾",
    color: "#10b981",
    bg: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
    border: "rgba(16,185,129,0.2)",
    unit: "animals cared for",
    milestones: [
      { tyi: 5,   icon: "🐱", label: "1 animal's weekly care" },
      { tyi: 10,  icon: "🐶", label: "3 animals sheltered" },
      { tyi: 25,  icon: "🏥", label: "Veterinary checkup" },
      { tyi: 50,  icon: "🐕", label: "Rescue & rehabilitation" },
      { tyi: 100, icon: "🏡", label: "Full rescue operation" },
      { tyi: 250, icon: "🌿", label: "Shelter operations for 1 month" },
    ],
    impactLines: (amt) => [
      { icon: "🐾", text: `${Math.round(amt * 0.3)} animals sheltered` },
      { icon: "🩺", text: `${Math.round(amt * 0.1)} vet consultations` },
      { icon: "🏡", text: `${Math.round(amt * 0.05)} rescue operations supported` },
    ],
  },
  "disaster": {
    label: "Disaster Relief Campaign",
    icon: "🆘",
    color: "#ef4444",
    bg: "linear-gradient(135deg, #fff1f2, #fce7f3)",
    border: "rgba(239,68,68,0.2)",
    unit: "people aided",
    milestones: [
      { tyi: 5,   icon: "💧", label: "Clean water for 2 days" },
      { tyi: 10,  icon: "🏥", label: "First aid supplies" },
      { tyi: 25,  icon: "⛺", label: "Temporary shelter kit" },
      { tyi: 50,  icon: "🚑", label: "Medical aid for a family" },
      { tyi: 100, icon: "🏗️", label: "Emergency infrastructure support" },
      { tyi: 250, icon: "🌐", label: "Community recovery — 1 week" },
    ],
    impactLines: (amt) => [
      { icon: "💧", text: `${Math.round(amt * 2)} days of clean water` },
      { icon: "👤", text: `${Math.round(amt * 0.2)} people receive emergency aid` },
      { icon: "🏥", text: `${Math.round(amt * 0.05)} medical kits deployed` },
    ],
  },
};

// Plan frequency options
const FREQUENCIES = [
  { id: "weekly",   label: "Weekly",   multiplier: 4,  desc: "4× per month — maximum ongoing impact" },
  { id: "biweekly", label: "Bi-weekly", multiplier: 2, desc: "2× per month — consistent giving" },
  { id: "monthly",  label: "Monthly",  multiplier: 1,  desc: "Once a month — steady support" },
];

// ─── System prompt (enhanced) ────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are ChainCare's AI Philanthropy Advisor — warm, emotionally intelligent, and data-driven.

NGOs on ChainCare (Base Sepolia):
1. Food Relief Fund — Emergency meals. 1 TYI ≈ 0.4 family-meals. 10 TYI feeds 2 families/day.
2. Education Support NGO — Scholarships & supplies. 10 TYI = school supplies, 50 TYI = 1-month scholarship.
3. Animal Welfare NGO — Animal rescue & rehab. 10 TYI = 3 animals sheltered, 50 TYI = vet checkup.
4. Disaster Relief Campaign — Emergency aid. 10 TYI = water supply, 50 TYI = medical aid for 1 family.

All donations are gasless via UGF — user never touches ETH.

RULES:
- Be warm, conversational, 2-4 sentences max per reply
- Always mention specific real-world impact numbers when recommending (e.g. "25 TYI will feed 10 families for a day")
- When recommending a donation, also suggest a recurring plan (e.g. "monthly 20 TYI")
- When ready to donate, append at END of message:
  [DONATION_READY]{"ngo":"Food Relief Fund","amount":25,"ngoId":"food","suggestedPlan":{"frequency":"monthly","amount":20,"ngoId":"food","ngo":"Food Relief Fund"}}[/DONATION_READY]
- If user says "confirm", "yes", "donate", "proceed" → output DONATION_READY
- Never mention ETH, gas, blockchain complexity`;

// ─── Impact Predictor Component ──────────────────────────────────────────────

function ImpactPredictor({ ngoId, amount }) {
  const ngo = IMPACT_TABLE[ngoId];
  if (!ngo || !amount || amount <= 0) return null;

  const lines = ngo.impactLines(amount);
  const closestMilestone = [...ngo.milestones]
    .filter(m => m.tyi <= amount)
    .pop() || ngo.milestones[0];
  const nextMilestone = ngo.milestones.find(m => m.tyi > amount);
  const toNext = nextMilestone ? nextMilestone.tyi - amount : null;

  return (
    <div style={{
      background: ngo.bg, border: `1px solid ${ngo.border}`,
      borderRadius: 16, padding: 18, marginTop: 4
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{ngo.icon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--dark-text)" }}>
            Real-World Impact
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--warm-gray-light)" }}>
            {amount} TYI → {ngo.label}
          </div>
        </div>
      </div>

      {/* Impact lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.83rem", color: "var(--mid-text)" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{line.icon}</span>
            <span style={{ fontWeight: 500 }}>{line.text}</span>
          </div>
        ))}
      </div>

      {/* Milestone reached */}
      {closestMilestone && (
        <div style={{
          background: "rgba(255,255,255,0.7)", borderRadius: 10,
          padding: "8px 12px", marginBottom: toNext ? 8 : 0,
          display: "flex", alignItems: "center", gap: 8
        }}>
          <span style={{ fontSize: 18 }}>{closestMilestone.icon}</span>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: ngo.color, letterSpacing: "0.04em" }}>MILESTONE REACHED</div>
            <div style={{ fontSize: "0.82rem", color: "var(--dark-text)", fontWeight: 600 }}>{closestMilestone.label}</div>
          </div>
        </div>
      )}

      {/* Next milestone teaser */}
      {toNext && nextMilestone && (
        <div style={{ fontSize: "0.75rem", color: "var(--warm-gray)", textAlign: "center", fontStyle: "italic" }}>
          Add {toNext} TYI more to unlock: {nextMilestone.icon} {nextMilestone.label}
        </div>
      )}
    </div>
  );
}

// ─── Donation Plan Builder ────────────────────────────────────────────────────

function PlanBuilder({ suggestedPlan, onActivate, onDismiss }) {
  const [freq, setFreq] = useState(suggestedPlan?.frequency || "monthly");
  const [amt, setAmt] = useState(suggestedPlan?.amount || 20);
  const [ngoId, setNgoId] = useState(suggestedPlan?.ngoId || "food");
  const [planName, setPlanName] = useState("");
  const [saved, setSaved] = useState(false);

  const ngo = IMPACT_TABLE[ngoId];
  const freqObj = FREQUENCIES.find(f => f.id === freq);
  const monthlyTotal = amt * (freqObj?.multiplier || 1);
  const annualTotal = monthlyTotal * 12;

  const handleSave = () => {
    const plan = { id: Date.now(), name: planName || `${ngo?.label} ${freq} plan`, ngoId, ngo: ngo?.label, amount: amt, frequency: freq, monthlyTotal, annualTotal, active: true, createdAt: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem("chaincare_plans") || "[]");
    localStorage.setItem("chaincare_plans", JSON.stringify([...existing, plan]));
    setSaved(true);
    onActivate?.(plan);
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #f0fdf9, #eff6ff)",
      border: "1.5px solid rgba(13,148,136,0.2)", borderRadius: 18, padding: 22
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "1.05rem", color: "var(--dark-text)", marginBottom: 2 }}>
            ✦ Autonomous Donation Plan
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--warm-gray-light)" }}>Set it up once — give consistently</div>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--warm-gray-light)", fontSize: 18 }}>×</button>
        )}
      </div>

      {/* Plan name */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--warm-gray)", letterSpacing: "0.04em", display: "block", marginBottom: 4 }}>PLAN NAME (OPTIONAL)</label>
        <input className="input-warm" placeholder="e.g. My Monthly Giving" value={planName} onChange={e => setPlanName(e.target.value)} style={{ fontSize: "0.85rem" }} />
      </div>

      {/* NGO picker */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--warm-gray)", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>CAUSE</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {NGO_LIST.map(n => (
            <button key={n.id} onClick={() => setNgoId(n.id)} style={{
              padding: "8px 10px", borderRadius: 10, border: ngoId === n.id ? `1.5px solid ${n.color}` : "1.5px solid var(--ivory-border)",
              background: ngoId === n.id ? `${n.color}10` : "white",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              fontSize: "0.78rem", fontWeight: 600, color: ngoId === n.id ? n.color : "var(--warm-gray)",
              transition: "all 0.15s"
            }}>
              <span>{n.icon}</span> {n.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--warm-gray)", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>AMOUNT PER DONATION (TYI)</label>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {[10, 20, 50, 100].map(q => (
            <button key={q} onClick={() => setAmt(q)} style={{
              flex: 1, padding: "7px 4px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700,
              border: amt === q ? "1.5px solid var(--teal)" : "1.5px solid var(--ivory-border)",
              background: amt === q ? "rgba(13,148,136,0.1)" : "white",
              color: amt === q ? "var(--teal)" : "var(--warm-gray)", cursor: "pointer", transition: "all 0.15s"
            }}>{q}</button>
          ))}
        </div>
        <input type="number" min="1" className="input-warm" value={amt} onChange={e => setAmt(Number(e.target.value))} style={{ fontSize: "0.85rem" }} />
      </div>

      {/* Frequency */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--warm-gray)", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>FREQUENCY</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {FREQUENCIES.map(f => (
            <button key={f.id} onClick={() => setFreq(f.id)} style={{
              padding: "9px 12px", borderRadius: 10, textAlign: "left",
              border: freq === f.id ? "1.5px solid var(--teal)" : "1.5px solid var(--ivory-border)",
              background: freq === f.id ? "rgba(13,148,136,0.06)" : "white",
              cursor: "pointer", transition: "all 0.15s"
            }}>
              <div style={{ fontWeight: 700, fontSize: "0.82rem", color: freq === f.id ? "var(--teal)" : "var(--dark-text)" }}>{f.label}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--warm-gray-light)", marginTop: 1 }}>{f.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Impact preview */}
      {ngo && amt > 0 && (
        <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--warm-gray)", letterSpacing: "0.04em", marginBottom: 8 }}>PROJECTED ANNUAL IMPACT</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: "0.82rem", color: "var(--mid-text)" }}>Per donation</span>
            <span style={{ fontWeight: 700, color: "var(--teal)", fontSize: "0.88rem" }}>{amt} TYI</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: "0.82rem", color: "var(--mid-text)" }}>Monthly total</span>
            <span style={{ fontWeight: 700, color: "var(--dark-text)", fontSize: "0.88rem" }}>{monthlyTotal} TYI</span>
          </div>
          <div style={{ height: 1, background: "var(--ivory-border)", margin: "8px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--dark-text)" }}>Annual total</span>
            <span style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, color: "var(--teal)", fontSize: "1.1rem" }}>{annualTotal} TYI</span>
          </div>
          <div style={{ marginTop: 10 }}>
            {ngo.impactLines(annualTotal).map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 6, fontSize: "0.78rem", color: "var(--mid-text)", marginBottom: 3 }}>
                <span>{line.icon}</span> <span>{line.text} per year</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {saved ? (
        <div style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1px solid rgba(5,150,105,0.2)", borderRadius: 12, padding: 14, textAlign: "center" }}>
          <div style={{ fontWeight: 700, color: "var(--emerald)", marginBottom: 4 }}>🎉 Plan Saved!</div>
          <div style={{ fontSize: "0.82rem", color: "var(--mid-text)" }}>Your plan is active in My Plans tab. Each donation will be prompted automatically.</div>
        </div>
      ) : (
        <button onClick={handleSave} disabled={!ngoId || !amt || !freq} className="btn-primary" style={{ width: "100%", fontSize: "0.88rem" }}>
          ✦ Activate This Plan
        </button>
      )}
    </div>
  );
}

// ─── My Plans Tab ─────────────────────────────────────────────────────────────

function MyPlans({ onDonateNow }) {
  const [plans, setPlans] = useState(() => JSON.parse(localStorage.getItem("chaincare_plans") || "[]"));

  const removePlan = (id) => {
    const updated = plans.filter(p => p.id !== id);
    localStorage.setItem("chaincare_plans", JSON.stringify(updated));
    setPlans(updated);
  };

  const togglePlan = (id) => {
    const updated = plans.map(p => p.id === id ? { ...p, active: !p.active } : p);
    localStorage.setItem("chaincare_plans", JSON.stringify(updated));
    setPlans(updated);
  };

  if (plans.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <div style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--dark-text)", marginBottom: 8 }}>No plans yet</div>
        <div style={{ fontSize: "0.85rem", color: "var(--warm-gray)" }}>Chat with the AI Advisor to create a personalized donation plan.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {plans.map(plan => {
        const ngo = IMPACT_TABLE[plan.ngoId];
        return (
          <div key={plan.id} className="card" style={{ padding: 20, opacity: plan.active ? 1 : 0.6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{ngo?.icon || "🌍"}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--dark-text)" }}>{plan.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--warm-gray-light)" }}>
                    {plan.amount} TYI · {plan.frequency} · {plan.ngo}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => togglePlan(plan.id)} style={{
                  padding: "4px 10px", borderRadius: 8, fontSize: "0.72rem", fontWeight: 700, cursor: "pointer",
                  border: "1px solid var(--ivory-border)", background: plan.active ? "rgba(13,148,136,0.1)" : "var(--ivory)",
                  color: plan.active ? "var(--teal)" : "var(--warm-gray)"
                }}>{plan.active ? "Active" : "Paused"}</button>
                <button onClick={() => removePlan(plan.id)} style={{
                  padding: "4px 8px", borderRadius: 8, fontSize: "0.72rem", cursor: "pointer",
                  border: "1px solid var(--ivory-border)", background: "var(--ivory)", color: "var(--warm-gray)"
                }}>✕</button>
              </div>
            </div>

            {/* Mini impact preview */}
            {ngo && (
              <div style={{ background: ngo.bg, border: `1px solid ${ngo.border}`, borderRadius: 10, padding: "8px 12px", marginBottom: 12 }}>
                {ngo.impactLines(plan.annualTotal).slice(0, 2).map((line, i) => (
                  <div key={i} style={{ fontSize: "0.78rem", color: "var(--mid-text)", display: "flex", gap: 6, marginBottom: 2 }}>
                    <span>{line.icon}</span><span>{line.text} per year</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--warm-gray-light)" }}>
                Annual: <span style={{ fontWeight: 700, color: "var(--teal)" }}>{plan.annualTotal} TYI</span>
              </div>
              <button onClick={() => onDonateNow?.(plan)} className="btn-primary" style={{ padding: "7px 16px", fontSize: "0.8rem" }}>
                Donate Now →
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main AIAdvisor Page ──────────────────────────────────────────────────────

export default function AIAdvisor() {
  const { account, connectWallet } = useWallet();
  const { refetch } = useDonationStats();
  const { donate, activeStep, lastDonation } = useDonate({ onSuccess: refetch });

  const [tab, setTab] = useState("chat"); // "chat" | "plans"
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hello! I'm your AI Philanthropy Advisor. 🌿\n\nI help you give with purpose — I'll learn what matters to you, predict the real-world impact of your donation, and even set up an autonomous giving plan so you never have to think about it again.\n\nWhat cause is closest to your heart?",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingDonation, setPendingDonation] = useState(null);
  const [suggestedPlan, setSuggestedPlan] = useState(null);
  const [donationStatus, setDonationStatus] = useState(null);
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);
  const [impactPreview, setImpactPreview] = useState(null); // { ngoId, amount }
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, pendingDonation, showPlanBuilder]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);
    setPendingDonation(null);
    setSuggestedPlan(null);
    setDonationStatus(null);
    setShowPlanBuilder(false);
    setImpactPreview(null);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error("Missing VITE_GROQ_API_KEY in .env");

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...newMessages
          ],
          max_tokens: 1000,
        }),
      });
      const data = await res.json();
      const rawText = data.choices?.[0]?.message?.content || "I'm having trouble right now. Please try again.";

      const donationMatch = rawText.match(/\[DONATION_READY\](.*?)(?:\[\/DONATION_READY\]|$)/s);
      const cleanText = rawText.replace(/\[DONATION_READY\].*/s, "").trim();

      setMessages(prev => [...prev, { role: "assistant", content: cleanText }]);

      if (donationMatch) {
        try {
          const parsed = JSON.parse(donationMatch[1]);
          setPendingDonation(parsed);
          setDonationStatus("confirming");
          setImpactPreview({ ngoId: parsed.ngoId, amount: parsed.amount });
          if (parsed.suggestedPlan) setSuggestedPlan(parsed.suggestedPlan);
        } catch { /**/ }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDonate = async () => {
    if (!account) { connectWallet(); return; }
    if (!pendingDonation) return;
    setDonationStatus("donating");
    await donate(pendingDonation.ngo, pendingDonation.amount, pendingDonation.ngoId);
    setDonationStatus("done");
    setMessages(prev => [...prev, {
      role: "assistant",
      content: `🎉 Confirmed! Your ${pendingDonation.amount} TYI donation to **${pendingDonation.ngo}** is live on-chain — your NFT donor badge has been minted.\n\nWould you like to set up a recurring plan so this impact continues automatically each month?`
    }]);
    if (suggestedPlan) setShowPlanBuilder(true);
    setPendingDonation(null);
    setImpactPreview(null);
  };

  const handleCancel = () => {
    setPendingDonation(null);
    setDonationStatus(null);
    setImpactPreview(null);
    setMessages(prev => [...prev, { role: "assistant", content: "No problem! Would you like a different amount, or explore another cause?" }]);
  };

  const handleDonateFromPlan = (plan) => {
    setPendingDonation({ ngo: plan.ngo, amount: plan.amount, ngoId: plan.ngoId });
    setImpactPreview({ ngoId: plan.ngoId, amount: plan.amount });
    setDonationStatus("confirming");
    setTab("chat");
  };

  const ngoForDonation = pendingDonation ? NGO_LIST.find(n => n.id === pendingDonation.ngoId) : null;

  const suggestedPrompts = [
    "I care about ending world hunger 🌾",
    "Help children get educated 📚",
    "I love animals 🐾",
    "Build me a monthly giving plan 📅",
  ];

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "32px 24px" }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, var(--teal), var(--royal))",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            boxShadow: "0 4px 16px var(--shadow-teal)"
          }}>✦</div>
          <div>
            <h1 className="font-display" style={{ fontSize: "1.9rem", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--dark-text)", lineHeight: 1.1 }}>
              AI Philanthropy Advisor
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--warm-gray-light)", marginTop: 2 }}>
              Impact prediction · Autonomous plans · Gasless via UGF
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          <span className="badge badge-teal">✦ Gemini AI</span>
          <span className="badge badge-emerald">📊 Real-world impact</span>
          <span className="badge badge-gold">📅 Autonomous plans</span>
          <span className="badge badge-royal">⚡ Gasless via UGF</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--ivory-dark)", borderRadius: 12, padding: 4, width: "fit-content" }}>
        {[{ id: "chat", label: "✦ AI Advisor" }, { id: "plans", label: "📅 My Plans" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 20px", borderRadius: 9, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
            border: "none", transition: "all 0.2s",
            background: tab === t.id ? "white" : "transparent",
            color: tab === t.id ? "var(--teal)" : "var(--warm-gray)",
            boxShadow: tab === t.id ? "0 2px 8px var(--shadow-warm)" : "none",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Plans tab */}
      {tab === "plans" && (
        <div className="animate-fade-in" style={{ maxWidth: 640 }}>
          <MyPlans onDonateNow={handleDonateFromPlan} />
          <div style={{ marginTop: 20 }}>
            <button onClick={() => setShowPlanBuilder(b => !b)} className="btn-outline" style={{ width: "100%" }}>
              + Create New Plan
            </button>
            {showPlanBuilder && (
              <div style={{ marginTop: 14 }}>
                <PlanBuilder onActivate={() => { setShowPlanBuilder(false); }} onDismiss={() => setShowPlanBuilder(false)} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat tab */}
      {tab === "chat" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

          {/* Chat panel */}
          <div className="card animate-fade-up delay-100" style={{ display: "flex", flexDirection: "column", height: 660 }}>
            {/* Chat header */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--ivory-border)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, #e0f2fe, #f0fdf9)",
                border: "1px solid rgba(13,148,136,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
              }}>🌿</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--dark-text)" }}>ChainCare AI</div>
                <div style={{ fontSize: "0.7rem", color: "var(--emerald)", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--emerald-light)", display: "inline-block" }} />
                  Gemini · Impact Prediction Active
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div className="chat-scroll" style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", gap: 3 }}>
                  {msg.role === "assistant" && (
                    <span style={{ fontSize: "0.68rem", color: "var(--warm-gray-light)", marginLeft: 8 }}>ChainCare AI</span>
                  )}
                  <div className={msg.role === "assistant" ? "chat-bubble-ai" : "chat-bubble-user"}>
                    {msg.content.split("\n").map((line, j) => (
                      <span key={j}>
                        {line.split(/\*\*(.*?)\*\*/).map((part, k) => k % 2 === 1 ? <strong key={k}>{part}</strong> : part)}
                        {j < msg.content.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                  <div className="chat-bubble-ai" style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}

              {/* Impact predictor — shown when donation ready */}
              {impactPreview && donationStatus === "confirming" && (
                <div className="animate-fade-in">
                  <ImpactPredictor ngoId={impactPreview.ngoId} amount={impactPreview.amount} />
                </div>
              )}

              {/* Donation confirmation */}
              {pendingDonation && donationStatus === "confirming" && (
                <div className="animate-fade-in" style={{
                  background: "linear-gradient(135deg, #f0fdf9, #e0f2fe)",
                  border: "1.5px solid rgba(13,148,136,0.25)", borderRadius: 16, padding: 18
                }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--teal-dark)", marginBottom: 10, letterSpacing: "0.05em" }}>
                    ✦ CONFIRM DONATION
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{ngoForDonation?.icon}</span>
                    <div>
                      <div style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "1rem", color: "var(--dark-text)" }}>{pendingDonation.ngo}</div>
                      <div style={{ fontFamily: "DM Mono, monospace", fontSize: "1.2rem", fontWeight: 700, color: "var(--teal)" }}>{pendingDonation.amount} TYI</div>
                    </div>
                  </div>
                  <div style={{ background: "rgba(13,148,136,0.06)", borderRadius: 9, padding: "7px 12px", fontSize: "0.78rem", color: "var(--teal-dark)", marginBottom: 12 }}>
                    ⚡ Gasless · UGF sponsored · NFT badge on confirm
                  </div>
                  {!account ? (
                    <button onClick={connectWallet} className="btn-primary" style={{ width: "100%" }}>Connect Wallet to Donate</button>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={handleConfirmDonate} className="btn-primary" style={{ flex: 1 }}>✓ Confirm</button>
                      <button onClick={handleCancel} className="btn-outline">Cancel</button>
                    </div>
                  )}
                </div>
              )}

              {/* Donating step progress */}
              {donationStatus === "donating" && (
                <div className="animate-fade-in"><StepProgress activeStep={activeStep} /></div>
              )}

              {/* Success */}
              {lastDonation && donationStatus === "done" && (
                <div className="animate-fade-in" style={{
                  background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                  border: "1px solid rgba(5,150,105,0.2)", borderRadius: 14, padding: 16
                }}>
                  <div style={{ fontWeight: 700, color: "var(--emerald)", marginBottom: 4 }}>🎉 On-chain confirmed!</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--mid-text)", marginBottom: 6 }}>
                    {lastDonation.amountTYI} TYI → {lastDonation.ngoName}
                  </div>
                  <a href={`https://sepolia.basescan.org/tx/${lastDonation.txHash}`} target="_blank" rel="noreferrer"
                    style={{ fontSize: "0.78rem", color: "var(--teal)", textDecoration: "underline" }}>
                    View on BaseScan →
                  </a>
                </div>
              )}

              {/* Plan builder after donation success */}
              {showPlanBuilder && donationStatus === "done" && (
                <div className="animate-fade-in">
                  <PlanBuilder
                    suggestedPlan={suggestedPlan}
                    onActivate={(plan) => { setShowPlanBuilder(false); }}
                    onDismiss={() => setShowPlanBuilder(false)}
                  />
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Suggested prompts */}
            {messages.length === 1 && !loading && (
              <div style={{ padding: "0 16px 10px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                {suggestedPrompts.map(p => (
                  <button key={p} onClick={() => sendMessage(p)} style={{
                    background: "var(--ivory)", border: "1px solid var(--ivory-border)", borderRadius: 100,
                    padding: "5px 12px", fontSize: "0.76rem", color: "var(--mid-text)", cursor: "pointer",
                    fontFamily: "DM Sans, sans-serif", transition: "all 0.15s"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--teal)"; e.currentTarget.style.color = "var(--teal)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--ivory-border)"; e.currentTarget.style.color = "var(--mid-text)"; }}>
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: "10px 14px", borderTop: "1px solid var(--ivory-border)", display: "flex", gap: 8 }}>
              <input
                className="input-warm"
                placeholder="Tell me what causes matter to you…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                disabled={loading}
              />
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="btn-primary"
                style={{ padding: "9px 16px", whiteSpace: "nowrap", flexShrink: 0 }}>
                {loading
                  ? <span style={{ display: "inline-block", width: 15, height: 15, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  : "Send →"}
              </button>
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Live impact preview — interactive slider */}
            <div className="card animate-fade-up delay-200" style={{ padding: 20 }}>
              <div style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "1rem", marginBottom: 14, color: "var(--dark-text)" }}>
                📊 Impact Calculator
              </div>
              <ImpactSlider />
            </div>

            {/* How it works */}
            <div className="card animate-fade-up delay-300" style={{ padding: 20 }}>
              <div style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "0.95rem", marginBottom: 14, color: "var(--dark-text)" }}>How It Works</div>
              {[
                { n: "1", t: "Chat", d: "Tell AI what causes matter to you", c: "var(--teal)" },
                { n: "2", t: "See Impact", d: "AI predicts real-world outcomes before you give", c: "var(--royal)" },
                { n: "3", t: "Donate", d: "Gasless via UGF — one click", c: "var(--emerald)" },
                { n: "4", t: "Plan", d: "Activate recurring autonomous donations", c: "var(--gold)" },
              ].map(({ n, t, d, c }) => (
                <div key={n} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: c, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>{n}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--dark-text)" }}>{t}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--warm-gray-light)", marginTop: 1 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Badge tiers */}
            <div className="card animate-fade-up delay-400" style={{ padding: 20 }}>
              <div style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "0.95rem", marginBottom: 12, color: "var(--dark-text)" }}>Badge Tiers</div>
              {[
                { tier: "Bronze", range: "< 50 TYI", emoji: "🥉" },
                { tier: "Silver", range: "50–99 TYI", emoji: "🥈" },
                { tier: "Gold",   range: "100+ TYI",  emoji: "🥇" },
              ].map(({ tier, range, emoji }) => (
                <div key={tier} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--mid-text)" }}>{emoji} {tier}</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--warm-gray-light)" }}>{range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Impact Slider (side panel interactive widget) ────────────────────────────

function ImpactSlider() {
  const [ngoId, setNgoId] = useState("food");
  const [amount, setAmount] = useState(25);
  const ngo = IMPACT_TABLE[ngoId];

  return (
    <div>
      {/* NGO selector */}
      <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
        {NGO_LIST.map(n => (
          <button key={n.id} onClick={() => setNgoId(n.id)} style={{
            padding: "4px 10px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
            border: ngoId === n.id ? `1.5px solid ${n.color}` : "1.5px solid var(--ivory-border)",
            background: ngoId === n.id ? `${n.color}12` : "var(--ivory)",
            color: ngoId === n.id ? n.color : "var(--warm-gray)", transition: "all 0.15s"
          }}>{n.icon} {n.name.split(" ")[0]}</button>
        ))}
      </div>

      {/* Slider */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: "0.75rem", color: "var(--warm-gray)" }}>Amount</span>
          <span style={{ fontFamily: "DM Mono, monospace", fontWeight: 700, color: "var(--teal)", fontSize: "0.9rem" }}>{amount} TYI</span>
        </div>
        <input type="range" min="1" max="250" value={amount} onChange={e => setAmount(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--teal)", cursor: "pointer" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--warm-gray-light)", marginTop: 2 }}>
          <span>1</span><span>250</span>
        </div>
      </div>

      {/* Quick amounts */}
      <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
        {[10, 25, 50, 100].map(q => (
          <button key={q} onClick={() => setAmount(q)} style={{
            flex: 1, padding: "5px 2px", borderRadius: 7, fontSize: "0.72rem", fontWeight: 700,
            border: amount === q ? "1.5px solid var(--teal)" : "1.5px solid var(--ivory-border)",
            background: amount === q ? "rgba(13,148,136,0.1)" : "var(--ivory)",
            color: amount === q ? "var(--teal)" : "var(--warm-gray)", cursor: "pointer"
          }}>{q}</button>
        ))}
      </div>

      {/* Impact lines */}
      {ngo && (
        <div style={{ background: ngo.bg, border: `1px solid ${ngo.border}`, borderRadius: 12, padding: 12 }}>
          {ngo.impactLines(amount).map((line, i) => (
            <div key={i} style={{ display: "flex", gap: 7, fontSize: "0.8rem", color: "var(--mid-text)", marginBottom: i < 2 ? 6 : 0 }}>
              <span style={{ flexShrink: 0 }}>{line.icon}</span>
              <span style={{ fontWeight: 500 }}>{line.text}</span>
            </div>
          ))}
          {/* Progress to next milestone */}
          {(() => {
            const next = ngo.milestones.find(m => m.tyi > amount);
            if (!next) return null;
            return (
              <div style={{ marginTop: 10, fontSize: "0.72rem", color: "var(--warm-gray)", borderTop: `1px solid ${ngo.border}`, paddingTop: 8 }}>
                <span style={{ color: ngo.color, fontWeight: 600 }}>+{next.tyi - amount} TYI</span> to unlock {next.icon} {next.label}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
