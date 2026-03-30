import { useState, useEffect } from "react";

const CATEGORIES = [
  "All","Setter Ops","Closer Ops","Executive Ops",
  "Strategy Calls","Sales Mastery Vault","Daily Execution",
];

const STATUS = {
  live:     { label: "LIVE",     color: "#00FF41", bg: "rgba(0,255,65,0.08)",   glow: "rgba(0,255,65,0.6)" },
  beta:     { label: "BETA",     color: "#00AAFF", bg: "rgba(0,170,255,0.08)",  glow: "rgba(0,170,255,0.3)" },
  building: { label: "BUILDING", color: "#0088DD", bg: "rgba(255,140,0,0.08)",  glow: "rgba(255,140,0,0.3)" },
  planned:  { label: "PLANNED",  color: "#444",    bg: "rgba(60,60,60,0.15)",   glow: "transparent" },
};

const DEFAULT_TOOLS = [
  {
    id: "dm-assist",
    name: "Live DM Assist",
    tagline: "Real-time next-move guidance for active DM conversations",
    category: "Setter Ops",
    emoji: "🚀",
    status: "live",
    version: "v1.0",
    url: "https://claude.ai/public/artifacts/8940ab6e-4904-4310-885f-5326fee1d038",
    note: "Paste the full thread or just the last message → get your next step, 3 copy-ready responses in Frank's voice, and warnings before you make a mistake",
  },
  {
    id: "dm-assist",
    name: "Live DM Assist",
    tagline: "Real-time next-move guidance for active DM conversations",
    category: "Setter Ops",
    emoji: "🚀",
    status: "live",
    version: "v7.0",
    url: "__internal__dm-assist",
    note: "Paste the full thread or just the last message — get your next step, 3 copy-ready responses in Frank's voice, and warnings before you make a mistake.",
    internal: true,
  },
    name: "Setter Live Dashboard",
    tagline: "Live EOD tracker + conversation pipeline for Liz & Chantal",
    category: "Setter Ops",
    emoji: "📊",
    status: "live",
    version: "v1.0",
    url: "__internal__setter-live",
    note: "Live metrics auto-pulled from pipeline. Liz view / Chantal view / JP command view. Push report to ClickUp in one tap.",
    internal: true,
  },
  {
    id: "closer-live",
    name: "Closer Live Dashboard",
    tagline: "JP's closer EOD tracker, pipeline, and KPI scoreboard",
    category: "Closer Ops",
    emoji: "💰",
    status: "live",
    version: "v1.0",
    url: "__internal__closer-live",
    note: "Close Rate, One-Call Close Rate, Show Rate — all live vs. targets. Setter-booked leads auto-feed in. Push EOD report to ClickUp in one tap.",
    internal: true,
  },
];

const EMPTY_FORM = {
  name:"", tagline:"", category:"Setter Ops",
  emoji:"🔧", status:"live", version:"v1.0", url:"", note:"",
};

const STORAGE_KEY = "ddba_hub_v2";

function loadTools() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const hardIds = DEFAULT_TOOLS.map(t => t.id);
      const userAdded = saved.filter(t => !hardIds.includes(t.id));
      return [...DEFAULT_TOOLS, ...userAdded];
    }
  } catch {}
  return DEFAULT_TOOLS;
}

function saveTools(tools) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tools)); } catch {}
}

const INPUT_STYLE = {
  width:"100%", background:"#030303", border:"1px solid #1a1a1a",
  borderRadius:6, padding:"10px 14px", fontSize:13, color:"#EEEEF2",
  fontFamily:"'DM Mono',monospace", outline:"none", boxSizing:"border-box",
  caretColor:"#00AAFF", transition:"border-color 0.2s",
};

// ── TOOL CARD ────────────────────────────────────────────────────────────
function ToolCard({ tool, onEdit, onDelete, onNavigate }) {
  const [hov, setHov] = useState(false);
  const st     = STATUS[tool.status] || STATUS.planned;
  const isLive = tool.status === "live";
  const canOpen= isLive && !!tool.url;

  const handleOpen = () => {
    if (!canOpen) return;
    if (tool.internal && tool.url === "__internal__setter-live") {
      onNavigate("setter-live");
    } else if (tool.internal && tool.url === "__internal__closer-live") {
      onNavigate("closer-live");
    } else if (tool.internal && tool.url === "__internal__dm-assist") {
      onNavigate("dm-assist");
    } else {
      window.open(tool.url, "_blank");
    }
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14,
        padding: "1px",
        background: hov
          ? "linear-gradient(135deg, #00AAFF 0%, #0088DD 30%, #00AAFF 60%, #0066AA 80%, #00AAFF 100%)"
          : "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 50%, #141414 100%)",
        transition: "all 0.3s ease",
        boxShadow: hov
          ? `0 0 0 1px rgba(0,170,255,0.4), 0 0 30px rgba(0,170,255,0.25), 0 0 80px rgba(0,170,255,0.1), 0 20px 60px rgba(0,0,0,0.9)`
          : "0 4px 24px rgba(0,0,0,0.8)",
      }}
    >
      <div style={{
        borderRadius: 13, padding: "26px 28px",
        background: hov
          ? "linear-gradient(160deg, #0b0900 0%, #060500 50%, #0a0800 100%)"
          : "linear-gradient(160deg, #0c0c0c 0%, #070707 60%, #0a0a0a 100%)",
        display: "flex", flexDirection: "column", minHeight: 250,
        position: "relative", overflow: "hidden", transition: "background 0.3s",
      }}>

        {/* Top glow ray on hover */}
        {hov && (
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:1,
            background:"linear-gradient(90deg, transparent 0%, #00AAFF 20%, #0088DD 50%, #00AAFF 80%, transparent 100%)",
            boxShadow:"0 0 20px rgba(0,170,255,0.9), 0 0 40px rgba(0,170,255,0.5), 0 0 80px rgba(0,170,255,0.2)",
          }} />
        )}

        {/* Ambient inner glow */}
        <div style={{
          position:"absolute", top:-60, left:"50%", transform:"translateX(-50%)",
          width:200, height:120,
          background: hov
            ? "radial-gradient(ellipse, rgba(0,170,255,0.08) 0%, transparent 70%)"
            : "radial-gradient(ellipse, rgba(0,170,255,0.02) 0%, transparent 70%)",
          pointerEvents:"none", transition:"all 0.4s",
        }} />

        {/* HEADER */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18, position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            {/* Icon */}
            <div style={{
              width:50, height:50, borderRadius:10, flexShrink:0,
              background: hov
                ? "linear-gradient(135deg, #1f1800, #2e2100, #1a1500)"
                : "linear-gradient(135deg, #121000, #1a1600, #0e0c00)",
              border:`1px solid ${hov ? "rgba(0,170,255,0.5)" : "rgba(0,170,255,0.12)"}`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
              boxShadow: hov ? "0 0 20px rgba(0,170,255,0.35), inset 0 0 10px rgba(0,170,255,0.05)" : "none",
              transition:"all 0.3s",
            }}>
              {tool.emoji}
            </div>

            <div>
              <div style={{
                fontSize:17, lineHeight:1.1, marginBottom:5,
                fontFamily:"'Bebas Neue','Anton','Impact',sans-serif",
                letterSpacing:"0.1em",
                ...(hov
                  ? { background:"linear-gradient(135deg, #33CCFF, #00AAFF, #0088DD, #00AAFF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", filter:"drop-shadow(0 0 8px rgba(0,170,255,0.5))" }
                  : { color:"#E8E4DC" }),
                transition:"all 0.3s",
              }}>
                {tool.name}
              </div>
              <div style={{ fontSize:9, color:"#555", letterSpacing:"0.22em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace" }}>
                {tool.category} · {tool.version}
              </div>
            </div>
          </div>

          {/* Status badge */}
          <span style={{
            fontSize:9, fontWeight:700, letterSpacing:"0.18em",
            color: st.color, background: st.bg,
            padding:"5px 11px", borderRadius:4, flexShrink:0,
            border:`1px solid ${st.color}44`,
            fontFamily:"'DM Mono',monospace",
            boxShadow: isLive ? `0 0 10px ${st.glow}, 0 0 20px ${st.glow.replace('0.6','0.2')}` : "none",
            animation: isLive ? "livePulse 2.5s ease-in-out infinite" : "none",
          }}>
            {isLive && <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:st.color, marginRight:5, verticalAlign:"middle", boxShadow:`0 0 6px ${st.color}` }} />}
            {st.label}
          </span>
        </div>

        {/* Divider */}
        <div style={{
          height:1, marginBottom:16,
          background: hov
            ? "linear-gradient(90deg, rgba(0,170,255,0.5), rgba(255,140,0,0.3), transparent)"
            : "linear-gradient(90deg, rgba(0,170,255,0.1), transparent)",
          transition:"all 0.3s",
        }} />

        <div style={{ fontSize:13, color: hov ? "#BBB" : "#888", lineHeight:1.75, marginBottom:12, flex:1, fontFamily:"'Barlow',sans-serif", transition:"color 0.2s" }}>
          {tool.tagline}
        </div>

        {tool.note && (
          <div style={{ fontSize:10, color:"#3a3a3a", lineHeight:1.6, marginBottom:16, fontFamily:"'DM Mono',monospace" }}>
            → {tool.note}
          </div>
        )}

        <div style={{ display:"flex", gap:8, marginTop:"auto", position:"relative", zIndex:1 }}>
          <button
            onClick={handleOpen}
            disabled={!canOpen}
            style={{
              flex:1, padding:"12px 0", fontSize:12, fontWeight:700, letterSpacing:"0.16em",
              background: canOpen
                ? hov
                  ? "linear-gradient(135deg, #33CCFF 0%, #00AAFF 25%, #0088DD 60%, #00AAFF 100%)"
                  : "linear-gradient(135deg, #00AAFF 0%, #0077BB 50%, #00AAFF 100%)"
                : "#080808",
              color: canOpen ? "#000" : "#1e1e1e",
              border: canOpen ? "none" : "1px solid #111",
              borderRadius:7, cursor: canOpen ? "pointer" : "default",
              fontFamily:"'Bebas Neue','Anton',sans-serif",
              boxShadow: canOpen
                ? hov ? "0 0 40px rgba(0,170,255,0.8), 0 4px 20px rgba(0,170,255,0.4)" : "0 0 20px rgba(0,170,255,0.4)"
                : "none",
              transition:"all 0.2s",
            }}
          >
            {isLive ? (canOpen ? (tool.internal ? "OPEN →" : "OPEN TOOL →") : "URL REQUIRED") : st.label}
          </button>
          <button onClick={() => onEdit(tool)}
            style={{ padding:"12px 14px", fontSize:14, background:"transparent", border:"1px solid #141414", borderRadius:7, cursor:"pointer", color:"#333", transition:"all 0.15s" }}
            onMouseEnter={e => { e.target.style.borderColor="#00AAFF"; e.target.style.color="#00AAFF"; e.target.style.boxShadow="0 0 10px rgba(0,170,255,0.3)"; }}
            onMouseLeave={e => { e.target.style.borderColor="#141414"; e.target.style.color="#333"; e.target.style.boxShadow="none"; }}>✎</button>
          <button onClick={() => onDelete(tool.id)}
            style={{ padding:"12px 14px", fontSize:14, background:"transparent", border:"1px solid #141414", borderRadius:7, cursor:"pointer", color:"#333", transition:"all 0.15s" }}
            onMouseEnter={e => { e.target.style.borderColor="#ff2200"; e.target.style.color="#ff2200"; e.target.style.boxShadow="0 0 10px rgba(255,34,0,0.3)"; }}
            onMouseLeave={e => { e.target.style.borderColor="#141414"; e.target.style.color="#333"; e.target.style.boxShadow="none"; }}>×</button>
        </div>
      </div>
    </div>
  );
}

// ── MODAL ─────────────────────────────────────────────────────────────────
function Modal({ form, setForm, onSave, onClose, isEdit }) {
  const fields = [
    ["name","Tool Name","DM Audit Engine"],
    ["tagline","Tagline","Score setter conversations..."],
    ["url","URL (or __internal__pagename for internal)","https://claude.ai/public/artifacts/..."],
    ["note","Short Note","Paste a transcript → scored audit"],
    ["version","Version","v1.0"],
    ["emoji","Emoji","🎯"],
  ];
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.95)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:24, backdropFilter:"blur(8px)" }}>
      <div style={{ borderRadius:16, padding:"1.5px", background:"linear-gradient(135deg, #00AAFF, #0066AA, #00AAFF, #005599)", width:"100%", maxWidth:500, boxShadow:"0 0 80px rgba(0,170,255,0.2), 0 0 160px rgba(0,170,255,0.08)" }}>
        <div style={{ background:"linear-gradient(160deg, #0c0900, #070600)", borderRadius:14, padding:"32px" }}>
          <div style={{ fontSize:28, fontFamily:"'Bebas Neue','Anton',sans-serif", letterSpacing:"0.12em", marginBottom:4, background:"linear-gradient(135deg, #33CCFF, #00AAFF, #0088DD)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", filter:"drop-shadow(0 0 12px rgba(0,170,255,0.4))" }}>
            {isEdit ? "EDIT TOOL" : "ADD NEW TOOL"}
          </div>
          <div style={{ height:1, background:"linear-gradient(90deg, #00AAFF, rgba(0,170,255,0.3), transparent)", marginBottom:28, boxShadow:"0 0 8px rgba(0,170,255,0.4)" }} />
          {fields.map(([key,label,ph]) => (
            <div key={key} style={{ marginBottom:14 }}>
              <div style={{ fontSize:9, color:"#444", letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:6, fontFamily:"'DM Mono',monospace" }}>{label}</div>
              <input value={form[key]} onChange={e => setForm(f => ({...f,[key]:e.target.value}))} placeholder={ph}
                style={INPUT_STYLE}
                onFocus={e => e.target.style.borderColor="rgba(0,170,255,0.5)"}
                onBlur={e => e.target.style.borderColor="#1a1a1a"} />
            </div>
          ))}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:9, color:"#444", letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:6, fontFamily:"'DM Mono',monospace" }}>Category</div>
            <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} style={{...INPUT_STYLE,appearance:"none"}}>
              {CATEGORIES.filter(c=>c!=="All").map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:9, color:"#444", letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:10, fontFamily:"'DM Mono',monospace" }}>Status</div>
            <div style={{ display:"flex", gap:6 }}>
              {Object.entries(STATUS).map(([key,val]) => (
                <button key={key} onClick={() => setForm(f=>({...f,status:key}))}
                  style={{ flex:1, padding:"8px 0", fontSize:9, fontWeight:700, letterSpacing:"0.1em", borderRadius:5, cursor:"pointer", fontFamily:"'DM Mono',monospace", border:form.status===key ? `1px solid ${val.color}66` : "1px solid #1a1a1a", background:form.status===key ? val.bg : "transparent", color:form.status===key ? val.color : "#333", boxShadow:form.status===key ? `0 0 10px ${val.glow}` : "none", transition:"all 0.15s" }}>
                  {val.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onSave}
              style={{ flex:1, padding:"14px 0", background:"linear-gradient(135deg, #00AAFF, #0077BB, #00AAFF)", color:"#fff", fontSize:14, fontWeight:700, letterSpacing:"0.16em", border:"none", borderRadius:8, cursor:"pointer", fontFamily:"'Bebas Neue','Anton',sans-serif", boxShadow:"0 0 24px rgba(0,170,255,0.5)" }}>
              {isEdit ? "SAVE CHANGES" : "ADD TOOL"}
            </button>
            <button onClick={onClose}
              style={{ padding:"14px 20px", background:"transparent", color:"#444", fontSize:11, border:"1px solid #1a1a1a", borderRadius:8, cursor:"pointer", fontFamily:"'DM Mono',monospace" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HUB ───────────────────────────────────────────────────────────────────
export default function Hub({ onNavigate }) {
  const [tools, setTools]         = useState(loadTools);
  const [filter, setFilter]       = useState("All");
  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);

  useEffect(() => { saveTools(tools); }, [tools]);

  useEffect(() => {
    // Inject keyframes + fonts
    const style = document.createElement("style");
    style.id = "ddba-animations";
    if (!document.getElementById("ddba-animations")) {
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
    }
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const openAdd  = () => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); };
  const openEdit = t  => { setForm({...t}); setEditId(t.id); setShowModal(true); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setTools(t => t.map(x => x.id===editId ? {...x,...form} : x));
    } else {
      setTools(t => [...t, {...form, id:Date.now().toString()}]);
    }
    setShowModal(false);
  };

  const handleDelete = id => {
    if (window.confirm("Remove this tool from the hub?")) {
      setTools(t => t.filter(x => x.id !== id));
    }
  };

  const visible = tools.filter(t => {
    const matchCat    = filter==="All" || t.category===filter;
    const q           = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const liveCount = tools.filter(t => t.status==="live").length;

  const GOLD_GRAD = {
    background:"linear-gradient(135deg, #33CCFF 0%, #00AAFF 30%, #0088DD 65%, #00AAFF 100%)",
    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
    filter:"drop-shadow(0 0 20px rgba(0,170,255,0.35))",
  };

  return (
    <div style={{ minHeight:"100vh", background:"#111114", color:"#EEEEF2", position:"relative", overflow:"hidden" }}>

      {/* ── BACKGROUND LAYER ── */}
      {/* Deep grid */}
      <div style={{
        position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        backgroundImage:`
          linear-gradient(rgba(0,170,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,170,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize:"60px 60px",
        animation:"gridPulse 4s ease-in-out infinite",
      }} />

      {/* Radial orbs */}
      <div style={{ position:"fixed", top:-200, left:"50%", width:900, height:600, borderRadius:"50%", background:"radial-gradient(ellipse, rgba(0,170,255,0.09) 0%, rgba(255,140,0,0.04) 40%, transparent 70%)", zIndex:0, pointerEvents:"none", animation:"orb1 6s ease-in-out infinite", transformOrigin:"center" }} />
      <div style={{ position:"fixed", bottom:-300, right:-200, width:700, height:700, borderRadius:"50%", background:"radial-gradient(ellipse, rgba(255,140,0,0.06) 0%, transparent 65%)", zIndex:0, pointerEvents:"none", animation:"orb2 8s ease-in-out infinite" }} />
      <div style={{ position:"fixed", top:"40%", left:-150, width:400, height:400, borderRadius:"50%", background:"radial-gradient(ellipse, rgba(0,170,255,0.04) 0%, transparent 65%)", zIndex:0, pointerEvents:"none" }} />

      {/* Scanline */}
      <div style={{ position:"fixed", left:0, right:0, height:2, background:"linear-gradient(90deg, transparent, rgba(0,170,255,0.06) 20%, rgba(0,170,255,0.12) 50%, rgba(0,170,255,0.06) 80%, transparent)", zIndex:1, pointerEvents:"none", animation:"scanline 8s linear infinite" }} />

      <div style={{ position:"relative", zIndex:2 }}>

        {/* ── TOP BAR ── */}
        <div style={{
          borderBottom:"1px solid rgba(0,170,255,0.08)",
          padding:"14px 40px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          background:"rgba(0,0,0,0.88)",
          backdropFilter:"blur(24px)",
          position:"sticky", top:0, zIndex:100,
          boxShadow:"0 1px 0 rgba(0,170,255,0.06), 0 0 40px rgba(0,0,0,0.8)",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:18 }}>
            <div style={{
              width:44, height:44, borderRadius:9, flexShrink:0,
              background:"linear-gradient(135deg, #33CCFF 0%, #00AAFF 40%, #005599 100%)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, fontWeight:900, color:"#fff",
              fontFamily:"'Bebas Neue',sans-serif",
              boxShadow:"0 0 20px rgba(0,170,255,0.7), 0 0 40px rgba(0,170,255,0.3)",
            }}>D</div>
            <div>
              <div style={{ fontSize:9, color:"#3a3a3a", letterSpacing:"0.3em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace", marginBottom:2 }}>
                Frank DeLuca Brand · Division 2
              </div>
              <div style={{ fontSize:22, fontFamily:"'Bebas Neue','Anton',sans-serif", letterSpacing:"0.1em", lineHeight:1, ...GOLD_GRAD }}>
                DDBA COMMAND CENTER
              </div>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <div style={{ fontSize:11, fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em" }}>
              <span style={{ color:"#00FF41", fontWeight:700, textShadow:"0 0 10px rgba(0,255,65,0.6)" }}>{liveCount}</span>
              <span style={{ color:"#333" }}> LIVE</span>
              <span style={{ color:"#222" }}> · </span>
              <span style={{ color:"#333" }}>{tools.length} TOTAL</span>
            </div>
            <button
              onClick={() => onNavigate("closer-live")}
              style={{
                padding:"9px 18px", fontSize:11, fontWeight:700, letterSpacing:"0.14em",
                background:"transparent", color:"#00FF88",
                border:"1px solid rgba(0,255,136,0.3)", borderRadius:6, cursor:"pointer",
                fontFamily:"'DM Mono',monospace",
                boxShadow:"0 0 12px rgba(0,255,136,0.15)",
                transition:"all 0.2s",
              }}
              onMouseEnter={e => { e.target.style.background="rgba(0,255,136,0.08)"; e.target.style.boxShadow="0 0 20px rgba(0,255,136,0.3)"; e.target.style.borderColor="rgba(0,255,136,0.6)"; }}
              onMouseLeave={e => { e.target.style.background="transparent"; e.target.style.boxShadow="0 0 12px rgba(0,255,136,0.15)"; e.target.style.borderColor="rgba(0,255,136,0.3)"; }}>
              ⬡ CLOSER LIVE
            </button>
            <button
              onClick={() => onNavigate("setter-live")}
              style={{
                padding:"9px 18px", fontSize:11, fontWeight:700, letterSpacing:"0.14em",
                background:"transparent", color:"#00AAFF",
                border:"1px solid rgba(0,170,255,0.3)", borderRadius:6, cursor:"pointer",
                fontFamily:"'DM Mono',monospace",
                boxShadow:"0 0 12px rgba(0,170,255,0.15)",
                transition:"all 0.2s",
              }}
              onMouseEnter={e => { e.target.style.background="rgba(0,170,255,0.08)"; e.target.style.boxShadow="0 0 20px rgba(0,170,255,0.3)"; e.target.style.borderColor="rgba(0,170,255,0.6)"; }}
              onMouseLeave={e => { e.target.style.background="transparent"; e.target.style.boxShadow="0 0 12px rgba(0,170,255,0.15)"; e.target.style.borderColor="rgba(0,170,255,0.3)"; }}>
              ⬡ SETTER LIVE
            </button>
            <button
              onClick={openAdd}
              style={{
                padding:"9px 22px", fontSize:12, fontWeight:700, letterSpacing:"0.18em",
                background:"linear-gradient(135deg, #00AAFF 0%, #0077BB 50%, #00AAFF 100%)",
                color:"#000", border:"none", borderRadius:7, cursor:"pointer",
                fontFamily:"'Bebas Neue','Anton',sans-serif",
                boxShadow:"0 0 20px rgba(0,170,255,0.45), 0 0 40px rgba(0,170,255,0.15)",
                transition:"all 0.2s",
              }}
              onMouseEnter={e => { e.target.style.boxShadow="0 0 36px rgba(0,170,255,0.8), 0 0 60px rgba(0,170,255,0.3)"; e.target.style.transform="translateY(-1px)"; }}
              onMouseLeave={e => { e.target.style.boxShadow="0 0 20px rgba(0,170,255,0.45), 0 0 40px rgba(0,170,255,0.15)"; e.target.style.transform="none"; }}>
              + ADD TOOL
            </button>
          </div>
        </div>

        {/* ── HERO ── */}
        <div style={{ padding:"80px 40px 64px", borderBottom:"1px solid rgba(0,170,255,0.05)", position:"relative" }}>
          <div style={{ width:64, height:3, background:"linear-gradient(90deg, #33CCFF, #00AAFF, #0088DD)", borderRadius:2, marginBottom:28, boxShadow:"0 0 20px rgba(0,170,255,0.8), 0 0 40px rgba(0,170,255,0.4)" }} />
          <div style={{ fontSize:10, color:"#3a3a3a", letterSpacing:"0.32em", textTransform:"uppercase", marginBottom:16, fontFamily:"'DM Mono',monospace" }}>
            JP Campbell · Sales Director · Division 2
          </div>
          <div style={{
            fontSize:"clamp(64px, 10vw, 112px)", lineHeight:0.88,
            fontFamily:"'Bebas Neue','Anton','Impact',sans-serif",
            letterSpacing:"0.03em", marginBottom:28, ...GOLD_GRAD,
          }}>
            DDBA AI<br />TOOL STACK
          </div>
          <div style={{ fontSize:15, color:"#666", maxWidth:480, lineHeight:1.8, fontFamily:"'Barlow',sans-serif", fontWeight:300 }}>
            Every AI tool built for DDBA Division 2 operations.<br />
            One hub. Every weapon in the arsenal.
          </div>
        </div>

        {/* ── FILTERS ── */}
        <div style={{ padding:"12px 40px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", borderBottom:"1px solid rgba(0,170,255,0.04)", background:"rgba(0,0,0,0.6)", backdropFilter:"blur(12px)" }}>
          <div style={{ display:"flex", gap:6, flex:1, flexWrap:"wrap" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                style={{
                  padding:"6px 16px", fontSize:10, borderRadius:5, cursor:"pointer",
                  border:filter===cat ? "1px solid rgba(0,170,255,0.5)" : "1px solid #111",
                  background:filter===cat ? "rgba(0,170,255,0.08)" : "rgba(0,0,0,0.6)",
                  color:filter===cat ? "#00AAFF" : "#444",
                  fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em",
                  boxShadow:filter===cat ? "0 0 12px rgba(0,170,255,0.25)" : "none",
                  transition:"all 0.15s",
                }}>
                {cat}
              </button>
            ))}
          </div>
          <input placeholder="SEARCH..." value={search} onChange={e => setSearch(e.target.value)}
            style={{...INPUT_STYLE, width:190, fontSize:11, letterSpacing:"0.12em", background:"rgba(0,0,0,0.8)"}}
            onFocus={e => e.target.style.borderColor="rgba(0,170,255,0.5)"}
            onBlur={e  => e.target.style.borderColor="#1a1a1a"} />
        </div>

        {/* ── GRID ── */}
        <div style={{ padding:"36px 40px", display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", gap:20 }}>
          {visible.map(tool => (
            <ToolCard key={tool.id} tool={tool} onEdit={openEdit} onDelete={handleDelete} onNavigate={onNavigate} />
          ))}

          {/* Add card */}
          <div
            onClick={openAdd}
            style={{ borderRadius:14, padding:"1.5px", background:"linear-gradient(135deg, #111, #0a0a0a)", cursor:"pointer", minHeight:250, transition:"all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.background="linear-gradient(135deg, #00AAFF, #0066AA, #00AAFF)"; e.currentTarget.style.boxShadow="0 0 30px rgba(0,170,255,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="linear-gradient(135deg, #111, #0a0a0a)"; e.currentTarget.style.boxShadow="none"; }}>
            <div style={{ borderRadius:13, height:"100%", minHeight:247, background:"#040404", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14 }}>
              <div style={{ fontSize:32, color:"#1a1a1a", fontWeight:300 }}>+</div>
              <div style={{ fontSize:9, color:"#282828", letterSpacing:"0.26em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace" }}>Add New Tool</div>
            </div>
          </div>
        </div>

        {visible.length === 0 && (
          <div style={{ textAlign:"center", padding:"100px 40px" }}>
            <div style={{ fontSize:42, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.1em", color:"#1a1a1a", textShadow:"0 0 30px rgba(0,170,255,0.1)", marginBottom:10 }}>NO TOOLS FOUND</div>
            <div style={{ fontSize:11, fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", color:"#222" }}>Adjust your filter or add a new tool</div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ padding:"24px 40px", borderTop:"1px solid rgba(0,170,255,0.04)", display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(0,0,0,0.7)" }}>
          <div style={{ fontSize:9, color:"#1e1e1e", letterSpacing:"0.2em", fontFamily:"'DM Mono',monospace" }}>DDBA · DIVISION 2 · DELUCA DESIGNS LLC · 2026</div>
          <div style={{ fontSize:9, color:"#1e1e1e", letterSpacing:"0.18em", fontFamily:"'DM Mono',monospace" }}>INVENT YOUR FUTURE.</div>
        </div>

      </div>

      {showModal && <Modal form={form} setForm={setForm} onSave={handleSave} onClose={() => setShowModal(false)} isEdit={!!editId} />}
    </div>
  );
}
