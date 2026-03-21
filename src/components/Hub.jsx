import { useState, useEffect } from "react";

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All",
  "Setter Ops",
  "Closer Ops",
  "Executive Ops",
  "Strategy Calls",
  "Sales Mastery Vault",
  "Daily Execution",
];

// ─── STATUS ───────────────────────────────────────────────────────────────────
const STATUS = {
  live:     { label: "LIVE",     color: "#F0A500", bg: "rgba(240,165,0,0.15)",  glow: "rgba(240,165,0,0.5)" },
  beta:     { label: "BETA",     color: "#C0C0C0", bg: "rgba(192,192,192,0.1)", glow: "rgba(192,192,192,0.2)" },
  building: { label: "BUILDING", color: "#B87333", bg: "rgba(184,115,51,0.15)", glow: "rgba(184,115,51,0.3)" },
  planned:  { label: "PLANNED",  color: "#555",    bg: "rgba(70,70,70,0.2)",    glow: "transparent" },
};

// ─── DEFAULT TOOLS ────────────────────────────────────────────────────────────
// Add your Claude artifact share URL to the `url` field on each tool.
// To add a new tool: click + ADD TOOL in the hub.
const DEFAULT_TOOLS = [
  {
    id: "dm-audit",
    name: "DM Audit Engine",
    tagline: "Score setter conversations against the DDBA Playbook v6.0",
    category: "Setter Ops",
    emoji: "🎯",
    status: "live",
    version: "v6.0",
    url: "",
    note: "Paste a transcript → full WIN / FLAG / NOTE callout report scored against the canonical 7-step script",
  },
];

const EMPTY_FORM = {
  name: "", tagline: "", category: "Setter Ops",
  emoji: "🔧", status: "live", version: "v1.0", url: "", note: "",
};

const STORAGE_KEY = "ddba_hub_v1";

// ─── STORAGE ──────────────────────────────────────────────────────────────────
function loadTools() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_TOOLS;
}

function saveTools(tools) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tools)); } catch {}
}

// ─── INPUT STYLE (shared) ─────────────────────────────────────────────────────
const INPUT = {
  width: "100%",
  background: "#050505",
  border: "1px solid #1c1c1c",
  borderRadius: 6,
  padding: "10px 14px",
  fontSize: 13,
  color: "#CCC",
  fontFamily: "'DM Mono', monospace",
  outline: "none",
  boxSizing: "border-box",
  caretColor: "#F0A500",
  transition: "border-color 0.15s",
};

// ─── TOOL CARD ────────────────────────────────────────────────────────────────
function ToolCard({ tool, onEdit, onDelete }) {
  const [hov, setHov] = useState(false);
  const st = STATUS[tool.status] || STATUS.planned;
  const canOpen = tool.status === "live" && !!tool.url;
  const isLive  = tool.status === "live";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14,
        padding: "1.5px",
        background: hov
          ? "linear-gradient(135deg, #F0A500 0%, #7A4F00 30%, #F0A500 60%, #3D2700 80%, #F0A500 100%)"
          : "linear-gradient(135deg, #252525 0%, #111 50%, #1e1e1e 100%)",
        transition: "all 0.3s ease",
        boxShadow: hov
          ? "0 0 40px rgba(240,165,0,0.35), 0 12px 60px rgba(0,0,0,0.9)"
          : "0 6px 30px rgba(0,0,0,0.8)",
      }}
    >
      <div style={{
        borderRadius: 13,
        padding: "24px 26px",
        background: hov
          ? "linear-gradient(160deg, #0e0c08 0%, #0a0900 50%, #0c0b06 100%)"
          : "linear-gradient(160deg, #0f0f0f 0%, #080808 60%, #0d0d0d 100%)",
        display: "flex",
        flexDirection: "column",
        minHeight: 240,
        position: "relative",
        overflow: "hidden",
        transition: "background 0.3s",
      }}>

        {/* Carbon fiber micro-texture */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 13,
          opacity: hov ? 0.06 : 0.04,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)`,
          pointerEvents: "none",
        }} />

        {/* Gold drip top edge on hover */}
        {hov && (
          <div style={{
            position: "absolute", top: 0, left: "10%", right: "10%", height: 2,
            background: "linear-gradient(90deg, transparent, #FFD166, #F0A500, #C47F00, #FFD166, transparent)",
            boxShadow: "0 0 12px rgba(240,165,0,0.8), 0 0 24px rgba(240,165,0,0.4)",
            borderRadius: "0 0 4px 4px",
          }} />
        )}

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg, #1C1800, #2A2200, #1A1600)",
              border: `1px solid ${hov ? "rgba(240,165,0,0.5)" : "rgba(240,165,0,0.2)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
              boxShadow: hov ? "0 0 16px rgba(240,165,0,0.3), inset 0 1px 0 rgba(240,165,0,0.15)" : "inset 0 1px 0 rgba(240,165,0,0.08)",
              transition: "all 0.3s",
            }}>
              {tool.emoji}
            </div>
            <div>
              <div style={{
                fontSize: 18, fontFamily: "'Bebas Neue', 'Anton', 'Impact', sans-serif",
                letterSpacing: "0.08em", lineHeight: 1.1,
                ...(hov
                  ? { background: "linear-gradient(135deg, #FFD166, #F0A500, #C47F00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }
                  : { color: "#E8E4DC" }
                ),
                transition: "all 0.3s",
              }}>
                {tool.name}
              </div>
              <div style={{ fontSize: 9, color: "#666", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
                {tool.category} · {tool.version}
              </div>
            </div>
          </div>

          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.16em",
            color: st.color, background: st.bg,
            padding: "5px 10px", borderRadius: 4, flexShrink: 0,
            border: `1px solid ${st.color}55`,
            fontFamily: "'DM Mono', monospace",
            boxShadow: isLive ? `0 0 12px ${st.glow}` : "none",
          }}>
            {st.label}
          </span>
        </div>

        {/* Gold divider */}
        <div style={{
          height: 1, marginBottom: 16,
          background: hov
            ? "linear-gradient(90deg, rgba(240,165,0,0.6), rgba(240,165,0,0.2), transparent)"
            : "linear-gradient(90deg, rgba(240,165,0,0.15), transparent)",
          transition: "all 0.3s",
        }} />

        {/* Tagline */}
        <div style={{ fontSize: 13, color: "#AAA", lineHeight: 1.7, marginBottom: 12, flex: 1, fontFamily: "'Barlow', sans-serif" }}>
          {tool.tagline}
        </div>

        {/* Note */}
        {tool.note && (
          <div style={{ fontSize: 10, color: "#555", lineHeight: 1.6, marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>
            → {tool.note}
          </div>
        )}

        {/* URL warning */}
        {isLive && !tool.url && (
          <div style={{ fontSize: 9, color: "#B87333", letterSpacing: "0.1em", marginBottom: 14, fontFamily: "'DM Mono', monospace" }}>
            ⚠ &nbsp;PASTE CLAUDE ARTIFACT URL TO ACTIVATE
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
          <button
            onClick={() => canOpen && window.open(tool.url, "_blank")}
            disabled={!canOpen}
            style={{
              flex: 1, padding: "11px 0", fontSize: 12, fontWeight: 700,
              letterSpacing: "0.14em",
              background: canOpen
                ? "linear-gradient(135deg, #F0A500 0%, #C47F00 40%, #F5B000 70%, #A06800 100%)"
                : "#0a0a0a",
              color: canOpen ? "#000" : "#2a2a2a",
              border: canOpen ? "none" : "1px solid #1a1a1a",
              borderRadius: 7,
              cursor: canOpen ? "pointer" : "default",
              fontFamily: "'Bebas Neue', 'Anton', sans-serif",
              boxShadow: canOpen ? "0 0 20px rgba(240,165,0,0.5), 0 4px 12px rgba(0,0,0,0.5)" : "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { if (canOpen) e.target.style.boxShadow = "0 0 36px rgba(240,165,0,0.8), 0 4px 20px rgba(0,0,0,0.5)"; }}
            onMouseLeave={e => { if (canOpen) e.target.style.boxShadow = "0 0 20px rgba(240,165,0,0.5), 0 4px 12px rgba(0,0,0,0.5)"; }}
          >
            {isLive ? (canOpen ? "OPEN TOOL →" : "URL REQUIRED") : tool.status.toUpperCase()}
          </button>

          <button onClick={() => onEdit(tool)}
            style={{ padding: "11px 14px", fontSize: 15, background: "transparent", border: "1px solid #1a1a1a", borderRadius: 7, cursor: "pointer", color: "#444", fontFamily: "inherit", transition: "all 0.15s" }}
            onMouseEnter={e => { e.target.style.borderColor = "#F0A500"; e.target.style.color = "#F0A500"; e.target.style.boxShadow = "0 0 8px rgba(240,165,0,0.3)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#1a1a1a"; e.target.style.color = "#444"; e.target.style.boxShadow = "none"; }}>
            ✎
          </button>

          <button onClick={() => onDelete(tool.id)}
            style={{ padding: "11px 14px", fontSize: 15, background: "transparent", border: "1px solid #1a1a1a", borderRadius: 7, cursor: "pointer", color: "#444", fontFamily: "inherit", transition: "all 0.15s" }}
            onMouseEnter={e => { e.target.style.borderColor = "#cc2200"; e.target.style.color = "#cc2200"; e.target.style.boxShadow = "0 0 8px rgba(200,30,0,0.3)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#1a1a1a"; e.target.style.color = "#444"; e.target.style.boxShadow = "none"; }}>
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ form, setForm, onSave, onClose, isEdit }) {
  const fields = [
    ["name",    "Tool Name",    "DM Audit Engine"],
    ["tagline", "Tagline",      "Score setter conversations against Playbook v6.0"],
    ["url",     "Claude Artifact URL", "https://claude.ai/artifacts/..."],
    ["note",    "Short Note",   "Paste a transcript → scored audit"],
    ["version", "Version",      "v1.0"],
    ["emoji",   "Emoji",        "🎯"],
  ];

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.92)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: 24,
      backdropFilter: "blur(6px)",
    }}>
      <div style={{
        borderRadius: 16, padding: "2px",
        background: "linear-gradient(135deg, #F0A500, #7A4F00, #F0A500, #3D2700)",
        width: "100%", maxWidth: 500,
        boxShadow: "0 0 80px rgba(240,165,0,0.2), 0 32px 80px rgba(0,0,0,0.95)",
      }}>
        <div style={{ background: "linear-gradient(160deg, #0e0c08, #080808)", borderRadius: 14, padding: "32px" }}>

          <div style={{
            fontSize: 26, fontFamily: "'Bebas Neue', 'Anton', sans-serif",
            letterSpacing: "0.1em", marginBottom: 4,
            background: "linear-gradient(135deg, #FFD166, #F0A500, #C47F00)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            {isEdit ? "EDIT TOOL" : "ADD NEW TOOL"}
          </div>

          <div style={{ height: 1, background: "linear-gradient(90deg, #F0A500, rgba(240,165,0,0.2), transparent)", marginBottom: 28 }} />

          {fields.map(([key, label, ph]) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>{label}</div>
              <input
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={ph}
                style={INPUT}
                onFocus={e => e.target.style.borderColor = "rgba(240,165,0,0.5)"}
                onBlur={e  => e.target.style.borderColor = "#1c1c1c"}
              />
            </div>
          ))}

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>Category</div>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              style={{ ...INPUT, appearance: "none" }}
            >
              {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>Status</div>
            <div style={{ display: "flex", gap: 6 }}>
              {Object.entries(STATUS).map(([key, val]) => (
                <button key={key}
                  onClick={() => setForm(f => ({ ...f, status: key }))}
                  style={{
                    flex: 1, padding: "8px 0", fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.1em", borderRadius: 5, cursor: "pointer",
                    fontFamily: "'DM Mono', monospace",
                    border: form.status === key ? `1px solid ${val.color}66` : "1px solid #1a1a1a",
                    background: form.status === key ? val.bg : "transparent",
                    color: form.status === key ? val.color : "#444",
                    boxShadow: form.status === key ? `0 0 10px ${val.glow}` : "none",
                    transition: "all 0.15s",
                  }}>
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onSave}
              style={{
                flex: 1, padding: "13px 0",
                background: "linear-gradient(135deg, #F0A500, #C47F00, #F5B000)",
                color: "#000", fontSize: 14, fontWeight: 700, letterSpacing: "0.14em",
                border: "none", borderRadius: 8, cursor: "pointer",
                fontFamily: "'Bebas Neue', 'Anton', sans-serif",
                boxShadow: "0 0 24px rgba(240,165,0,0.5)",
              }}>
              {isEdit ? "SAVE CHANGES" : "ADD TOOL"}
            </button>
            <button onClick={onClose}
              style={{
                padding: "13px 20px", background: "transparent",
                color: "#555", fontSize: 11,
                border: "1px solid #1a1a1a", borderRadius: 8,
                cursor: "pointer", fontFamily: "'DM Mono', monospace",
              }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HUB ──────────────────────────────────────────────────────────────────────
export default function Hub() {
  const [tools, setTools]         = useState(loadTools);
  const [filter, setFilter]       = useState("All");
  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);

  // Persist
  useEffect(() => { saveTools(tools); }, [tools]);

  // Load fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const openAdd  = () => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); };
  const openEdit = t => { setForm({ ...t }); setEditId(t.id); setShowModal(true); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setTools(t => t.map(x => x.id === editId ? { ...x, ...form } : x));
    } else {
      setTools(t => [...t, { ...form, id: Date.now().toString() }]);
    }
    setShowModal(false);
  };

  const handleDelete = id => {
    if (window.confirm("Remove this tool from the hub?")) {
      setTools(t => t.filter(x => x.id !== id));
    }
  };

  const visible = tools.filter(t => {
    const matchCat    = filter === "All" || t.category === filter;
    const q           = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const liveCount = tools.filter(t => t.status === "live").length;

  const GOLD_GRAD = {
    background: "linear-gradient(135deg, #FFD166 0%, #F0A500 35%, #C47F00 60%, #FFD166 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#040404", color: "#CCC", position: "relative", overflow: "hidden" }}>

      {/* ── FORGED CARBON TEXTURE ── */}
      <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="forged">
            <feTurbulence type="turbulence" baseFrequency="0.55 0.35" numOctaves="6" seed="12" stitchTiles="stitch" result="n"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0.06  0 0 0 0 0.05  0 0 0 0 0.04  0 0 0 28 -12" result="c"/>
            <feBlend in="c" in2="SourceGraphic" mode="multiply"/>
          </filter>
          <filter id="goldflake">
            <feTurbulence type="fractalNoise" baseFrequency="1.2 0.5" numOctaves="3" seed="99" result="g"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0.9  0 0 0 0 0.6  0 0 0 0 0.0  0 0 0 35 -22"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="#030303"/>
        <rect width="100%" height="100%" filter="url(#forged)" fill="#555" opacity="0.9"/>
        <rect width="100%" height="100%" filter="url(#goldflake)" fill="#D4940A" opacity="0.08"/>
      </svg>

      {/* Vignette */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 30%, rgba(30,24,0,0.0) 0%, rgba(0,0,0,0.7) 100%)" }} />

      {/* Gold corona */}
      <div style={{ position: "fixed", top: -300, left: "50%", transform: "translateX(-50%)", width: 1000, height: 600, background: "radial-gradient(ellipse, rgba(240,165,0,0.07) 0%, rgba(200,120,0,0.03) 40%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

      {/* ── CONTENT ── */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* TOP BAR */}
        <div style={{
          borderBottom: "1px solid rgba(240,165,0,0.1)",
          padding: "16px 40px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(2,2,2,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 9, flexShrink: 0,
              background: "linear-gradient(135deg, #FFD166 0%, #F0A500 40%, #8B5500 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 900, color: "#000",
              fontFamily: "'Bebas Neue', sans-serif",
              boxShadow: "0 0 24px rgba(240,165,0,0.6), 0 0 60px rgba(240,165,0,0.2)",
            }}>D</div>
            <div>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.28em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 2 }}>
                Frank DeLuca Brand · Division 2
              </div>
              <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', 'Anton', sans-serif", letterSpacing: "0.1em", lineHeight: 1, filter: "drop-shadow(0 0 8px rgba(240,165,0,0.4))", ...GOLD_GRAD }}>
                DDBA COMMAND CENTER
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ fontSize: 11, color: "#444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>
              <span style={{ color: "#F0A500", fontWeight: 700, textShadow: "0 0 10px rgba(240,165,0,0.5)" }}>{liveCount}</span>
              <span style={{ color: "#333" }}> LIVE &nbsp;·&nbsp; </span>
              <span style={{ color: "#555" }}>{tools.length} TOTAL</span>
            </div>
            <button onClick={openAdd}
              style={{
                padding: "10px 24px",
                background: "linear-gradient(135deg, #F0A500 0%, #C47F00 50%, #F5B000 100%)",
                color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: "0.18em",
                border: "none", borderRadius: 7, cursor: "pointer",
                fontFamily: "'Bebas Neue', 'Anton', sans-serif",
                boxShadow: "0 0 20px rgba(240,165,0,0.4), 0 4px 16px rgba(0,0,0,0.6)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.target.style.boxShadow = "0 0 36px rgba(240,165,0,0.7), 0 4px 20px rgba(0,0,0,0.6)"; e.target.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.target.style.boxShadow = "0 0 20px rgba(240,165,0,0.4), 0 4px 16px rgba(0,0,0,0.6)"; e.target.style.transform = "none"; }}>
              + ADD TOOL
            </button>
          </div>
        </div>

        {/* HERO */}
        <div style={{ padding: "80px 40px 64px", borderBottom: "1px solid rgba(240,165,0,0.06)", position: "relative" }}>
          <div style={{ width: 56, height: 4, background: "linear-gradient(90deg, #FFD166, #F0A500, #8B5500)", borderRadius: 2, marginBottom: 28, boxShadow: "0 0 16px rgba(240,165,0,0.7)" }} />

          <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>
            JP Campbell &nbsp;·&nbsp; Sales Director &nbsp;·&nbsp; Division 2
          </div>

          <div style={{
            fontSize: "clamp(64px, 10vw, 110px)",
            lineHeight: 0.88,
            fontFamily: "'Bebas Neue', 'Anton', 'Impact', sans-serif",
            letterSpacing: "0.03em",
            marginBottom: 28,
            filter: "drop-shadow(0 0 30px rgba(240,165,0,0.25)) drop-shadow(0 8px 40px rgba(0,0,0,0.8))",
            ...GOLD_GRAD,
          }}>
            DDBA AI<br />TOOL STACK
          </div>

          <div style={{ fontSize: 15, color: "#888", maxWidth: 480, lineHeight: 1.75, fontFamily: "'Barlow', sans-serif", fontWeight: 300, letterSpacing: "0.02em" }}>
            Every AI tool built for DDBA Division 2 operations.<br />One hub. Every weapon in the arsenal.
          </div>

          <div style={{ position: "absolute", right: 40, bottom: 32, width: 120, height: 1, background: "linear-gradient(90deg, transparent, rgba(240,165,0,0.3))" }} />
        </div>

        {/* FILTER BAR */}
        <div style={{
          padding: "14px 40px",
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          borderBottom: "1px solid rgba(240,165,0,0.05)",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(8px)",
        }}>
          <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                style={{
                  padding: "6px 16px", fontSize: 10, borderRadius: 5, cursor: "pointer",
                  border: filter === cat ? "1px solid rgba(240,165,0,0.6)" : "1px solid #141414",
                  background: filter === cat ? "rgba(240,165,0,0.12)" : "rgba(4,4,4,0.6)",
                  color: filter === cat ? "#F0A500" : "#666",
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: "0.1em", transition: "all 0.15s",
                  boxShadow: filter === cat ? "0 0 10px rgba(240,165,0,0.25)" : "none",
                }}>
                {cat}
              </button>
            ))}
          </div>
          <input
            placeholder="SEARCH..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...INPUT, width: 190, fontSize: 11, letterSpacing: "0.12em", background: "rgba(2,2,2,0.8)" }}
            onFocus={e => e.target.style.borderColor = "rgba(240,165,0,0.5)"}
            onBlur={e  => e.target.style.borderColor = "#1c1c1c"}
          />
        </div>

        {/* GRID */}
        <div style={{ padding: "36px 40px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {visible.map(tool => (
            <ToolCard key={tool.id} tool={tool} onEdit={openEdit} onDelete={handleDelete} />
          ))}

          {/* Add card */}
          <div
            onClick={openAdd}
            style={{ borderRadius: 14, padding: "1.5px", background: "linear-gradient(135deg, #141414, #0a0a0a)", cursor: "pointer", minHeight: 240, transition: "all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, #F0A500, #7A4F00, #F0A500)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(240,165,0,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, #141414, #0a0a0a)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{
              borderRadius: 13, height: "100%", minHeight: 237,
              background: "#050505",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
            }}>
              <div style={{ fontSize: 32, color: "#222", fontWeight: 300 }}>+</div>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.24em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
                Add New Tool
              </div>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {visible.length === 0 && (
          <div style={{ textAlign: "center", padding: "100px 40px" }}>
            <div style={{ fontSize: 40, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.1em", marginBottom: 10, color: "#333" }}>NO TOOLS FOUND</div>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", color: "#333" }}>Adjust your filter or add a new tool</div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{
          padding: "28px 40px",
          borderTop: "1px solid rgba(240,165,0,0.04)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "rgba(0,0,0,0.6)",
        }}>
          <div style={{ fontSize: 9, color: "#282828", letterSpacing: "0.18em", fontFamily: "'DM Mono', monospace" }}>
            DDBA · DIVISION 2 · DELUCA DESIGNS LLC · 2026
          </div>
          <div style={{ fontSize: 9, color: "#282828", letterSpacing: "0.16em", fontFamily: "'DM Mono', monospace" }}>
            INVENT YOUR FUTURE.
          </div>
        </div>
      </div>

      {showModal && (
        <Modal
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          isEdit={!!editId}
        />
      )}
    </div>
  );
}
