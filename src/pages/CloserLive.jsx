import { useState, useEffect, useRef, useCallback } from "react";

// ── CONSTANTS ────────────────────────────────────────────────────────────
const TODAY   = new Date().toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"});
const TODAY_D = new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
const CLOSER_KEY  = "jp";
const PIPE_KEY    = `closer:${CLOSER_KEY}:pipeline`;
const EOD_KEY_FN  = () => `closer:${CLOSER_KEY}:eod:${TODAY}`;

// ── NEON COLOR SYSTEM ─────────────────────────────────────────────────────
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
  amber:       "#FFB800",
  amberGlow:   "rgba(255,184,0,0.8)",
  amberDim:    "rgba(255,184,0,0.12)",
  amberBorder: "rgba(255,184,0,0.35)",
  blue:        "#44AAFF",
  blueDim:     "rgba(68,170,255,0.10)",
  blueBorder:  "rgba(68,170,255,0.35)",
  orange:      "#FF9944",
  orangeDim:   "rgba(255,153,68,0.10)",
  orangeBorder:"rgba(255,153,68,0.35)",
  purple:      "#CC99FF",
  t1: "#F5F5F5",
  t2: "#BEBEBE",
  t3: "#909090",
  t4: "#585858",
  bg:  "#000000",
  s1:  "#0D0D0D",
  s2:  "#141414",
  s3:  "#1E1E1E",
  border:   "#2A2A2A",
  borderHi: "#484848",
};

// ── PIPELINE STAGES ───────────────────────────────────────────────────────
const STAGES = [
  { key:"booked",   label:"Booked",          color:C.gold,   glow:C.goldGlow,   dim:C.goldDim,   border:C.goldBorder,   trap:false },
  { key:"noshow",   label:"No-Show",          color:C.red,    glow:C.redGlow,    dim:C.redDim,    border:C.redBorder,    trap:true  },
  { key:"offer",    label:"Offer Made",       color:C.blue,   glow:"rgba(68,170,255,0.8)", dim:C.blueDim,   border:C.blueBorder,   trap:false },
  { key:"verbal",   label:"Verbal Yes",       color:C.amber,  glow:C.amberGlow,  dim:C.amberDim,  border:C.amberBorder,  trap:true  },
  { key:"reoffer",  label:"Re-offer Sched.",  color:C.orange, glow:"rgba(255,153,68,0.8)", dim:C.orangeDim, border:C.orangeBorder, trap:false },
  { key:"handedoff",label:"Handed Off",       color:C.green,  glow:C.greenGlow,  dim:C.greenDim,  border:C.greenBorder,  trap:false },
];
const SM = {};
STAGES.forEach(s => SM[s.key] = s);

// Stages where a call was actually held (for "Calls Held" metric)
const HELD_STAGES   = ["offer","verbal","reoffer","handedoff"];
// Stages where an offer was made
const OFFER_STAGES  = ["offer","verbal","reoffer","handedoff"];
// Terminal success stage
const CLOSED_STAGE  = "handedoff";

const PROGRAMS = ["DDBA Academy","DDBA Accelerator","Tier 1","Tier 2","Tier 3","Tier 4","Custom"];
const PAYMENT_METHODS = ["Stripe","Credit Card","Bank Transfer","Cash","Zelle","Other"];

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
    if (document.getElementById("cl-styles")) return;
    const s = document.createElement("style");
    s.id = "cl-styles";
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
      @keyframes liveDot {
        0%,100%{ box-shadow:0 0 5px 2px rgba(0,255,136,0.9),0 0 12px rgba(0,255,136,0.5); }
        50%    { box-shadow:0 0 9px 4px rgba(0,255,136,1),0 0 22px rgba(0,255,136,0.7); }
      }
      @keyframes goldDot {
        0%,100%{ box-shadow:0 0 5px 2px rgba(255,215,0,0.9),0 0 12px rgba(255,215,0,0.5); }
        50%    { box-shadow:0 0 9px 4px rgba(255,215,0,1),0 0 22px rgba(255,215,0,0.7); }
      }
      @keyframes amberPulse {
        0%,100%{ box-shadow:0 0 8px rgba(255,184,0,0.5); }
        50%    { box-shadow:0 0 16px rgba(255,184,0,0.9),0 0 28px rgba(255,184,0,0.4); }
      }
      @keyframes scanline { 0%{top:-2px} 100%{top:100%} }
      @keyframes fadeIn   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      input[type=number]::-webkit-inner-spin-button,
      input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
      input[type=number]{ -moz-appearance:textfield; }
      ::-webkit-scrollbar{ width:4px; }
      ::-webkit-scrollbar-track{ background:#000; }
      ::-webkit-scrollbar-thumb{ background:#FFD70040; border-radius:2px; }
    `;
    document.head.appendChild(s);
  }, []);
}

// ── KPI TILE ──────────────────────────────────────────────────────────────
// Shows value + target + color-coded status. No override (read-only auto metrics).
function KpiTile({ label, value, display, target, targetLabel, color, sub, badge, isOverride, onMinus, onPlus, onReset }) {
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
        gap: 8,
        transition: "all 0.15s",
        boxShadow: isOverride ? `0 0 18px ${C.goldDim}` : "none",
      }}>
      {/* Label + badge row */}
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:C.t2, flex:1, whiteSpace:"nowrap" }}>
          {label}
        </span>
        {badge && (
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", padding:"3px 8px", borderRadius:3, flexShrink:0, background: isOverride?C.goldDim:C.greenDim, color:isOverride?C.gold:C.green, border:`1px solid ${isOverride?C.goldBorder:C.greenBorder}`, textShadow:`0 0 8px ${isOverride?C.goldGlow:C.greenGlow}` }}>
            {isOverride?"EDITED":"AUTO"}
          </span>
        )}
        {/* Override controls inline */}
        {badge && (
          <div style={{ display:"flex", gap:3, opacity: hov?1:0, transition:"opacity 0.15s", flexShrink:0 }}>
            {[["−","#200000",C.red],["+","#002010",C.green]].map(([sym,bg,c],i)=>(
              <button key={sym} onClick={i===0?onMinus:onPlus}
                style={{ width:24, height:24, borderRadius:3, border:`1px solid ${C.border}`, background:C.s2, color:C.t4, cursor:"pointer", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.1s", lineHeight:1 }}
                onMouseEnter={e=>{e.target.style.background=bg;e.target.style.color=c;e.target.style.borderColor=c+"66";}}
                onMouseLeave={e=>{e.target.style.background=C.s2;e.target.style.color=C.t4;e.target.style.borderColor=C.border;}}>
                {sym}
              </button>
            ))}
            {isOverride&&<button onClick={onReset} style={{ width:24, height:24, borderRadius:3, border:`1px solid ${C.goldBorder}`, background:C.goldDim, color:C.gold, cursor:"pointer", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>↺</button>}
          </div>
        )}
      </div>

      {/* Big number */}
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:58, fontWeight:900, lineHeight:1, color:col, letterSpacing:"-0.02em", textShadow:`0 0 18px ${col}, 0 0 36px ${col}55` }}>
        {display ?? value ?? "—"}
      </div>

      {/* Sub / target */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {sub && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:C.t3, letterSpacing:"0.12em", textTransform:"uppercase" }}>{sub}</div>}
        {targetLabel && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:C.t4, letterSpacing:"0.1em" }}>{targetLabel}</div>}
      </div>
    </div>
  );
}

// ── FUNNEL BAR ────────────────────────────────────────────────────────────
function CloserFunnel({ pipeline }) {
  const today = pipeline.filter(l => l.date === TODAY);
  const total = Math.max(today.length, 1);
  return (
    <div style={{ display:"flex", background:C.s1, borderRadius:8, overflow:"hidden", border:`1.5px solid ${C.border}` }}>
      {STAGES.map(s => {
        const n = today.filter(l => l.stage === s.key).length;
        return (
          <div key={s.key} style={{ flex:1, padding:"12px 10px", borderRight:`1px solid ${C.border}`, position:"relative" }}>
            {s.trap && n > 0 && (
              <div style={{ position:"absolute", top:6, right:6, width:7, height:7, borderRadius:"50%", background:C.amber, boxShadow:`0 0 8px ${C.amberGlow}`, animation:"amberPulse 2s ease-in-out infinite" }} />
            )}
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.t3, marginBottom:5 }}>{s.label}</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:30, fontWeight:900, lineHeight:1, color:s.color, textShadow:`0 0 10px ${s.color}88` }}>{n}</div>
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

function NbCard({ label, children, gold, amber }) {
  const bg = gold ? "rgba(255,215,0,0.05)" : amber ? "rgba(255,184,0,0.04)" : C.s1;
  const bc = gold ? C.goldBorder : amber ? C.amberBorder : C.border;
  const lc = gold ? C.gold : amber ? C.amber : C.t3;
  const ls = gold ? `0 0 8px ${C.goldGlow}` : amber ? `0 0 8px ${C.amberGlow}` : "none";
  return (
    <div style={{ background:bg, border:`1.5px solid ${bc}`, borderRadius:8, padding:"15px 18px", display:"flex", flexDirection:"column", gap:8 }}>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:lc, textShadow:ls }}>{label}</span>
      {children}
    </div>
  );
}

const NBI  = { background:"transparent", border:"none", color:C.t1, fontFamily:"'Barlow',sans-serif", fontSize:15, fontWeight:500, width:"100%", outline:"none", padding:0 };
const NBTA = { ...NBI, resize:"none", minHeight:72, lineHeight:1.65 };

// ── CLOSER EOD VIEW ───────────────────────────────────────────────────────
function CloserEOD({ pipeline }) {
  const eodKey = EOD_KEY_FN();
  const [overrides, setOverrides] = useState({ scheduled:null, held:null, noshow:null, offers:null, closes:null, oneCall:null });
  const [nb,        setNb]        = useState({ newCash:"", recurCash:"", topObjection:"", biggestWin:"", oneFix:"" });
  const [loaded,    setLoaded]    = useState(false);
  const [reportTxt, setReportTxt] = useState("");
  const [showReport,setShowReport]= useState(false);

  useEffect(() => {
    apiGet(eodKey).then(d => {
      if (d) {
        setOverrides(d.overrides||{scheduled:null,held:null,noshow:null,offers:null,closes:null,oneCall:null});
        setNb(d.nb||{newCash:"",recurCash:"",topObjection:"",biggestWin:"",oneFix:""});
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => apiSet(eodKey, { overrides, nb }), 700);
    return () => clearTimeout(t);
  }, [overrides, nb, loaded]);

  const todayLeads = pipeline.filter(l => l.date === TODAY);

  // Auto values from pipeline
  const auto = {
    scheduled: todayLeads.length,
    held:      todayLeads.filter(l => HELD_STAGES.includes(l.stage)).length,
    noshow:    todayLeads.filter(l => l.stage === "noshow").length,
    offers:    todayLeads.filter(l => OFFER_STAGES.includes(l.stage)).length,
    closes:    todayLeads.filter(l => l.stage === CLOSED_STAGE).length,
    oneCall:   todayLeads.filter(l => l.stage === CLOSED_STAGE && l.oneCallClose).length,
  };
  const eff  = k => overrides[k] !== null ? overrides[k] : auto[k];
  const ovr  = (k,d) => setOverrides(p => ({...p,[k]:Math.max(0,(p[k]!==null?p[k]:auto[k])+d)}));
  const rst  = k => setOverrides(p => ({...p,[k]:null}));

  // Revenue from closed leads today
  const autoRevenue = todayLeads
    .filter(l => l.stage === CLOSED_STAGE && l.cashCollected)
    .reduce((sum,l) => sum + (parseFloat(l.cashCollected)||0), 0);

  // KPIs
  const held      = eff("held") || 0;
  const scheduled = eff("scheduled") || 0;
  const closes    = eff("closes") || 0;
  const oneCall   = eff("oneCall") || 0;
  const offers    = eff("offers") || 0;

  const showRate      = held > 0 && scheduled > 0 ? Math.round((held/scheduled)*100) : null;
  const closeRate     = held > 0 ? Math.round((closes/held)*100) : null;
  const oneCallRate   = closes > 0 ? Math.round((oneCall/closes)*100) : null;
  const offerRate     = held > 0 ? Math.round((offers/held)*100) : null;

  // Color for KPI vs target
  const kpiColor = (val, target, invert) => {
    if (val === null) return C.t4;
    if (invert) return val <= target ? C.green : C.red;
    return val >= target ? C.green : val >= target*0.85 ? C.amber : C.red;
  };

  const totalRevenue = autoRevenue + (parseFloat(nb.newCash)||0) + (parseFloat(nb.recurCash)||0);
  // If no manual breakdown entered, use auto revenue
  const displayRevenue = (parseFloat(nb.newCash)||0) + (parseFloat(nb.recurCash)||0) > 0
    ? (parseFloat(nb.newCash)||0) + (parseFloat(nb.recurCash)||0)
    : autoRevenue;

  const resetDay = () => {
    setOverrides({scheduled:null,held:null,noshow:null,offers:null,closes:null,oneCall:null});
    setNb({newCash:"",recurCash:"",topObjection:"",biggestWin:"",oneFix:""});
    apiSet(eodKey, null);
  };

  const pushReport = () => {
    const g = k => (nb[k]||"—").trim()||"—";
    const fmt = n => n !== null ? n+"%" : "—";
    const cash = v => v > 0 ? "$"+v.toLocaleString() : "—";
    setReportTxt([
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `DDBA // CLOSER EOD REPORT`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Date:         ${TODAY}`,
      `Closer:       JP Campbell`,``,
      `━━ CALL ACTIVITY ━━━━━━━━━━━━━━━━━━━━━━━`,
      `Calls Scheduled:     ${eff("scheduled")}`,
      `Calls Held:          ${eff("held")}`,
      `No-Shows:            ${eff("noshow")}`,
      `Show Rate:           ${fmt(showRate)}  [target ≥75%]`,``,
      `━━ PERFORMANCE ━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Offers Made:         ${eff("offers")}`,
      `Closes:              ${eff("closes")}`,
      `One-Call Closes:     ${eff("oneCall")}`,
      `Close Rate:          ${fmt(closeRate)}  [target ≥70%]`,
      `One-Call Close Rate: ${fmt(oneCallRate)}  [target ≥90%]`,``,
      `━━ REVENUE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Revenue Collected:   ${cash(autoRevenue)}  (from pipeline)`,
      `New Cash:            ${g("newCash")}`,
      `Recurring Cash:      ${g("recurCash")}`,``,
      `━━ INTEL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Top Objection:       ${g("topObjection")}`,
      `Biggest Win:         ${g("biggestWin")}`,``,
      `━━ ONE FIX FOR TOMORROW ━━━━━━━━━━━━━━━`,
      g("oneFix"),
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ].join("\n"));
    setShowReport(true);
  };

  if (!loaded) return <div style={{padding:60,textAlign:"center",fontFamily:"'DM Mono',monospace",fontSize:12,color:C.t4,letterSpacing:"0.16em"}}>SYNCING...</div>;

  const G3 = { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 };
  const G2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 };

  return (
    <div style={{maxWidth:980,margin:"0 auto",padding:"28px 24px"}}>

      {/* Funnel */}
      <SectionLabel>Pipeline Funnel — Today</SectionLabel>
      <div style={{marginBottom:10}}><CloserFunnel pipeline={pipeline} /></div>

      {/* Trap state warning */}
      {(() => {
        const verbalCount = pipeline.filter(l=>l.date===TODAY&&l.stage==="verbal").length;
        if (verbalCount === 0) return null;
        return (
          <div style={{marginBottom:12,padding:"9px 16px",background:"rgba(255,184,0,0.06)",border:`1px solid ${C.amberBorder}`,borderRadius:6,display:"flex",alignItems:"center",gap:10,animation:"amberPulse 2s ease-in-out infinite"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:C.amber,boxShadow:`0 0 8px ${C.amberGlow}`,flexShrink:0}} />
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,color:C.amber,letterSpacing:"0.1em"}}>
              {verbalCount} VERBAL YES {verbalCount===1?"lead":"leads"} — AGREED BUT NOT PAID. NOT A CLOSE.
            </span>
          </div>
        );
      })()}

      <div style={{marginBottom:28}} />

      {/* KPIs — Call Activity */}
      <SectionLabel>Call Activity — Auto-Pulled from Pipeline</SectionLabel>
      <div style={{...G3,marginBottom:12}}>
        <KpiTile label="Calls Scheduled" value={eff("scheduled")} color={C.gold} sub="Today's calendar" badge isOverride={overrides.scheduled!==null} onMinus={()=>ovr("scheduled",-1)} onPlus={()=>ovr("scheduled",1)} onReset={()=>rst("scheduled")} />
        <KpiTile label="Calls Held" value={eff("held")} color={C.blue} sub="Showed up" badge isOverride={overrides.held!==null} onMinus={()=>ovr("held",-1)} onPlus={()=>ovr("held",1)} onReset={()=>rst("held")} />
        <KpiTile label="No-Shows" value={eff("noshow")} color={C.red} sub="Didn't appear" badge isOverride={overrides.noshow!==null} onMinus={()=>ovr("noshow",-1)} onPlus={()=>ovr("noshow",1)} onReset={()=>rst("noshow")} />
      </div>

      {/* KPIs — Performance */}
      <SectionLabel>Performance KPIs — Live Calculated</SectionLabel>
      <div style={{...G3,marginBottom:12}}>
        {/* Show Rate */}
        <div style={{background:C.s1,border:`1.5px solid ${C.border}`,borderRadius:8,padding:"16px 18px",display:"flex",flexDirection:"column",gap:8}}>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",color:C.t2}}>Show Rate</span>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:58,fontWeight:900,lineHeight:1,color:kpiColor(showRate,75),textShadow:`0 0 18px ${kpiColor(showRate,75)},0 0 36px ${kpiColor(showRate,75)}55`}}>
            {showRate!==null?showRate+"%":"—"}
          </span>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.t3,letterSpacing:"0.1em",textTransform:"uppercase"}}>HELD / SCHEDULED</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t4}}>TARGET ≥75%</span>
          </div>
        </div>
        {/* Close Rate */}
        <div style={{background:C.s1,border:`1.5px solid ${C.border}`,borderRadius:8,padding:"16px 18px",display:"flex",flexDirection:"column",gap:8}}>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",color:C.t2}}>Close Rate</span>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:58,fontWeight:900,lineHeight:1,color:kpiColor(closeRate,70),textShadow:`0 0 18px ${kpiColor(closeRate,70)},0 0 36px ${kpiColor(closeRate,70)}55`}}>
            {closeRate!==null?closeRate+"%":"—"}
          </span>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.t3,letterSpacing:"0.1em",textTransform:"uppercase"}}>CLOSES / HELD</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t4}}>TARGET ≥70%</span>
          </div>
        </div>
        {/* One-Call Close Rate */}
        <div style={{background:C.s1,border:`1.5px solid ${C.border}`,borderRadius:8,padding:"16px 18px",display:"flex",flexDirection:"column",gap:8}}>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",color:C.t2}}>One-Call Close</span>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:58,fontWeight:900,lineHeight:1,color:kpiColor(oneCallRate,90),textShadow:`0 0 18px ${kpiColor(oneCallRate,90)},0 0 36px ${kpiColor(oneCallRate,90)}55`}}>
            {oneCallRate!==null?oneCallRate+"%":"—"}
          </span>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.t3,letterSpacing:"0.1em",textTransform:"uppercase"}}>1-CALL / CLOSES</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t4}}>TARGET ≥90%</span>
          </div>
        </div>
      </div>

      <div style={{...G3,marginBottom:28}}>
        <KpiTile label="Offers Made"  value={eff("offers")} color={C.blue}  sub="PITCHED TODAY"   badge isOverride={overrides.offers!==null}  onMinus={()=>ovr("offers",-1)}  onPlus={()=>ovr("offers",1)}  onReset={()=>rst("offers")} />
        <KpiTile label="Closes"       value={eff("closes")} color={C.green} sub="CASH COLLECTED"  badge isOverride={overrides.closes!==null}  onMinus={()=>ovr("closes",-1)}  onPlus={()=>ovr("closes",1)}  onReset={()=>rst("closes")} />
        <KpiTile label="One-Call Closes" value={eff("oneCall")} color={C.green} sub="SAME-DAY CLOSE" badge isOverride={overrides.oneCall!==null} onMinus={()=>ovr("oneCall",-1)} onPlus={()=>ovr("oneCall",1)} onReset={()=>rst("oneCall")} />
      </div>

      {/* Revenue */}
      <SectionLabel>Revenue — Today</SectionLabel>
      <div style={{marginBottom:28}}>
        <div style={{background:"rgba(0,255,136,0.04)",border:`1.5px solid ${C.greenBorder}`,borderRadius:8,padding:"18px 20px",display:"flex",alignItems:"center",gap:24,boxShadow:`0 0 20px rgba(0,255,136,0.05)`}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:C.t3,marginBottom:8}}>Cash Collected (from pipeline)</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:54,fontWeight:900,lineHeight:1,color:autoRevenue>0?C.green:C.t4,textShadow:autoRevenue>0?`0 0 20px ${C.green},0 0 40px rgba(0,255,136,0.4)`:"none"}}>
              {autoRevenue>0?"$"+autoRevenue.toLocaleString():"$0"}
            </div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t4,letterSpacing:"0.1em",marginTop:4}}>SUM OF HANDED-OFF LEADS TODAY</div>
          </div>
          <div style={{width:1,height:60,background:C.border}} />
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,flex:1}}>
            {[["New Cash","newCash","$0"],["Recurring Cash","recurCash","$0"]].map(([lbl,k,ph])=>(
              <div key={k}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t3,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6}}>{lbl}</div>
                <input value={nb[k]} onChange={e=>setNb(p=>({...p,[k]:e.target.value}))} placeholder={ph}
                  style={{background:"transparent",border:"none",color:C.t1,fontFamily:"'Bebas Neue',sans-serif",fontSize:28,fontWeight:900,width:"100%",outline:"none",padding:0}} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notebook */}
      <SectionLabel>Notebook — Manual Fields</SectionLabel>
      <div style={{...G2,marginBottom:12}}>
        <NbCard label="Top Objection Heard Today" amber>
          <input style={NBI} value={nb.topObjection} onChange={e=>setNb(p=>({...p,topObjection:e.target.value}))} placeholder="What came up most on calls today?" />
        </NbCard>
        <NbCard label="Biggest Win Today">
          <input style={NBI} value={nb.biggestWin} onChange={e=>setNb(p=>({...p,biggestWin:e.target.value}))} placeholder="Best moment, breakthrough, or result..." />
        </NbCard>
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
          ⬆ PUSH EOD REPORT
        </button>
        <button style={{flex:1,minWidth:110,padding:"18px 0",fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:"0.14em",background:"transparent",border:`2px solid ${C.border}`,color:C.t2,borderRadius:6,cursor:"pointer",transition:"all 0.15s"}}
          onMouseEnter={e=>{e.target.style.borderColor=C.borderHi;e.target.style.color=C.t1;}}
          onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.t2;}}>
          SAVE DRAFT
        </button>
        <button onClick={()=>{if(window.confirm("Reset today's EOD? Pipeline data is not affected.")) resetDay();}}
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
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,fontWeight:800,letterSpacing:"0.12em",color:C.gold,textShadow:`0 0 16px ${C.goldGlow}`}}>CLOSER EOD — READY TO PUSH</span>
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

// ── CLOSER PIPELINE ───────────────────────────────────────────────────────
function CloserPipeline({ pipeline, setGlobalPipeline }) {
  const [showAdd,   setShowAdd]   = useState(false);
  const [form,      setForm]      = useState(makeEmpty());
  const [editId,    setEditId]    = useState(null);
  const [filter,    setFilter]    = useState(null);
  const [errHandle, setErrHandle] = useState(false);
  const [errCash,   setErrCash]   = useState(false);
  const leadsRef = useRef([]);

  useEffect(() => { leadsRef.current = pipeline; }, [pipeline]);

  function makeEmpty() {
    return {
      date: TODAY, name:"", handle:"", closer:"JP Campbell", program:"", cash:"",
      paymentMethod:"", callTime:"", objection:"", oneCallClose:false,
      setterName:"", notes:"", stage:"booked", disqual:""
    };
  }

  const persist = next => { apiSet(PIPE_KEY, next); setGlobalPipeline(next); };

  const save = () => {
    if (!form.handle.trim()) { setErrHandle(true); return; }
    if (form.stage === "handedoff" && !form.cash.trim()) { setErrCash(true); return; }
    setErrHandle(false); setErrCash(false);

    const current = leadsRef.current;
    const next = editId !== null
      ? current.map(l => l.id===editId ? {...l,...form} : l)
      : [...current, {...form, id:Date.now()}];

    leadsRef.current = next;
    persist(next);
    setShowAdd(false); setEditId(null);
    setForm(makeEmpty());
  };

  const del = id => {
    if (!window.confirm("Remove this lead?")) return;
    const next = leadsRef.current.filter(l => l.id!==id);
    leadsRef.current = next;
    persist(next);
  };

  const startEdit = l => { setForm({...makeEmpty(),...l}); setEditId(l.id); setErrHandle(false); setErrCash(false); setShowAdd(true); };
  const openAdd   = () => { setForm(makeEmpty()); setEditId(null); setErrHandle(false); setErrCash(false); setShowAdd(true); };

  const visible = pipeline.filter(l => !filter || l.stage===filter).sort((a,b)=>b.id-a.id);

  const pill = key => {
    const s = SM[key]||SM["booked"];
    return (
      <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"3px 9px",borderRadius:3,background:s.dim,color:s.color,border:`1px solid ${s.border}`,whiteSpace:"nowrap",textShadow:`0 0 6px ${s.glow}55`,display:"inline-flex",alignItems:"center",gap:5}}>
        {s.trap && <span style={{width:5,height:5,borderRadius:"50%",background:s.color,boxShadow:`0 0 5px ${s.glow}`,flexShrink:0,animation:key==="verbal"?"amberPulse 2s ease-in-out infinite":"none",display:"inline-block"}} />}
        {s.label}
      </span>
    );
  };

  const FI = { background:C.s2, border:`1.5px solid ${C.border}`, borderRadius:5, padding:"10px 13px", fontSize:14, color:C.t1, fontFamily:"'Barlow',sans-serif", width:"100%", outline:"none", boxSizing:"border-box", transition:"border-color 0.15s" };
  const SEL = { ...FI, cursor:"pointer", appearance:"none", WebkitAppearance:"none" };

  return (
    <div style={{padding:"0 24px 28px",maxWidth:1080,margin:"0 auto"}}>
      {/* Toolbar */}
      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:16}}>
        <button onClick={openAdd}
          style={{padding:"10px 22px",fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:"0.14em",background:`linear-gradient(135deg,${C.gold},#CC8800)`,color:"#000",border:"none",borderRadius:5,cursor:"pointer",boxShadow:`0 0 16px ${C.goldGlow}`}}>
          + ADD LEAD
        </button>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginLeft:"auto"}}>
          {[null,...STAGES.map(s=>s.key)].map(k=>{
            const s=k?SM[k]:null, active=filter===k;
            return(
              <button key={k||"all"} onClick={()=>setFilter(k)}
                style={{padding:"6px 12px",fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",borderRadius:4,cursor:"pointer",background:active?(k?s.dim:C.goldDim):"transparent",color:active?(k?s.color:C.gold):C.t3,border:`1px solid ${active?(k?s.border:C.goldBorder):C.border}`,boxShadow:active?`0 0 8px ${k?s.glow+"44":C.goldGlow}`:"none",transition:"all 0.1s"}}>
                {k?s.label:"ALL"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{overflowX:"auto",background:C.s1,border:`1.5px solid ${C.border}`,borderRadius:8}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`}}>
              {["Date","Prospect","Program","Stage","Cash","One-Call","Setter","Objection","Actions"].map(h=>(
                <th key={h} style={{padding:"12px 13px",fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:C.t3,textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(l=>(
              <tr key={l.id}
                style={{borderBottom:`1px solid ${C.s3}`,transition:"background 0.1s",background:l.stage==="verbal"?"rgba(255,184,0,0.03)":"transparent"}}
                onMouseEnter={e=>e.currentTarget.style.background=l.stage==="verbal"?"rgba(255,184,0,0.06)":C.s2}
                onMouseLeave={e=>e.currentTarget.style.background=l.stage==="verbal"?"rgba(255,184,0,0.03)":"transparent"}>
                <td style={{padding:"10px 13px",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.t3,whiteSpace:"nowrap"}}>{l.date}</td>
                <td style={{padding:"10px 13px"}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:"0.08em",color:C.t1,whiteSpace:"nowrap"}}>{l.name||l.handle}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.t4}}>{l.handle}</div>
                </td>
                <td style={{padding:"10px 13px",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.t3,whiteSpace:"nowrap"}}>{l.program||"—"}</td>
                <td style={{padding:"10px 13px"}}>{pill(l.stage)}</td>
                <td style={{padding:"10px 13px",fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:l.cash?C.green:C.t4,textShadow:l.cash?`0 0 8px ${C.green}88`:"none",whiteSpace:"nowrap"}}>
                  {l.cash?"$"+parseFloat(l.cash).toLocaleString():"—"}
                </td>
                <td style={{padding:"10px 13px",textAlign:"center"}}>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:3,background:l.oneCallClose?C.greenDim:"transparent",color:l.oneCallClose?C.green:C.t4,border:`1px solid ${l.oneCallClose?C.greenBorder:C.border}`,textShadow:l.oneCallClose?`0 0 6px ${C.greenGlow}`:"none"}}>
                    {l.oneCallClose?"YES":"NO"}
                  </span>
                </td>
                <td style={{padding:"10px 13px",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.t3,whiteSpace:"nowrap"}}>{l.setterName||"—"}</td>
                <td style={{padding:"10px 13px",fontSize:12,color:C.t3,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.objection||"—"}</td>
                <td style={{padding:"10px 13px",whiteSpace:"nowrap",display:"flex",gap:5,alignItems:"center"}}>
                  <button onClick={()=>startEdit(l)}
                    style={{background:"none",border:`1px solid ${C.border}`,borderRadius:4,padding:"4px 10px",color:C.t3,cursor:"pointer",fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em",transition:"all 0.1s"}}
                    onMouseEnter={e=>{e.target.style.borderColor=C.gold;e.target.style.color=C.gold;}}
                    onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.t3;}}>EDIT</button>
                  <button onClick={()=>del(l.id)}
                    style={{background:"none",border:`1px solid ${C.redBorder}`,borderRadius:4,padding:"4px 10px",color:C.red,cursor:"pointer",fontSize:11,fontFamily:"'DM Mono',monospace",transition:"all 0.1s"}}
                    onMouseEnter={e=>{e.target.style.background=C.redDim;}} onMouseLeave={e=>{e.target.style.background="none";}}>✕</button>
                </td>
              </tr>
            ))}
            {visible.length===0&&(
              <tr><td colSpan={9} style={{padding:"48px 14px",textAlign:"center",fontFamily:"'DM Mono',monospace",fontSize:12,color:C.t4,letterSpacing:"0.14em"}}>
                NO LEADS — BOOKED CALLS DROP IN HERE AUTOMATICALLY FROM THE SETTER PIPELINE
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:500,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"30px 20px",backdropFilter:"blur(8px)",overflowY:"auto"}}>
          <div style={{background:C.s1,border:`2px solid ${C.border}`,borderRadius:10,maxWidth:560,width:"100%",animation:"fadeIn 0.2s ease"}}>
            <div style={{padding:"20px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:"0.12em",color:C.gold,textShadow:`0 0 14px ${C.goldGlow}`}}>
                {editId!==null?"EDIT LEAD":"NEW LEAD"}
              </span>
              <button onClick={()=>{setShowAdd(false);setEditId(null);}} style={{background:"none",border:"none",color:C.t3,fontSize:20,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:24,display:"flex",flexDirection:"column",gap:14}}>

              {/* Stage selector first — drives required fields */}
              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:C.t3,textTransform:"uppercase",marginBottom:8}}>Stage</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {STAGES.map(s=>(
                    <button key={s.key} onClick={()=>setForm(p=>({...p,stage:s.key}))}
                      style={{padding:"11px 8px",fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",borderRadius:5,cursor:"pointer",textAlign:"center",background:form.stage===s.key?s.dim:"transparent",color:form.stage===s.key?s.color:C.t3,border:`2px solid ${form.stage===s.key?s.color:C.border}`,transition:"all 0.12s",boxShadow:form.stage===s.key?`0 0 12px ${s.glow}55`:"none",textShadow:form.stage===s.key?`0 0 8px ${s.glow}55`:"none"}}>
                      {s.label}
                    </button>
                  ))}
                </div>
                {/* Trap state warning in modal */}
                {form.stage==="verbal"&&(
                  <div style={{marginTop:8,padding:"8px 12px",background:C.amberDim,border:`1px solid ${C.amberBorder}`,borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:10,color:C.amber,letterSpacing:"0.1em",fontWeight:700}}>
                    ⚠ VERBAL YES ≠ A CLOSE. AGREED BUT NOT PAID. LOG PAYMENT WHEN COLLECTED.
                  </div>
                )}
              </div>

              {/* Core fields */}
              {[["date","Date","MM/DD/YYYY",false],["name","Full Name","Prospect name",false],["handle","Instagram Handle *","@username",true],["callTime","Call Date + Time","e.g. Wed 3/26 @ 2:00 PM ET",false],["setterName","Setter Who Booked","",false]].map(([k,lbl,ph,req])=>(
                <div key={k}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:req&&errHandle?C.red:C.t3,textTransform:"uppercase",marginBottom:6}}>{lbl}{req&&<span style={{color:C.red}}> *</span>}</div>
                  <input value={form[k]||""} onChange={e=>{setForm(p=>({...p,[k]:e.target.value}));if(req)setErrHandle(false);}} placeholder={ph}
                    style={{...FI,borderColor:req&&errHandle?C.redBorder:C.border}}
                    onFocus={e=>e.target.style.borderColor=C.goldBorder} onBlur={e=>e.target.style.borderColor=req&&errHandle?C.redBorder:C.border} />
                  {req&&errHandle&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.red,marginTop:4}}>Handle is required.</div>}
                </div>
              ))}

              {/* Program */}
              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:C.t3,textTransform:"uppercase",marginBottom:6}}>Program / Offer Pitched</div>
                <select value={form.program||""} onChange={e=>setForm(p=>({...p,program:e.target.value}))} style={SEL}>
                  <option value="">Select program...</option>
                  {PROGRAMS.map(p=><option key={p} value={p}>{p}</option>)}
                  <option value="custom">Custom / Other</option>
                </select>
              </div>

              {/* Cash — required for Handed Off */}
              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:errCash?C.red:form.stage==="handedoff"?C.green:C.t3,textTransform:"uppercase",marginBottom:6}}>
                  Cash Collected ($){form.stage==="handedoff"&&<span style={{color:C.red}}> *</span>}
                </div>
                <input value={form.cash||""} onChange={e=>{setForm(p=>({...p,cash:e.target.value}));setErrCash(false);}} placeholder="0.00"
                  style={{...FI,borderColor:errCash?C.redBorder:form.stage==="handedoff"?C.greenBorder:C.border,color:form.cash?C.green:C.t1,fontFamily:"'Bebas Neue',sans-serif",fontSize:22,fontWeight:900}}
                  onFocus={e=>e.target.style.borderColor=C.goldBorder} onBlur={e=>e.target.style.borderColor=errCash?C.redBorder:C.border} />
                {errCash&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.red,marginTop:4}}>Cash collected is required before handing off. Revenue is collected — not agreed to.</div>}
              </div>

              {/* Payment method */}
              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:C.t3,textTransform:"uppercase",marginBottom:6}}>Payment Method</div>
                <select value={form.paymentMethod||""} onChange={e=>setForm(p=>({...p,paymentMethod:e.target.value}))} style={SEL}>
                  <option value="">Select...</option>
                  {PAYMENT_METHODS.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* One-call close toggle */}
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <button onClick={()=>setForm(p=>({...p,oneCallClose:!p.oneCallClose}))}
                  style={{width:44,height:24,borderRadius:12,background:form.oneCallClose?C.green:"#1a1a1a",border:`1.5px solid ${form.oneCallClose?C.greenBorder:C.border}`,cursor:"pointer",position:"relative",transition:"all 0.2s",flexShrink:0,boxShadow:form.oneCallClose?`0 0 12px ${C.greenGlow}`:"none"}}>
                  <div style={{position:"absolute",top:2,left:form.oneCallClose?22:2,width:16,height:16,borderRadius:"50%",background:form.oneCallClose?C.green:C.t4,transition:"all 0.2s",boxShadow:form.oneCallClose?`0 0 6px ${C.greenGlow}`:"none"}} />
                </button>
                <div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:"0.14em",color:form.oneCallClose?C.green:C.t3,textTransform:"uppercase",textShadow:form.oneCallClose?`0 0 8px ${C.greenGlow}`:"none"}}>One-Call Close</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t4,letterSpacing:"0.1em"}}>Closed and collected on this call</div>
                </div>
              </div>

              {/* Objection + Notes */}
              {[["objection","Objection Logged","Main objection or stall from this call"],["notes","Notes from Call","Anything relevant for the record"]].map(([k,lbl,ph])=>(
                <div key={k}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:C.t3,textTransform:"uppercase",marginBottom:6}}>{lbl}</div>
                  <input value={form[k]||""} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={FI}
                    onFocus={e=>e.target.style.borderColor=C.goldBorder} onBlur={e=>e.target.style.borderColor=C.border} />
                </div>
              ))}
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
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────
export default function CloserLive({ onNavigate }) {
  const [tab,      setTab]      = useState("eod");
  const [pipeline, setPipeline] = useState([]);
  const [loaded,   setLoaded]   = useState(false);

  // Inject styles
  useGlobalStyles();

  useEffect(() => {
    apiGet(PIPE_KEY).then(p => { if (p) setPipeline(p); setLoaded(true); });
    const fn = () => { if (!document.hidden) apiGet(PIPE_KEY).then(p => { if (p) setPipeline(p); }); };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, []);

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.t1}}>
      {/* BG */}
      <div style={{position:"fixed",inset:0,backgroundImage:`linear-gradient(rgba(255,215,0,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,215,0,0.022) 1px,transparent 1px)`,backgroundSize:"60px 60px",pointerEvents:"none",zIndex:0}} />
      <div style={{position:"fixed",top:-200,left:"50%",transform:"translateX(-50%)",width:900,height:600,background:`radial-gradient(ellipse,rgba(255,215,0,0.07) 0%,transparent 65%)`,pointerEvents:"none",zIndex:0}} />
      <div style={{position:"fixed",left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,rgba(255,215,0,0.08) 20%,rgba(255,215,0,0.06) 50%,rgba(255,215,0,0.08) 80%,transparent)`,animation:"scanline 7s linear infinite",pointerEvents:"none",zIndex:1}} />

      <div style={{position:"relative",zIndex:2}}>
        {/* Header */}
        <div style={{background:"rgba(0,0,0,0.92)",borderBottom:`2px solid rgba(255,215,0,0.12)`,padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(20px)",boxShadow:`0 0 40px rgba(0,0,0,0.8),0 2px 0 rgba(255,215,0,0.06)`}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:C.gold,animation:"goldDot 2s ease-in-out infinite",flexShrink:0}} />
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:"0.1em",color:C.gold,textShadow:`0 0 14px ${C.goldGlow}`}}>
              JP // CLOSER LIVE
            </span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.t4,letterSpacing:"0.1em"}}>{TODAY_D}</span>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {["eod","pipeline"].map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{padding:"7px 16px",fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",borderRadius:4,cursor:"pointer",border:tab===t?`1px solid ${C.goldBorder}`:`1px solid ${C.border}`,background:tab===t?C.goldDim:"transparent",color:tab===t?C.gold:C.t3,boxShadow:tab===t?`0 0 10px rgba(255,215,0,0.2)`:"none",transition:"all 0.15s",textShadow:tab===t?`0 0 8px ${C.goldGlow}`:"none"}}>
                {t==="eod"?"EOD Tracker":"Pipeline"}
              </button>
            ))}
            <button onClick={()=>onNavigate("setter-live")}
              style={{padding:"7px 14px",fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",color:C.t3,background:"transparent",border:`1px solid ${C.border}`,borderRadius:4,cursor:"pointer",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.target.style.color=C.green;e.target.style.borderColor=C.greenBorder;}}
              onMouseLeave={e=>{e.target.style.color=C.t3;e.target.style.borderColor=C.border;}}>
              Setters →
            </button>
            <button onClick={()=>onNavigate("hub")}
              style={{padding:"7px 14px",fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",color:C.t3,background:"transparent",border:`1px solid ${C.border}`,borderRadius:4,cursor:"pointer",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.target.style.color=C.gold;e.target.style.borderColor=C.goldBorder;}}
              onMouseLeave={e=>{e.target.style.color=C.t3;e.target.style.borderColor=C.border;}}>
              Hub →
            </button>
          </div>
        </div>

        {!loaded
          ? <div style={{padding:80,textAlign:"center",fontFamily:"'DM Mono',monospace",fontSize:12,color:C.t4,letterSpacing:"0.16em"}}>LOADING...</div>
          : tab==="eod"
            ? <CloserEOD pipeline={pipeline} />
            : <CloserPipeline pipeline={pipeline} setGlobalPipeline={setPipeline} />
        }
      </div>
    </div>
  );
}

// feedCloserPipeline lives in src/shared/pipelineUtils.js
// Import it from there in any file that needs it.
