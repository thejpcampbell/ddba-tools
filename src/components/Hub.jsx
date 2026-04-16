import { useState, useEffect } from "react";
import { CATEGORIES, EMPTY_FORM, INPUT_STYLE } from "./hub/constants";
import { loadTools, saveTools } from "./hub/storage";
import ToolCard from "./hub/ToolCard";
import Modal from "./hub/Modal";

const GOLD_GRAD = {
  background: "linear-gradient(135deg, #33CCFF 0%, #00AAFF 30%, #0088DD 65%, #00AAFF 100%)",
  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  filter: "drop-shadow(0 0 20px rgba(0,170,255,0.35))",
};

const NAV_BUTTONS = [
  { label: "⬡ CLOSER LIVE", view: "closer-live", color: "#00FF88", rgba: "0,255,136" },
  { label: "⬡ SETTER LIVE", view: "setter-live", color: "#00AAFF", rgba: "0,170,255" },
];

function injectStyles() {
  if (document.getElementById("ddba-animations")) return;
  const style = document.createElement("style");
  style.id = "ddba-animations";
  style.textContent = `
    @keyframes livePulse {
      0%,100% { box-shadow: 0 0 8px rgba(0,255,65,0.6), 0 0 16px rgba(0,255,65,0.3); }
      50%      { box-shadow: 0 0 16px rgba(0,255,65,0.9), 0 0 32px rgba(0,255,65,0.5), 0 0 48px rgba(0,255,65,0.15); }
    }
    @keyframes orb1 {
      0%,100% { transform: translateX(-50%) scale(1); opacity: 0.6; }
      50%      { transform: translateX(-50%) scale(1.15); opacity: 0.8; }
    }
    @keyframes orb2 {
      0%,100% { transform: scale(1); opacity: 0.3; }
      50%      { transform: scale(1.2); opacity: 0.5; }
    }
    @keyframes scanline {
      0%   { top: -2px; }
      100% { top: 100%; }
    }
    @keyframes gridPulse {
      0%,100% { opacity: 0.03; }
      50%      { opacity: 0.055; }
    }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #111114; }
    ::-webkit-scrollbar-thumb { background: #00AAFF33; border-radius: 2px; }
    ::-webkit-scrollbar-thumb:hover { background: #00AAFF66; }
  `;
  document.head.appendChild(style);

  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

export default function Hub({ onNavigate }) {
  const [tools, setTools]         = useState(loadTools);
  const [filter, setFilter]       = useState("All");
  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);

  useEffect(() => { saveTools(tools); }, [tools]);
  useEffect(() => { injectStyles(); }, []);

  const openAdd  = ()  => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); };
  const openEdit = (t) => { setForm({ ...t }); setEditId(t.id); setShowModal(true); };

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

  return (
    <div style={{ minHeight: "100vh", background: "#111114", color: "#EEEEF2", position: "relative", overflow: "hidden" }}>

      {/* ── BACKGROUND ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(0,170,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,170,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        animation: "gridPulse 4s ease-in-out infinite",
      }} />
      <div style={{ position: "fixed", top: -200, left: "50%", width: 900, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,170,255,0.09) 0%, rgba(255,140,0,0.04) 40%, transparent 70%)", zIndex: 0, pointerEvents: "none", animation: "orb1 6s ease-in-out infinite", transformOrigin: "center" }} />
      <div style={{ position: "fixed", bottom: -300, right: -200, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,140,0,0.06) 0%, transparent 65%)", zIndex: 0, pointerEvents: "none", animation: "orb2 8s ease-in-out infinite" }} />
      <div style={{ position: "fixed", top: "40%", left: -150, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,170,255,0.04) 0%, transparent 65%)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "fixed", left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(0,170,255,0.06) 20%, rgba(0,170,255,0.12) 50%, rgba(0,170,255,0.06) 80%, transparent)", zIndex: 1, pointerEvents: "none", animation: "scanline 8s linear infinite" }} />

      <div style={{ position: "relative", zIndex: 2 }}>

        {/* ── TOP BAR ── */}
        <div style={{
          borderBottom: "1px solid rgba(0,170,255,0.08)",
          padding: "14px 40px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(0,0,0,0.88)",
          backdropFilter: "blur(24px)",
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 1px 0 rgba(0,170,255,0.06), 0 0 40px rgba(0,0,0,0.8)",
        }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 9, flexShrink: 0,
              background: "linear-gradient(135deg, #33CCFF 0%, #00AAFF 40%, #005599 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 900, color: "#fff",
              fontFamily: "'Bebas Neue',sans-serif",
              boxShadow: "0 0 20px rgba(0,170,255,0.7), 0 0 40px rgba(0,170,255,0.3)",
            }}>D</div>
            <div>
              <div style={{ fontSize: 9, color: "#3a3a3a", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginBottom: 2 }}>
                Frank DeLuca Brand · Division 2
              </div>
              <div style={{ fontSize: 22, fontFamily: "'Bebas Neue','Anton',sans-serif", letterSpacing: "0.1em", lineHeight: 1, ...GOLD_GRAD }}>
                DDBA COMMAND CENTER
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", letterSpacing: "0.1em" }}>
              <span style={{ color: "#00FF41", fontWeight: 700, textShadow: "0 0 10px rgba(0,255,65,0.6)" }}>{liveCount}</span>
              <span style={{ color: "#333" }}> LIVE</span>
              <span style={{ color: "#222" }}> · </span>
              <span style={{ color: "#333" }}>{tools.length} TOTAL</span>
            </div>

            {NAV_BUTTONS.map(({ label, view, color, rgba }) => (
              <button key={view}
                onClick={() => onNavigate(view)}
                style={{ padding: "9px 18px", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", background: "transparent", color, border: `1px solid rgba(${rgba},0.3)`, borderRadius: 6, cursor: "pointer", fontFamily: "'DM Mono',monospace", boxShadow: `0 0 12px rgba(${rgba},0.15)`, transition: "all 0.2s" }}
                onMouseEnter={e => { e.target.style.background = `rgba(${rgba},0.08)`; e.target.style.boxShadow = `0 0 20px rgba(${rgba},0.3)`; e.target.style.borderColor = `rgba(${rgba},0.6)`; }}
                onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.boxShadow = `0 0 12px rgba(${rgba},0.15)`; e.target.style.borderColor = `rgba(${rgba},0.3)`; }}>
                {label}
              </button>
            ))}

            <button
              onClick={openAdd}
              style={{ padding: "9px 22px", fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", background: "linear-gradient(135deg, #00AAFF 0%, #0077BB 50%, #00AAFF 100%)", color: "#000", border: "none", borderRadius: 7, cursor: "pointer", fontFamily: "'Bebas Neue','Anton',sans-serif", boxShadow: "0 0 20px rgba(0,170,255,0.45), 0 0 40px rgba(0,170,255,0.15)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.boxShadow = "0 0 36px rgba(0,170,255,0.8), 0 0 60px rgba(0,170,255,0.3)"; e.target.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.target.style.boxShadow = "0 0 20px rgba(0,170,255,0.45), 0 0 40px rgba(0,170,255,0.15)"; e.target.style.transform = "none"; }}>
              + ADD TOOL
            </button>
          </div>
        </div>

        {/* ── HERO ── */}
        <div style={{ padding: "80px 40px 64px", borderBottom: "1px solid rgba(0,170,255,0.05)", position: "relative" }}>
          <div style={{ width: 64, height: 3, background: "linear-gradient(90deg, #33CCFF, #00AAFF, #0088DD)", borderRadius: 2, marginBottom: 28, boxShadow: "0 0 20px rgba(0,170,255,0.8), 0 0 40px rgba(0,170,255,0.4)" }} />
          <div style={{ fontSize: 10, color: "#3a3a3a", letterSpacing: "0.32em", textTransform: "uppercase", marginBottom: 16, fontFamily: "'DM Mono',monospace" }}>
            JP Campbell · Sales Director · Division 2
          </div>
          <div style={{ fontSize: "clamp(64px, 10vw, 112px)", lineHeight: 0.88, fontFamily: "'Bebas Neue','Anton','Impact',sans-serif", letterSpacing: "0.03em", marginBottom: 28, ...GOLD_GRAD }}>
            DDBA AI<br />TOOL STACK
          </div>
          <div style={{ fontSize: 15, color: "#666", maxWidth: 480, lineHeight: 1.8, fontFamily: "'Barlow',sans-serif", fontWeight: 300 }}>
            Every AI tool built for DDBA Division 2 operations.<br />
            One hub. Every weapon in the arsenal.
          </div>
        </div>

        {/* ── FILTERS ── */}
        <div style={{ padding: "12px 40px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", borderBottom: "1px solid rgba(0,170,255,0.04)", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
          <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                style={{
                  padding: "6px 16px", fontSize: 10, borderRadius: 5, cursor: "pointer",
                  border: filter === cat ? "1px solid rgba(0,170,255,0.5)" : "1px solid #111",
                  background: filter === cat ? "rgba(0,170,255,0.08)" : "rgba(0,0,0,0.6)",
                  color: filter === cat ? "#00AAFF" : "#444",
                  fontFamily: "'DM Mono',monospace", letterSpacing: "0.1em",
                  boxShadow: filter === cat ? "0 0 12px rgba(0,170,255,0.25)" : "none",
                  transition: "all 0.15s",
                }}>
                {cat}
              </button>
            ))}
          </div>
          <input
            placeholder="SEARCH..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...INPUT_STYLE, width: 190, fontSize: 11, letterSpacing: "0.12em", background: "rgba(0,0,0,0.8)" }}
            onFocus={e => (e.target.style.borderColor = "rgba(0,170,255,0.5)")}
            onBlur={e  => (e.target.style.borderColor = "#1a1a1a")}
          />
        </div>

        {/* ── GRID ── */}
        <div style={{ padding: "36px 40px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {visible.map(tool => (
            <ToolCard key={tool.id} tool={tool} onEdit={openEdit} onDelete={handleDelete} onNavigate={onNavigate} />
          ))}

          {/* Add card */}
          <div
            onClick={openAdd}
            style={{ borderRadius: 14, padding: "1.5px", background: "linear-gradient(135deg, #111, #0a0a0a)", cursor: "pointer", minHeight: 250, transition: "all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, #00AAFF, #0066AA, #00AAFF)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(0,170,255,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, #111, #0a0a0a)"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ borderRadius: 13, height: "100%", minHeight: 247, background: "#040404", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <div style={{ fontSize: 32, color: "#1a1a1a", fontWeight: 300 }}>+</div>
              <div style={{ fontSize: 9, color: "#282828", letterSpacing: "0.26em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace" }}>Add New Tool</div>
            </div>
          </div>
        </div>

        {visible.length === 0 && (
          <div style={{ textAlign: "center", padding: "100px 40px" }}>
            <div style={{ fontSize: 42, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.1em", color: "#1a1a1a", textShadow: "0 0 30px rgba(0,170,255,0.1)", marginBottom: 10 }}>NO TOOLS FOUND</div>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", letterSpacing: "0.1em", color: "#222" }}>Adjust your filter or add a new tool</div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ padding: "24px 40px", borderTop: "1px solid rgba(0,170,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.7)" }}>
          <div style={{ fontSize: 9, color: "#1e1e1e", letterSpacing: "0.2em", fontFamily: "'DM Mono',monospace" }}>DDBA · DIVISION 2 · DELUCA DESIGNS LLC · 2026</div>
          <div style={{ fontSize: 9, color: "#1e1e1e", letterSpacing: "0.18em", fontFamily: "'DM Mono',monospace" }}>INVENT YOUR FUTURE.</div>
        </div>

      </div>

      {showModal && (
        <Modal form={form} setForm={setForm} onSave={handleSave} onClose={() => setShowModal(false)} isEdit={!!editId} />
      )}
    </div>
  );
}
