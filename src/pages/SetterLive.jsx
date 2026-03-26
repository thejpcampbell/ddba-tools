import { useState, useEffect, useRef, useCallback } from "react";
import { feedCloserPipeline } from "../shared/pipelineUtils.js";
import { BarChart, LineChart, ChartCard, buildRange, Sparkline } from "../shared/Charts.jsx";

// ── CONSTANTS ────────────────────────────────────────────────────────────
const REPS    = ["Liz", "Chantal"];
const TODAY   = new Date().toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"});
const TODAY_D = new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});

// TRUE NEON color system — no pastels
const C = {
  gold:        "#FFD700",
  goldGlow:    "rgba(255,215,0,0.8)",
  goldDim:     "rgba(255,215,0,0.12)",
  goldBorder:  "rgba(255,215,0,0.35)",
  green:       "#00FF88",
  greenGlow:   "rgba(0,255,136,0.8)",
  greenDim:    "rgba(0,255,136,0.10)",
  greenBorder: "rgba(0,255,136,0.35)",
  red:         "#FF4444",
  redGlow:     "rgba(255,68,68,0.8)",
  redDim:      "rgba(255,68,68,0.10)",
  redBorder:   "rgba(255,68,68,0.35)",
  purple:      "#CC99FF",
  purpleGlow:  "rgba(204,153,255,0.8)",
  purpleDim:   "rgba(204,153,255,0.10)",
  purpleBorder:"rgba(204,153,255,0.35)",
  blue:        "#44AAFF",
  orange:      "#FF9944",
  t1:  "#F5F5F5",
  t2:  "#BEBEBE",
  t3:  "#909090",
  t4:  "#585858",
  bg:  "#000000",
  s1:  "#0D0D0D",
  s2:  "#141414",
  s3:  "#1E1E1E",
  border:   "#2A2A2A",
  borderHi: "#484848",
};

const STAGES = [
  { key:"new",    label:"New DM",       color:C.t3      },
  { key:"opener", label:"Opener Sent",  color:C.blue    },
  { key:"pain",   label:"Pain",         color:C.orange  },
  { key:"link",   label:"Link Sent",    color:C.purple  },
  { key:"booked", label:"Booked",       color:C.green   },
  { key:"disq",   label:"Disq'd",       color:C.red     },
];
const SM = {};
STAGES.forEach(s => SM[s.key] = s);

// ── API ───────────────────────────────────────────────────────────────────
async function apiGet(key) {
  try {
    const r = await fetch(`/api/setter?key=${encodeURIComponent(key)}`);
    if (!r.ok) throw new Error();
    return (await r.json()).value ?? null;
  } catch {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }
}
async function apiSet(key, value) {
  try {
    await fetch("/api/setter", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ key, value }),
    });
  } catch {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
}

// ── GLOBAL STYLES ─────────────────────────────────────────────────────────
function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById("sl-styles")) return;
    const s = document.createElement("style");
    s.id = "sl-styles";
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
      @keyframes liveDot {
        0%,100%{ box-shadow:0 0 5px 2px rgba(0,255,136,0.9),0 0 12px rgba(0,255,136,0.5); }
        50%    { box-shadow:0 0 9px 4px rgba(0,255,136,1),0 0 22px rgba(0,255,136,0.7); }
      }
      @keyframes scanline { 0%{top:-2px} 100%{top:100%} }
      @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      input[type=number]::-webkit-inner-spin-button,
      input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
      input[type=number]{ -moz-appearance:textfield; }
      ::-webkit-scrollbar{ width:4px; }
      ::-webkit-scrollbar-track{ background:#000; }
      ::-webkit-scrollbar-thumb{ background:#FFD70040; border-radius:2px; }
      ::-webkit-scrollbar-thumb:hover{ background:#FFD70080; }
    `;
    document.head.appendChild(s);
  }, []);
}

// ── TALLY ─────────────────────────────────────────────────────────────────
function Tally({ value, onChange, color = C.gold }) {
  return (
    <div style={{ display:"flex", height:60, borderRadius:6, overflow:"hidden", border:`1.5px solid ${C.border}` }}>
      <button onClick={() => onChange(Math.max(0,value-1))}
        style={{ width:50, flexShrink:0, background:C.s1, border:"none", color:C.t4, fontSize:26, cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", transition:"all 0.1s" }}
        onMouseEnter={e=>{e.target.style.background="#180000";e.target.style.color=C.red;e.target.style.textShadow=`0 0 10px ${C.redGlow}`;}}
        onMouseLeave={e=>{e.target.style.background=C.s1;e.target.style.color=C.t4;e.target.style.textShadow="none";}}>−</button>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, borderLeft:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}` }}>
        <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, fontWeight:900, lineHeight:1, color, textShadow:`0 0 14px ${color}, 0 0 28px ${color}66` }}>{value}</span>
      </div>
      <button onClick={() => onChange(value+1)}
        style={{ width:50, flexShrink:0, background:C.s1, border:"none", color:C.t4, fontSize:26, cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", transition:"all 0.1s" }}
        onMouseEnter={e=>{e.target.style.background="#001808";e.target.style.color=C.green;e.target.style.textShadow=`0 0 10px ${C.greenGlow}`;}}
        onMouseLeave={e=>{e.target.style.background=C.s1;e.target.style.color=C.t4;e.target.style.textShadow="none";}}>+</button>
    </div>
  );
}

// ── METRIC TILE — FIXED LAYOUT (no overlap) ───────────────────────────────
// Layout: top row = [LABEL] [badge] [−][+][↺?]  all inline, no absolute
function Tile({ label, value, color, sub, isOverride, onMinus, onPlus, onReset }) {
  const [hov, setHov] = useState(false);
  const col = color || C.gold;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.s1,
        border: `1.5px solid ${isOverride ? C.goldBorder : hov ? C.borderHi : C.border}`,
        borderRadius: 8,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "all 0.15s",
        boxShadow: isOverride ? `0 0 18px ${C.goldDim}, inset 0 0 16px rgba(255,215,0,0.03)` : "none",
      }}>

      {/* TOP ROW: label | badge | controls — all inline, no absolute */}
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:C.t2, flex:1, whiteSpace:"nowrap" }}>
          {label}
        </span>

        {/* Badge */}
        <span style={{
          fontFamily:"'DM Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase",
          padding:"3px 8px", borderRadius:3, flexShrink:0,
          background: isOverride ? C.goldDim : C.greenDim,
          color: isOverride ? C.gold : C.green,
          border: `1px solid ${isOverride ? C.goldBorder : C.greenBorder}`,
          textShadow: isOverride ? `0 0 8px ${C.goldGlow}` : `0 0 8px ${C.greenGlow}`,
        }}>{isOverride ? "EDITED" : "AUTO"}</span>

        {/* Override controls — always in flow, visible on hover */}
        <div style={{ display:"flex", gap:3, opacity: hov ? 1 : 0, transition:"opacity 0.15s", flexShrink:0 }}>
          <button onClick={onMinus}
            style={{ width:24, height:24, borderRadius:3, border:`1px solid ${C.border}`, background:C.s2, color:C.t4, cursor:"pointer", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.1s", lineHeight:1 }}
            onMouseEnter={e=>{e.target.style.background="#200000";e.target.style.color=C.red;e.target.style.borderColor=C.redBorder;}}
            onMouseLeave={e=>{e.target.style.background=C.s2;e.target.style.color=C.t4;e.target.style.borderColor=C.border;}}>−</button>
          <button onClick={onPlus}
            style={{ width:24, height:24, borderRadius:3, border:`1px solid ${C.border}`, background:C.s2, color:C.t4, cursor:"pointer", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.1s", lineHeight:1 }}
            onMouseEnter={e=>{e.target.style.background="#002010";e.target.style.color=C.green;e.target.style.borderColor=C.greenBorder;}}
            onMouseLeave={e=>{e.target.style.background=C.s2;e.target.style.color=C.t4;e.target.style.borderColor=C.border;}}>+</button>
          {isOverride && (
            <button onClick={onReset} title="Reset to auto"
              style={{ width:24, height:24, borderRadius:3, border:`1px solid ${C.goldBorder}`, background:C.goldDim, color:C.gold, cursor:"pointer", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", textShadow:`0 0 8px ${C.goldGlow}` }}>↺</button>
          )}
        </div>
      </div>

      {/* BIG NUMBER */}
      <div style={{
        fontFamily:"'Bebas Neue',sans-serif",
        fontSize: 60,
        fontWeight: 900,
        lineHeight: 1,
        color: col,
        letterSpacing: "-0.02em",
        textShadow: `0 0 18px ${col}, 0 0 36px ${col}55`,
      }}>
        {value ?? "—"}
      </div>

      {sub && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:C.t3, letterSpacing:"0.12em", textTransform:"uppercase" }}>{sub}</div>}
    </div>
  );
}

// ── FUNNEL BAR ────────────────────────────────────────────────────────────
function FunnelBar({ pipeline }) {
  const today = pipeline.filter(l => l.date === TODAY);
  const total = Math.max(today.length, 1);
  return (
    <div style={{ display:"flex", background:C.s1, borderRadius:8, overflow:"hidden", border:`1.5px solid ${C.border}` }}>
      {STAGES.map(s => {
        const n = today.filter(l => l.stage===s.key).length;
        return (
          <div key={s.key} style={{ flex:1, padding:"12px 10px", borderRight:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.t3, marginBottom:5 }}>{s.label}</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, fontWeight:900, lineHeight:1, color:s.color, textShadow:`0 0 10px ${s.color}88, 0 0 20px ${s.color}44` }}>{n}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:s.color, opacity:0.7, marginTop:3 }}>
              {today.length > 0 ? Math.round((n/total)*100)+"%" : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color:C.t3, whiteSpace:"nowrap" }}>{children}</span>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${C.border},transparent)` }} />
    </div>
  );
}

function NbCard({ label, children, gold }) {
  return (
    <div style={{ background: gold ? "rgba(255,215,0,0.05)" : C.s1, border:`1.5px solid ${gold ? C.goldBorder : C.border}`, borderRadius:8, padding:"15px 18px", display:"flex", flexDirection:"column", gap:8, boxShadow: gold ? `0 0 20px rgba(255,215,0,0.05), inset 0 0 20px rgba(255,215,0,0.02)` : "none" }}>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color: gold ? C.gold : C.t3, textShadow: gold ? `0 0 8px ${C.goldGlow}` : "none" }}>{label}</span>
      {children}
    </div>
  );
}

const NBI = { background:"transparent", border:"none", color:C.t1, fontFamily:"'Barlow',sans-serif", fontSize:15, fontWeight:500, width:"100%", outline:"none", padding:0 };
const NBTA = { ...NBI, resize:"none", minHeight:74, lineHeight:1.65 };

// ── QUALIFIED LEAD FORMAT MODAL ────────────────────────────────────────────
function QualifiedLeadModal({ lead, rep, onClose }) {
  const [extra, setExtra] = useState({ name:"", phone:"", email:"", closer:"", datetime:"" });
  const [copied, setCopied] = useState(false);

  const format = () => {
    const n = extra.name || lead.handle;
    return [
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `DDBA // QUALIFIED LEAD FORMAT`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Name:             ${n}`,
      `Insta handle:     ${lead.handle}`,
      `Initial contact:  ${lead.date}`,
      `KW:               ${lead.kw || "—"}`,
      `DM Setter:        ${rep}`,
      `Closer:           ${extra.closer || "—"}`,
      `Phone:            ${extra.phone || "—"}`,
      `Email:            ${extra.email || "—"}`,
      ``,
      `${extra.datetime || "[Date/Time]"} w/${extra.closer || "[Closer Name]"}`,
      ``,
      `Notes: ${lead.notes || "—"}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ].join("\n");
  };

  const copy = () => {
    navigator.clipboard.writeText(format()).then(() => {
      setCopied(true);
      setTimeout(()=>setCopied(false),2000);
    }).catch(()=>{});
    // Auto-feed booked lead into closer pipeline
    feedCloserPipeline({
      date:       lead.date,
      handle:     lead.handle,
      name:       extra.name || lead.handle,
      setterName: rep,
      notes:      lead.notes || "",
      kw:         lead.kw || "",
    });
  };

  const FI = { background:C.s2, border:`1.5px solid ${C.border}`, borderRadius:5, padding:"10px 13px", fontSize:14, color:C.t1, fontFamily:"'Barlow',sans-serif", width:"100%", outline:"none", boxSizing:"border-box", transition:"border-color 0.15s" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.97)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:24, backdropFilter:"blur(10px)" }}>
      <div style={{ background:C.s1, border:`2px solid ${C.greenBorder}`, borderRadius:10, maxWidth:580, width:"100%", maxHeight:"92vh", overflowY:"auto", boxShadow:`0 0 40px rgba(0,255,136,0.12)`, animation:"fadeIn 0.2s ease" }}>

        {/* Header */}
        <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:"0.12em", color:C.green, textShadow:`0 0 16px ${C.greenGlow}` }}>
              DROP TO CLOSER PIPELINE
            </div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:C.t3, letterSpacing:"0.12em", marginTop:2 }}>
              Qualified Lead Format — {lead.handle}
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.t3, fontSize:22, cursor:"pointer" }}>✕</button>
        </div>

        {/* Pre-filled fields */}
        <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:C.s2, border:`1px solid ${C.border}`, borderRadius:6, padding:"12px 14px" }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:"0.18em", color:C.t3, textTransform:"uppercase", marginBottom:8 }}>Auto-filled from Pipeline</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[["Handle",lead.handle],["Initial Contact",lead.date],["KW",lead.kw||"—"],["DM Setter",rep]].map(([k,v]) => (
                <div key={k}>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:C.t4, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:3 }}>{k}</div>
                  <div style={{ fontFamily:"'Barlow',sans-serif", fontSize:14, color:C.t2, fontWeight:500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height:1, background:`linear-gradient(90deg,${C.border},transparent)` }} />

          {/* Fields setter fills in */}
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.18em", color:C.t3, textTransform:"uppercase" }}>
            Complete Before Dropping ↓
          </div>

          {[["name","Full Name / Insta Name",""],["closer","Closer Name","JP Campbell"],["datetime","Date/Time of Call","e.g. Wed 3/26 @ 2:00 PM ET"],["phone","Phone",""],["email","Email",""]].map(([k,lbl,ph]) => (
            <div key={k}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.16em", color:C.t3, textTransform:"uppercase", marginBottom:6 }}>{lbl}</div>
              <input value={extra[k]} onChange={e=>setExtra(p=>({...p,[k]:e.target.value}))} placeholder={ph||`Enter ${lbl.toLowerCase()}...`}
                style={FI} onFocus={e=>e.target.style.borderColor=C.goldBorder} onBlur={e=>e.target.style.borderColor=C.border} />
            </div>
          ))}

          {/* Preview */}
          <div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.18em", color:C.t3, textTransform:"uppercase", marginBottom:8 }}>Preview</div>
            <pre style={{ fontFamily:"'DM Mono',monospace", fontSize:12, lineHeight:1.9, color:C.t2, background:C.bg, padding:16, borderRadius:6, border:`1px solid ${C.border}`, whiteSpace:"pre-wrap", margin:0 }}>
              {format()}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:"16px 24px", borderTop:`1px solid ${C.border}`, display:"flex", gap:10 }}>
          <button onClick={copy}
            style={{ flex:1, padding:"14px 0", fontFamily:"'Bebas Neue',sans-serif", fontSize:16, letterSpacing:"0.14em", background: copied ? `linear-gradient(135deg,${C.green},#00CC66)` : `linear-gradient(135deg,${C.green},#00AA55)`, color:"#000", border:"none", borderRadius:5, cursor:"pointer", transition:"all 0.2s", boxShadow:`0 0 24px ${C.greenGlow}` }}>
            {copied ? "COPIED ✓" : "COPY TO CLIPBOARD"}
          </button>
          <button onClick={onClose}
            style={{ padding:"14px 20px", fontFamily:"'Bebas Neue',sans-serif", fontSize:14, letterSpacing:"0.12em", background:"transparent", border:`2px solid ${C.border}`, color:C.t3, borderRadius:5, cursor:"pointer" }}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SETTER VIEW (EOD) ─────────────────────────────────────────────────────
function SetterView({ rep }) {
  const eodKey      = `setter:${rep.toLowerCase()}:eod:${TODAY}`;
  const pipelineKey = `setter:${rep.toLowerCase()}:pipeline`;

  const [pipeline,  setPipeline]  = useState([]);
  const [overrides, setOverrides] = useState({ inbound:null,qualified:null,disq:null,links:null,booked:null });
  const [followups, setFollowups] = useState(0);
  const [nb,        setNb]        = useState({ kw:"",kwBlocks:"",kwLinks:"",rt1:"",rt2:"",noReason:"",oneFix:"" });
  const [loaded,    setLoaded]    = useState(false);
  const [syncTime,  setSyncTime]  = useState(null);
  const [reportTxt, setReportTxt] = useState("");
  const [showReport,setShowReport]= useState(false);

  // Load
  useEffect(() => {
    Promise.all([apiGet(eodKey), apiGet(pipelineKey)]).then(([eod,pipe]) => {
      if (eod) {
        setOverrides(eod.overrides||{inbound:null,qualified:null,disq:null,links:null,booked:null});
        setFollowups(eod.followups||0);
        setNb(eod.nb||{kw:"",kwBlocks:"",kwLinks:"",rt1:"",rt2:"",noReason:"",oneFix:""});
      }
      if (pipe) setPipeline(pipe);
      setLoaded(true);
      setSyncTime(new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}));
    });
  }, [rep]);

  // Visibility sync
  useEffect(() => {
    const fn = () => { if (!document.hidden) apiGet(pipelineKey).then(p=>{ if(p){setPipeline(p); setSyncTime(new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}));} }); };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [rep]);

  // Auto-save
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => apiSet(eodKey, { overrides, followups, nb }), 700);
    return () => clearTimeout(t);
  }, [nb, overrides, followups, loaded]);

  // Auto values
  const todayLeads = pipeline.filter(l => l.date===TODAY);
  const auto = {
    inbound:   todayLeads.length,
    qualified: todayLeads.filter(l=>l.stage!=="disq").length,
    disq:      todayLeads.filter(l=>l.stage==="disq").length,
    links:     todayLeads.filter(l=>l.stage==="link"||l.stage==="booked").length,
    booked:    todayLeads.filter(l=>l.stage==="booked").length,
  };
  const eff = k => overrides[k]!==null ? overrides[k] : auto[k];
  const ovr = (k,d) => setOverrides(p=>({...p,[k]:Math.max(0,(p[k]!==null?p[k]:auto[k])+d)}));
  const rst = k  => setOverrides(p=>({...p,[k]:null}));

  const links  = eff("links")||0;
  const booked = eff("booked")||0;
  const conv   = links>0 ? Math.round((booked/links)*100)+"%" : "—";
  const rt1    = parseFloat(nb.rt1);
  const rtColor = isNaN(rt1)?C.t4 : rt1<=5?C.green : rt1<=10?C.gold : C.red;
  const rtLabel = isNaN(rt1)?"—" : rt1<=5?"ON TARGET ✓" : rt1<=10?"WATCH IT ⚠" : "CRITICAL MISS ✗";

  // Biggest leak
  const fo = ["new","opener","pain","link","booked"];
  let leakTxt="Add leads to identify drop-off", maxD=-1;
  for(let i=0;i<fo.length-1;i++){
    const a=todayLeads.filter(l=>l.stage===fo[i]).length, b=todayLeads.filter(l=>l.stage===fo[i+1]).length;
    if(a>0 && a-b>maxD){ maxD=a-b; leakTxt=`${SM[fo[i]].label} → ${SM[fo[i+1]].label}  (${a-b} drop${a-b!==1?"s":""})`; }
  }

  const pushReport = () => {
    const g = k => (nb[k]||"—").trim()||"—";
    setReportTxt([
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `DDBA // SETTER EOD REPORT`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Date:       ${TODAY}`,`DM Setter:  ${rep}`,``,
      `━━ KEYWORDS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Active KWs:         ${g("kw")}`,
      `Most Blocks:        ${g("kwBlocks")}`,
      `Most Booking Links: ${g("kwLinks")}`,``,
      `━━ VOLUME ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Inbound DMs:        ${eff("inbound")}`,
      `Qualified:          ${eff("qualified")}`,
      `Disqualified:       ${eff("disq")}`,
      `Follow-ups Sent:    ${followups}`,``,
      `━━ BOOKING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Booking Links Sent: ${eff("links")}`,
      `Calls Booked:       ${eff("booked")}`,
      `Link → Book Rate:   ${conv}`,
      `#1 Reason Not Booked: ${g("noReason")}`,``,
      `━━ RESPONSE TIMES ━━━━━━━━━━━━━━━━━━━━━━`,
      `Avg First Response: ${isNaN(rt1)?"—":rt1+" min"} — ${rtLabel}`,
      `Avg Convo Response: ${g("rt2")} min`,``,
      `━━ ONE FIX FOR TOMORROW ━━━━━━━━━━━━━━━━`,
      g("oneFix"),
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ].join("\n"));
    setShowReport(true);
  };

  const resetDay = () => {
    setOverrides({inbound:null,qualified:null,disq:null,links:null,booked:null});
    setFollowups(0);
    setNb({kw:"",kwBlocks:"",kwLinks:"",rt1:"",rt2:"",noReason:"",oneFix:""});
    apiSet(eodKey, null);
  };

  if (!loaded) return <div style={{padding:80,textAlign:"center",fontFamily:"'DM Mono',monospace",fontSize:12,color:C.t4,letterSpacing:"0.16em"}}>SYNCING...</div>;

  const G3 = { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 };
  const G2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 };

  return (
    <div style={{maxWidth:980,margin:"0 auto",padding:"28px 24px"}}>

      {/* Sync bar */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24,fontFamily:"'DM Mono',monospace",fontSize:11,color:C.t3,letterSpacing:"0.1em"}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:C.green,flexShrink:0,animation:"liveDot 2s ease-in-out infinite"}} />
        <span style={{color:C.t2}}>LIVE</span>
        <span style={{color:C.t4}}>— SYNCED FROM PIPELINE</span>
        {syncTime && <span style={{marginLeft:"auto",color:C.t4}}>Last sync: {syncTime}</span>}
      </div>

      {/* Funnel */}
      <SectionLabel>Pipeline Funnel — Today</SectionLabel>
      <div style={{marginBottom:10}}><FunnelBar pipeline={pipeline} /></div>

      {/* Leak */}
      <div style={{marginBottom:28,padding:"9px 16px",background:C.s1,border:`1px solid ${C.redBorder}`,borderRadius:6,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.16em",color:C.t3,textTransform:"uppercase",flexShrink:0}}>Biggest Leak:</span>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:700,color:C.red,textShadow:`0 0 10px ${C.redGlow}`}}>{leakTxt}</span>
      </div>

      {/* Metrics */}
      <SectionLabel>Live Metrics — Auto-Pulled from Pipeline</SectionLabel>
      <div style={{...G3,marginBottom:12}}>
        <Tile label="Inbound DMs"  value={eff("inbound")}   color={C.gold}   sub="TOTAL TODAY"    isOverride={overrides.inbound!==null}   onMinus={()=>ovr("inbound",-1)}   onPlus={()=>ovr("inbound",1)}   onReset={()=>rst("inbound")} />
        <Tile label="Qualified"    value={eff("qualified")} color={C.green}  sub="ACTIVE CONVOS"  isOverride={overrides.qualified!==null} onMinus={()=>ovr("qualified",-1)} onPlus={()=>ovr("qualified",1)} onReset={()=>rst("qualified")} />
        <Tile label="Disqualified" value={eff("disq")}      color={C.red}    sub="MARKED DEAD"    isOverride={overrides.disq!==null}      onMinus={()=>ovr("disq",-1)}      onPlus={()=>ovr("disq",1)}      onReset={()=>rst("disq")} />
      </div>
      <div style={{...G3,marginBottom:28}}>
        <Tile label="Links Sent"   value={eff("links")}     color={C.purple} sub="BOOKING LINKS"  isOverride={overrides.links!==null}     onMinus={()=>ovr("links",-1)}     onPlus={()=>ovr("links",1)}     onReset={()=>rst("links")} />
        <Tile label="Calls Booked" value={eff("booked")}    color={C.green}  sub="PRIMARY OUTPUT" isOverride={overrides.booked!==null}    onMinus={()=>ovr("booked",-1)}    onPlus={()=>ovr("booked",1)}    onReset={()=>rst("booked")} />
        <div style={{background:C.s1,border:`1.5px solid ${C.border}`,borderRadius:8,padding:"16px 18px",display:"flex",flexDirection:"column",gap:10}}>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",color:C.t2}}>Link → Book Rate</span>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:60,fontWeight:900,lineHeight:1,color:links===0?C.t4:booked/links>=0.5?C.green:booked/links>=0.25?C.gold:C.red,textShadow:links===0?"none":"0 0 18px currentColor,0 0 36px currentColor55"}}>{conv}</span>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.t3,letterSpacing:"0.12em",textTransform:"uppercase"}}>CALCULATED LIVE</span>
        </div>
      </div>

      {/* Notebook */}
      <SectionLabel>Manual Fields — Notebook</SectionLabel>
      <div style={{...G2,marginBottom:12}}>
        <NbCard label="Active Keywords Today"><input style={NBI} value={nb.kw} onChange={e=>setNb(p=>({...p,kw:e.target.value}))} placeholder="List all active KWs..." /></NbCard>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <NbCard label="KW → Most Blocks"><input style={NBI} value={nb.kwBlocks} onChange={e=>setNb(p=>({...p,kwBlocks:e.target.value}))} placeholder="Which KW?" /></NbCard>
          <NbCard label="KW → Most Links"><input style={NBI} value={nb.kwLinks} onChange={e=>setNb(p=>({...p,kwLinks:e.target.value}))} placeholder="Which KW?" /></NbCard>
        </div>
      </div>
      <div style={{...G3,marginBottom:12}}>
        <NbCard label="Follow-ups Sent"><Tally value={followups} onChange={setFollowups} color={C.gold} /></NbCard>
        <NbCard label="Avg First Response">
          <div style={{display:"flex",alignItems:"baseline",gap:8,marginTop:2}}>
            <input type="number" style={{...NBI,fontFamily:"'Bebas Neue',sans-serif",fontSize:48,fontWeight:900,width:80,color:rtColor,textShadow:`0 0 12px ${rtColor}88`}} value={nb.rt1} onChange={e=>setNb(p=>({...p,rt1:e.target.value}))} placeholder="0" min="0" />
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:C.t3}}>MIN</span>
          </div>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.12em",color:rtColor,textTransform:"uppercase",textShadow:`0 0 8px ${rtColor}77`}}>{rtLabel}</span>
        </NbCard>
        <NbCard label="Avg Convo Response">
          <div style={{display:"flex",alignItems:"baseline",gap:8,marginTop:2}}>
            <input type="number" style={{...NBI,fontFamily:"'Bebas Neue',sans-serif",fontSize:48,fontWeight:900,width:80,color:C.t1}} value={nb.rt2} onChange={e=>setNb(p=>({...p,rt2:e.target.value}))} placeholder="0" min="0" />
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:C.t3}}>MIN</span>
          </div>
        </NbCard>
      </div>
      <div style={{marginBottom:12}}>
        <NbCard label="#1 Reason Prospects Didn't Book Today"><input style={NBI} value={nb.noReason} onChange={e=>setNb(p=>({...p,noReason:e.target.value}))} placeholder="What was the actual pattern? Be specific." /></NbCard>
      </div>
      <div style={{marginBottom:28}}>
        <NbCard label="⚡ One Fix for Tomorrow" gold>
          <textarea style={{...NBTA,fontSize:15}} value={nb.oneFix} onChange={e=>setNb(p=>({...p,oneFix:e.target.value}))} placeholder="What specifically did not work today — and what specifically changes tomorrow? Not a placeholder. Something real." />
        </NbCard>
      </div>

      {/* Actions */}
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        <button onClick={pushReport}
          style={{flex:2,minWidth:200,padding:"18px 0",fontFamily:"'Bebas Neue',sans-serif",fontSize:20,fontWeight:900,letterSpacing:"0.18em",background:`linear-gradient(135deg,#FFE566,${C.gold},#CC8800,${C.gold})`,color:"#000",border:"none",borderRadius:6,cursor:"pointer",boxShadow:`0 0 28px ${C.goldGlow},0 0 56px rgba(255,215,0,0.25)`,transition:"all 0.2s"}}
          onMouseEnter={e=>{e.target.style.boxShadow=`0 0 48px ${C.goldGlow},0 0 90px rgba(255,215,0,0.4)`;e.target.style.transform="translateY(-2px)";}}
          onMouseLeave={e=>{e.target.style.boxShadow=`0 0 28px ${C.goldGlow},0 0 56px rgba(255,215,0,0.25)`;e.target.style.transform="none";}}>
          ⬆ PUSH REPORT
        </button>
        <button style={{flex:1,minWidth:110,padding:"18px 0",fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:"0.14em",background:"transparent",border:`2px solid ${C.border}`,color:C.t2,borderRadius:6,cursor:"pointer",transition:"all 0.15s"}}
          onMouseEnter={e=>{e.target.style.borderColor=C.borderHi;e.target.style.color=C.t1;}}
          onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.t2;}}>
          SAVE DRAFT
        </button>
        <button onClick={()=>{if(window.confirm("Reset today? Pipeline data not affected.")) resetDay();}}
          style={{flex:1,minWidth:110,padding:"18px 0",fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:"0.14em",background:"transparent",border:`2px solid ${C.redBorder}`,color:C.red,borderRadius:6,cursor:"pointer",transition:"all 0.15s",textShadow:`0 0 8px ${C.redGlow}`}}
          onMouseEnter={e=>{e.target.style.background=C.redDim;}} onMouseLeave={e=>{e.target.style.background="transparent";}}>
          RESET DAY
        </button>
      </div>

      {/* Report modal */}
      {showReport && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(8px)"}}>
          <div style={{background:C.s1,border:`2px solid ${C.border}`,borderRadius:10,maxWidth:640,width:"100%",maxHeight:"88vh",display:"flex",flexDirection:"column",animation:"fadeIn 0.2s ease"}}>
            <div style={{padding:"20px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,fontWeight:800,letterSpacing:"0.12em",color:C.gold,textShadow:`0 0 16px ${C.goldGlow}`}}>EOD REPORT — READY TO PUSH</span>
              <button onClick={()=>setShowReport(false)} style={{background:"none",border:"none",color:C.t3,fontSize:22,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:"20px 24px",overflowY:"auto",flex:1}}>
              <pre style={{fontFamily:"'DM Mono',monospace",fontSize:12,lineHeight:2,color:C.t2,whiteSpace:"pre-wrap",background:C.bg,padding:18,borderRadius:6,border:`1px solid ${C.border}`,margin:0}}>{reportTxt}</pre>
            </div>
            <div style={{padding:"16px 24px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10}}>
              <button onClick={()=>navigator.clipboard.writeText(reportTxt).catch(()=>{})}
                style={{flex:1,padding:"13px 0",fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:"0.14em",background:`linear-gradient(135deg,${C.gold},#CC8800)`,color:"#000",border:"none",borderRadius:5,cursor:"pointer",boxShadow:`0 0 20px ${C.goldGlow}`}}>
                COPY TO CLIPBOARD
              </button>
              <button onClick={()=>{navigator.clipboard.writeText(reportTxt).catch(()=>{}); setShowReport(false); resetDay();}}
                style={{flex:1,padding:"13px 0",fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:"0.14em",background:"transparent",border:`2px solid ${C.redBorder}`,color:C.red,borderRadius:5,cursor:"pointer",textShadow:`0 0 8px ${C.redGlow}`}}>
                COPY + RESET DAY
              </button>
              <button onClick={()=>setShowReport(false)}
                style={{padding:"13px 16px",fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:"0.12em",background:"transparent",border:`2px solid ${C.border}`,color:C.t3,borderRadius:5,cursor:"pointer"}}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── JP COMMAND VIEW ───────────────────────────────────────────────────────
function JPView() {
  const [eods,  setEods]  = useState({Liz:{},Chantal:{}});
  const [pipes, setPipes] = useState({Liz:[],Chantal:[]});

  const refresh = useCallback(() => {
    Promise.all(REPS.flatMap(r=>[apiGet(`setter:${r.toLowerCase()}:eod:${TODAY}`),apiGet(`setter:${r.toLowerCase()}:pipeline`)])).then(([le,lp,ce,cp])=>{
      setEods({Liz:le||{},Chantal:ce||{}});
      setPipes({Liz:lp||[],Chantal:cp||[]});
    });
  },[]);

  useEffect(()=>{ refresh(); const iv=setInterval(refresh,30000); return()=>clearInterval(iv); },[]);

  const getEff = (rep,k) => {
    const o=(eods[rep]?.overrides||{})[k];
    const p=(pipes[rep]||[]).filter(l=>l.date===TODAY);
    const a={inbound:p.length,qualified:p.filter(l=>l.stage!=="disq").length,disq:p.filter(l=>l.stage==="disq").length,links:p.filter(l=>l.stage==="link"||l.stage==="booked").length,booked:p.filter(l=>l.stage==="booked").length};
    return o!==null&&o!==undefined?o:(a[k]||0);
  };

  const MX=[{key:"inbound",label:"Inbound",color:C.gold},{key:"qualified",label:"Qual'd",color:C.green},{key:"links",label:"Links",color:C.purple},{key:"booked",label:"Booked",color:C.green},{key:"disq",label:"Disq'd",color:C.red}];

  return (
    <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 24px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28,fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.1em"}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:C.green,animation:"liveDot 2s ease-in-out infinite",flexShrink:0}} />
        <span style={{color:C.t2}}>JP COMMAND VIEW</span>
        <span style={{color:C.t4}}>— AUTO-REFRESHES EVERY 30s</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        {REPS.map(rep=>{
          const lk=getEff(rep,"links"),bk=getEff(rep,"booked");
          const cr=lk>0?Math.round((bk/lk)*100)+"%":"—";
          const cc=lk===0?C.t4:bk/lk>=0.5?C.green:bk/lk>=0.25?C.gold:C.red;
          return (
            <div key={rep}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <div style={{width:9,height:9,borderRadius:"50%",background:C.green,animation:"liveDot 2s ease-in-out infinite",flexShrink:0}} />
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:30,fontWeight:900,letterSpacing:"0.1em",color:C.gold,textShadow:`0 0 14px ${C.goldGlow},0 0 28px rgba(255,215,0,0.35)`}}>{rep.toUpperCase()}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                {MX.map(m=>(
                  <div key={m.key} style={{background:C.s1,border:`1.5px solid ${C.border}`,borderRadius:7,padding:"12px 14px"}}>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,fontWeight:700,letterSpacing:"0.16em",color:C.t3,textTransform:"uppercase",marginBottom:5}}>{m.label}</div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:38,fontWeight:900,lineHeight:1,color:m.color,textShadow:`0 0 12px ${m.color}88`}}>{getEff(rep,m.key)}</div>
                  </div>
                ))}
                <div style={{background:C.s1,border:`1.5px solid ${C.border}`,borderRadius:7,padding:"12px 14px"}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,fontWeight:700,letterSpacing:"0.16em",color:C.t3,textTransform:"uppercase",marginBottom:5}}>Link→Book</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:38,fontWeight:900,lineHeight:1,color:cc,textShadow:lk>0?`0 0 12px ${cc}88`:"none"}}>{cr}</div>
                </div>
              </div>
              <div style={{background:C.s1,border:`1.5px solid ${C.border}`,borderRadius:7,overflow:"hidden",marginBottom:12}}>
                <div style={{display:"flex"}}>
                  {STAGES.map(s=>{
                    const n=(pipes[rep]||[]).filter(l=>l.date===TODAY&&l.stage===s.key).length;
                    return(
                      <div key={s.key} style={{flex:1,padding:"10px 8px",borderRight:`1px solid ${C.border}`}}>
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:C.t3,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{s.label}</div>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,fontWeight:900,color:s.color,textShadow:`0 0 8px ${s.color}66`}}>{n}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {eods[rep]?.nb?.oneFix&&(
                <div style={{background:"rgba(255,215,0,0.04)",border:`1px solid ${C.goldBorder}`,borderRadius:7,padding:"12px 14px"}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.gold,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6,textShadow:`0 0 8px ${C.goldGlow}`}}>⚡ One Fix for Tomorrow</div>
                  <div style={{fontFamily:"'Barlow',sans-serif",fontSize:13,color:C.t2,lineHeight:1.6}}>{eods[rep].nb.oneFix}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PIPELINE PANEL ────────────────────────────────────────────────────────
function PipelinePanel({ rep }) {
  const pipelineKey = `setter:${rep.toLowerCase()}:pipeline`;
  const [leads,    setLeads]    = useState([]);
  const [showAdd,  setShowAdd]  = useState(false);
  const [form,     setForm]     = useState({ date:TODAY, handle:"", kw:"", stage:"new", notes:"", disqual:"" });
  const [editId,   setEditId]   = useState(null);
  const [filter,   setFilter]   = useState(null);
  const [errHandle,setErrHandle]= useState(false);
  const [errDisq,  setErrDisq]  = useState(false);
  const [closer,   setCloser]   = useState(null); // lead to drop to closer

  // Use a ref to always have current leads in async callbacks — fixes stale closure bug
  const leadsRef = useRef([]);
  useEffect(() => { leadsRef.current = leads; }, [leads]);

  useEffect(() => { apiGet(pipelineKey).then(p => { if (p) { setLeads(p); leadsRef.current = p; } }); }, [rep]);

  const persist = next => { apiSet(pipelineKey, next); };

  // FIX: use leadsRef.current inside save to avoid stale closure
  const save = () => {
    if (!form.handle.trim()) { setErrHandle(true); return; }
    if (form.stage === "disq" && !form.disqual.trim()) { setErrDisq(true); return; }
    setErrHandle(false);
    setErrDisq(false);

    const current = leadsRef.current;
    const next = editId !== null
      ? current.map(l => l.id === editId ? { ...l, ...form } : l)
      : [...current, { ...form, id: Date.now() }];

    setLeads(next);
    leadsRef.current = next;
    persist(next);
    setShowAdd(false);
    setEditId(null);
    setForm({ date:TODAY, handle:"", kw:"", stage:"new", notes:"", disqual:"" });
  };

  const del = id => {
    if (!window.confirm("Remove this conversation?")) return;
    const next = leadsRef.current.filter(l => l.id !== id);
    setLeads(next);
    leadsRef.current = next;
    persist(next);
  };

  const startEdit = l => { setForm({...l}); setEditId(l.id); setErrHandle(false); setErrDisq(false); setShowAdd(true); };
  const openAdd   = () => { setForm({date:TODAY,handle:"",kw:"",stage:"new",notes:"",disqual:""}); setEditId(null); setErrHandle(false); setErrDisq(false); setShowAdd(true); };

  const visible = leads.filter(l => !filter || l.stage===filter).sort((a,b)=>b.id-a.id);

  const pill = key => {
    const s = SM[key]||SM["new"];
    return <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"3px 9px",borderRadius:3,background:`${s.color}16`,color:s.color,border:`1px solid ${s.color}44`,whiteSpace:"nowrap",textShadow:`0 0 6px ${s.color}88`}}>{s.label}</span>;
  };

  const FI = { background:C.s2, border:`1.5px solid ${C.border}`, borderRadius:5, padding:"10px 13px", fontSize:14, color:C.t1, fontFamily:"'Barlow',sans-serif", width:"100%", outline:"none", boxSizing:"border-box", transition:"border-color 0.15s" };

  return (
    <div style={{padding:"0 24px 28px",maxWidth:980,margin:"0 auto"}}>

      {/* Toolbar */}
      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:16}}>
        <button onClick={openAdd}
          style={{padding:"10px 22px",fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:"0.14em",background:`linear-gradient(135deg,${C.gold},#CC8800)`,color:"#000",border:"none",borderRadius:5,cursor:"pointer",boxShadow:`0 0 16px ${C.goldGlow}`}}>
          + ADD CONVERSATION
        </button>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginLeft:"auto"}}>
          {[null,...STAGES.map(s=>s.key)].map(k=>{
            const s=k?SM[k]:null, active=filter===k;
            return(
              <button key={k||"all"} onClick={()=>setFilter(k)}
                style={{padding:"6px 13px",fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",borderRadius:4,cursor:"pointer",background:active?(k?`${s.color}14`:C.goldDim):"transparent",color:active?(k?s.color:C.gold):C.t3,border:`1px solid ${active?(k?s.color+"44":C.goldBorder):C.border}`,boxShadow:active?`0 0 8px ${k?s.color+"66":C.goldGlow}`:"none",transition:"all 0.1s"}}>
                {k?s.label:"ALL"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{overflowX:"auto",background:C.s1,border:`1.5px solid ${C.border}`,borderRadius:8}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`}}>
              {["Date","Handle","Keyword","Stage","Notes","Disqual Reason","Actions"].map(h=>(
                <th key={h} style={{padding:"12px 14px",fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",color:C.t3,textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(l=>(
              <tr key={l.id} style={{borderBottom:`1px solid ${C.s3}`,transition:"background 0.1s"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.s2}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"11px 14px",fontFamily:"'DM Mono',monospace",fontSize:12,color:C.t3,whiteSpace:"nowrap"}}>{l.date}</td>
                <td style={{padding:"11px 14px",fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:"0.08em",color:C.t1,whiteSpace:"nowrap"}}>{l.handle}</td>
                <td style={{padding:"11px 14px",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.t3}}>{l.kw||"—"}</td>
                <td style={{padding:"11px 14px"}}>{pill(l.stage)}</td>
                <td style={{padding:"11px 14px",fontSize:13,color:C.t3,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.notes||"—"}</td>
                <td style={{padding:"11px 14px",fontSize:13,color:l.stage==="disq"?C.red:C.t4}}>{l.disqual||"—"}</td>
                <td style={{padding:"11px 14px",whiteSpace:"nowrap",display:"flex",gap:6,alignItems:"center"}}>
                  <button onClick={()=>startEdit(l)}
                    style={{background:"none",border:`1px solid ${C.border}`,borderRadius:4,padding:"4px 10px",color:C.t3,cursor:"pointer",fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em",transition:"all 0.1s"}}
                    onMouseEnter={e=>{e.target.style.borderColor=C.gold;e.target.style.color=C.gold;}}
                    onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.t3;}}>EDIT</button>

                  {/* DROP TO CLOSER — only shows on booked leads */}
                  {l.stage==="booked" && (
                    <button onClick={()=>setCloser(l)}
                      style={{background:C.greenDim,border:`1px solid ${C.greenBorder}`,borderRadius:4,padding:"4px 11px",color:C.green,cursor:"pointer",fontSize:11,fontFamily:"'DM Mono',monospace",fontWeight:700,letterSpacing:"0.08em",textShadow:`0 0 8px ${C.greenGlow}`,boxShadow:`0 0 8px ${C.greenDim}`,transition:"all 0.1s"}}
                      onMouseEnter={e=>{e.target.style.background="rgba(0,255,136,0.18)";e.target.style.boxShadow=`0 0 16px ${C.greenGlow}`;}}
                      onMouseLeave={e=>{e.target.style.background=C.greenDim;e.target.style.boxShadow=`0 0 8px ${C.greenDim}`;}}>
                      DROP →
                    </button>
                  )}

                  <button onClick={()=>del(l.id)}
                    style={{background:"none",border:`1px solid ${C.redBorder}`,borderRadius:4,padding:"4px 10px",color:C.red,cursor:"pointer",fontSize:11,fontFamily:"'DM Mono',monospace",transition:"all 0.1s"}}
                    onMouseEnter={e=>{e.target.style.background=C.redDim;}}
                    onMouseLeave={e=>{e.target.style.background="none";}}>✕</button>
                </td>
              </tr>
            ))}
            {visible.length===0&&(
              <tr><td colSpan={7} style={{padding:"48px 14px",textAlign:"center",fontFamily:"'DM Mono',monospace",fontSize:12,color:C.t4,letterSpacing:"0.14em"}}>
                NO CONVERSATIONS — HIT + ADD TO LOG YOUR FIRST INBOUND DM
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD/EDIT MODAL */}
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(8px)"}}>
          <div style={{background:C.s1,border:`2px solid ${C.border}`,borderRadius:10,maxWidth:520,width:"100%",maxHeight:"92vh",overflowY:"auto",animation:"fadeIn 0.2s ease"}}>
            <div style={{padding:"20px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:"0.12em",color:C.gold,textShadow:`0 0 14px ${C.goldGlow}`}}>
                {editId!==null?"EDIT CONVERSATION":"NEW CONVERSATION"}
              </span>
              <button onClick={()=>{setShowAdd(false);setEditId(null);}} style={{background:"none",border:"none",color:C.t3,fontSize:20,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>

              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:errHandle?C.red:C.t3,textTransform:"uppercase",marginBottom:6}}>Date</div>
                <input value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} placeholder="MM/DD/YYYY" style={FI}
                  onFocus={e=>e.target.style.borderColor=C.goldBorder} onBlur={e=>e.target.style.borderColor=C.border} />
              </div>

              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:errHandle?C.red:C.t3,textTransform:"uppercase",marginBottom:6}}>
                  Instagram Handle <span style={{color:C.red}}>*</span>
                </div>
                <input value={form.handle} onChange={e=>{setForm(p=>({...p,handle:e.target.value}));setErrHandle(false);}} placeholder="@username"
                  style={{...FI,borderColor:errHandle?C.redBorder:C.border}}
                  onFocus={e=>e.target.style.borderColor=errHandle?C.redBorder:C.goldBorder} onBlur={e=>e.target.style.borderColor=errHandle?C.redBorder:C.border} />
                {errHandle&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.red,marginTop:5,textShadow:`0 0 8px ${C.redGlow}`}}>Handle is required.</div>}
              </div>

              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:C.t3,textTransform:"uppercase",marginBottom:6}}>Lead Keyword</div>
                <input value={form.kw} onChange={e=>setForm(p=>({...p,kw:e.target.value}))} placeholder="Which keyword triggered this DM?" style={FI}
                  onFocus={e=>e.target.style.borderColor=C.goldBorder} onBlur={e=>e.target.style.borderColor=C.border} />
              </div>

              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:C.t3,textTransform:"uppercase",marginBottom:8}}>Stage</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {STAGES.map(s=>(
                    <button key={s.key} onClick={()=>setForm(p=>({...p,stage:s.key,disqual:s.key!=="disq"?p.disqual:p.disqual}))}
                      style={{padding:"11px 8px",fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",borderRadius:5,cursor:"pointer",textAlign:"center",background:form.stage===s.key?`${s.color}16`:"transparent",color:form.stage===s.key?s.color:C.t3,border:`2px solid ${form.stage===s.key?s.color:C.border}`,transition:"all 0.12s",boxShadow:form.stage===s.key?`0 0 12px ${s.color}66`:"none",textShadow:form.stage===s.key?`0 0 8px ${s.color}88`:"none"}}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disqual reason — always rendered, shown/hidden via height */}
              <div style={{overflow:"hidden",maxHeight:form.stage==="disq"?"120px":"0",transition:"max-height 0.2s ease",opacity:form.stage==="disq"?1:0}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:errDisq?C.red:C.t3,textTransform:"uppercase",marginBottom:6}}>
                  Disqualification Reason <span style={{color:C.red}}>*</span>
                </div>
                <input value={form.disqual} onChange={e=>{setForm(p=>({...p,disqual:e.target.value}));setErrDisq(false);}} placeholder="What specifically disqualified this prospect?"
                  style={{...FI,borderColor:errDisq?C.redBorder:C.border}}
                  onFocus={e=>e.target.style.borderColor=C.goldBorder} onBlur={e=>e.target.style.borderColor=errDisq?C.redBorder:C.border} />
                {errDisq&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.red,marginTop:5}}>Required before marking dead.</div>}
              </div>

              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:C.t3,textTransform:"uppercase",marginBottom:6}}>Notes / Observations</div>
                <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Objections, vibe, follow-up context..."
                  style={{...FI,minHeight:64,resize:"vertical",lineHeight:1.6}} />
              </div>
            </div>

            <div style={{padding:"16px 24px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10}}>
              <button onClick={save}
                style={{flex:1,padding:"14px 0",fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:"0.14em",background:`linear-gradient(135deg,${C.gold},#CC8800)`,color:"#000",border:"none",borderRadius:5,cursor:"pointer",boxShadow:`0 0 20px ${C.goldGlow}`}}>
                SAVE
              </button>
              <button onClick={()=>{setShowAdd(false);setEditId(null);}}
                style={{padding:"14px 18px",fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:"0.12em",background:"transparent",border:`2px solid ${C.border}`,color:C.t3,borderRadius:5,cursor:"pointer"}}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUALIFIED LEAD FORMAT MODAL */}
      {closer && <QualifiedLeadModal lead={closer} rep={rep} onClose={()=>setCloser(null)} />}
    </div>
  );
}

// ── ROLE PICKER ───────────────────────────────────────────────────────────
function RolePicker({ onPick, onBack }) {
  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:48,padding:32,position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",inset:0,backgroundImage:`linear-gradient(rgba(255,215,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,215,0,0.03) 1px,transparent 1px)`,backgroundSize:"60px 60px",pointerEvents:"none"}} />
      <div style={{position:"fixed",top:-200,left:"50%",transform:"translateX(-50%)",width:800,height:600,background:`radial-gradient(ellipse,rgba(255,215,0,0.1) 0%,transparent 65%)`,pointerEvents:"none"}} />
      <div style={{position:"fixed",left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${C.goldDim} 20%,rgba(255,215,0,0.08) 50%,${C.goldDim} 80%,transparent)`,animation:"scanline 7s linear infinite",pointerEvents:"none"}} />

      <div style={{position:"relative",zIndex:2,textAlign:"center"}}>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.32em",color:C.t4,textTransform:"uppercase",marginBottom:14}}>DDBA · DIVISION 2 · SETTER LIVE</div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(56px,11vw,96px)",fontWeight:900,lineHeight:0.9,letterSpacing:"0.04em",background:`linear-gradient(135deg,#FFE566 0%,${C.gold} 30%,#FF8C00 65%,${C.gold} 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",filter:`drop-shadow(0 0 28px rgba(255,215,0,0.5))`,marginBottom:14}}>
          SETTER LIVE<br />DASHBOARD
        </div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:C.t3,letterSpacing:"0.08em"}}>{TODAY_D}</div>
      </div>

      <div style={{position:"relative",zIndex:2,display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center"}}>
        {[{name:"Liz",sub:"Setter View"},{name:"Chantal",sub:"Setter View"},{name:"JP",sub:"Command View"}].map(({name,sub})=>(
          <button key={name} onClick={()=>onPick(name)}
            style={{width:220,padding:0,borderRadius:10,border:`1.5px solid ${C.border}`,background:C.s1,cursor:"pointer",overflow:"hidden",transition:"all 0.25s",textAlign:"left"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.goldBorder;e.currentTarget.style.boxShadow=`0 0 28px rgba(255,215,0,0.2),0 0 56px rgba(255,215,0,0.08)`;e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.background=C.s2;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";e.currentTarget.style.background=C.s1;}}>
            <div style={{padding:"28px 24px 26px"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:40,fontWeight:900,letterSpacing:"0.1em",lineHeight:1,background:`linear-gradient(135deg,#FFE566,${C.gold},#FF8C00)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",filter:`drop-shadow(0 0 8px rgba(255,215,0,0.6))`,marginBottom:8,whiteSpace:"nowrap"}}>
                {name.toUpperCase()}
              </div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:C.t3,textTransform:"uppercase"}}>{sub}</div>
            </div>
          </button>
        ))}
      </div>

      <button onClick={onBack}
        style={{position:"relative",zIndex:2,fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.16em",textTransform:"uppercase",color:C.t4,background:"none",border:`1px solid ${C.border}`,borderRadius:5,padding:"10px 20px",cursor:"pointer",transition:"all 0.15s"}}
        onMouseEnter={e=>{e.target.style.color=C.gold;e.target.style.borderColor=C.goldBorder;e.target.style.textShadow=`0 0 8px ${C.goldGlow}`;}}
        onMouseLeave={e=>{e.target.style.color=C.t4;e.target.style.borderColor=C.border;e.target.style.textShadow="none";}}>
        ← BACK TO HUB
      </button>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────
// ── SETTER GRAPHS ─────────────────────────────────────────────────────────
function SetterGraphs({ rep }) {
  const pipelineKey = `setter:${rep.toLowerCase()}:pipeline`;
  const histKey     = `setter:${rep.toLowerCase()}:eod:history`;
  const [pipeline,  setPipeline]  = useState([]);
  const [history,   setHistory]   = useState([]);
  const [loaded,    setLoaded]    = useState(false);

  useEffect(() => {
    Promise.all([apiGet(pipelineKey), apiGet(histKey)]).then(([p, h]) => {
      if (p) setPipeline(p);
      if (h) setHistory(h);
      setLoaded(true);
    });
  }, [rep]);

  if (!loaded) return <div style={{padding:60,textAlign:"center",fontFamily:"'DM Mono',monospace",fontSize:12,color:C.t4,letterSpacing:"0.16em"}}>LOADING GRAPHS...</div>;

  const br = fn => buildRange(30).map(r => ({ date:r.date, value: pipeline.filter(l => l.date===r.date && fn(l)).length }));

  const inboundD   = br(() => true);
  const qualD      = br(l => l.stage !== "disq");
  const disqD      = br(l => l.stage === "disq");
  const linkD      = br(l => l.stage === "link" || l.stage === "booked");
  const bookedD    = br(l => l.stage === "booked");

  // Rate graphs from pipeline
  const linkBookD  = buildRange(30).map(r => {
    const links  = pipeline.filter(l => l.date===r.date && (l.stage==="link"||l.stage==="booked")).length;
    const booked = pipeline.filter(l => l.date===r.date && l.stage==="booked").length;
    return { date:r.date, value: links > 0 ? Math.round((booked/links)*100) : 0 };
  });
  const qualRateD  = buildRange(30).map(r => {
    const inb  = pipeline.filter(l => l.date===r.date).length;
    const qual = pipeline.filter(l => l.date===r.date && l.stage!=="disq").length;
    return { date:r.date, value: inb > 0 ? Math.round((qual/inb)*100) : 0 };
  });

  const G2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 };
  const G3 = { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 };

  return (
    <div style={{ maxWidth:980, margin:"0 auto", padding:"28px 24px" }}>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color:C.t3, marginBottom:20 }}>
        {rep.toUpperCase()} — HISTORICAL PERFORMANCE
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color:C.t3, whiteSpace:"nowrap" }}>Volume Metrics — Pipeline Data</span>
        <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${C.border},transparent)` }} />
      </div>
      <div style={{ ...G2, marginBottom:14 }}>
        <ChartCard><BarChart data={inboundD}  color={C.blue}   barH={120} label="Inbound DMs / Day" /></ChartCard>
        <ChartCard><BarChart data={qualD}     color={C.green}  barH={120} label="Qualified / Day" /></ChartCard>
      </div>
      <div style={{ ...G3, marginBottom:14 }}>
        <ChartCard><BarChart data={linkD}    color={C.purple} barH={110} label="Links Sent / Day" /></ChartCard>
        <ChartCard><BarChart data={bookedD}  color={C.gold}   barH={110} label="Calls Booked / Day" /></ChartCard>
        <ChartCard><BarChart data={disqD}    color={C.red}    barH={110} label="Disqualified / Day" /></ChartCard>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color:C.t3, whiteSpace:"nowrap" }}>Conversion Rates — Calculated from Pipeline</span>
        <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${C.border},transparent)` }} />
      </div>
      <div style={{ ...G2, marginBottom:14 }}>
        <ChartCard>
          <LineChart data={linkBookD} color={C.gold} chartH={130} label="Link → Book Rate %" format={v => v+"%"} />
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:C.t4, letterSpacing:"0.1em", marginTop:6 }}>TARGET: EVERY LINK BECOMES A CALL</div>
        </ChartCard>
        <ChartCard>
          <LineChart data={qualRateD} color={C.green} chartH={130} label="Inbound → Qualified Rate %" format={v => v+"%"} />
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:C.t4, letterSpacing:"0.1em", marginTop:6 }}>% OF INBOUND DMS THAT QUALIFY</div>
        </ChartCard>
      </div>
    </div>
  );
}

export default function SetterLive({ onNavigate }) {
  useGlobalStyles();
  const [role, setRole] = useState(null);
  const [tab,  setTab]  = useState("eod");

  if (!role) return <RolePicker onPick={setRole} onBack={()=>onNavigate("hub")} />;

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.t1}}>
      <div style={{position:"fixed",inset:0,backgroundImage:`linear-gradient(rgba(255,215,0,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,215,0,0.022) 1px,transparent 1px)`,backgroundSize:"60px 60px",pointerEvents:"none",zIndex:0}} />
      <div style={{position:"fixed",top:-200,left:"50%",transform:"translateX(-50%)",width:900,height:600,background:`radial-gradient(ellipse,rgba(255,215,0,0.07) 0%,transparent 65%)`,pointerEvents:"none",zIndex:0}} />
      <div style={{position:"fixed",left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${C.goldDim} 20%,rgba(255,215,0,0.07) 50%,${C.goldDim} 80%,transparent)`,animation:"scanline 7s linear infinite",pointerEvents:"none",zIndex:1}} />

      <div style={{position:"relative",zIndex:2}}>
        {/* Header */}
        <div style={{background:"rgba(0,0,0,0.92)",borderBottom:`2px solid rgba(255,215,0,0.12)`,padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(20px)",boxShadow:`0 0 40px rgba(0,0,0,0.8),0 2px 0 rgba(255,215,0,0.06)`}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <button onClick={()=>setRole(null)}
              style={{fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.12em",color:C.t3,background:"none",border:`1px solid ${C.border}`,borderRadius:4,padding:"7px 14px",cursor:"pointer",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.target.style.color=C.gold;e.target.style.borderColor=C.goldBorder;}}
              onMouseLeave={e=>{e.target.style.color=C.t3;e.target.style.borderColor=C.border;}}>
              ← SWITCH
            </button>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:"0.1em",color:C.gold,textShadow:`0 0 14px ${C.goldGlow}`}}>
                {role==="JP"?"JP // COMMAND VIEW":`${role.toUpperCase()} // SETTER LIVE`}
              </span>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:C.green,animation:"liveDot 2s ease-in-out infinite"}} />
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.green,letterSpacing:"0.12em",textShadow:`0 0 8px ${C.greenGlow}`}}>LIVE</span>
              </div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {role!=="JP"&&["eod","pipeline","graphs"].map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{padding:"7px 16px",fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",borderRadius:4,cursor:"pointer",border:tab===t?`1px solid ${C.goldBorder}`:`1px solid ${C.border}`,background:tab===t?C.goldDim:"transparent",color:tab===t?C.gold:C.t3,boxShadow:tab===t?`0 0 10px rgba(255,215,0,0.2)`:"none",transition:"all 0.15s",textShadow:tab===t?`0 0 8px ${C.goldGlow}`:"none"}}>
                {t==="eod"?"EOD Tracker":t==="pipeline"?"Pipeline":"📈 Graphs"}
              </button>
            ))}
            <button onClick={()=>onNavigate("hub")}
              style={{padding:"7px 14px",fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",color:C.t3,background:"transparent",border:`1px solid ${C.border}`,borderRadius:4,cursor:"pointer",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.target.style.color=C.gold;e.target.style.borderColor=C.goldBorder;}}
              onMouseLeave={e=>{e.target.style.color=C.t3;e.target.style.borderColor=C.border;}}>
              Hub →
            </button>
          </div>
        </div>

        {role==="JP" ? <JPView /> : tab==="eod" ? <SetterView rep={role} /> : tab==="pipeline" ? <PipelinePanel rep={role} /> : <SetterGraphs rep={role} />}
      </div>
    </div>
  );
}
