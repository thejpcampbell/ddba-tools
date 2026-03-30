import { useState, useEffect, useRef, useCallback } from "react";
import { BarChart, LineChart, MultiLineChart, ChartCard, fillRange, fmtCount, fmtPct, fmtMoney, Sparkline, buildRange } from "../shared/Charts.jsx";

const TODAY   = new Date().toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"});
const TODAY_D = new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
const CLOSER_KEY   = "jp";
export const PIPE_KEY = `closer:${CLOSER_KEY}:pipeline`;
const HIST_KEY     = `closer:${CLOSER_KEY}:eod:history`;
const EOD_KEY_FN   = () => `closer:${CLOSER_KEY}:eod:${TODAY}`;
const SETTER_KEYS  = [
  { key:"setter:liz:pipeline",     rep:"Liz"     },
  { key:"setter:chantal:pipeline", rep:"Chantal" },
];

const C = {
  gold:"#FFD700",goldGlow:"rgba(255,215,0,0.8)",goldDim:"rgba(255,215,0,0.12)",goldBorder:"rgba(255,215,0,0.35)",
  green:"#00FF88",greenGlow:"rgba(0,255,136,0.8)",greenDim:"rgba(0,255,136,0.10)",greenBorder:"rgba(0,255,136,0.35)",
  red:"#FF4444",redGlow:"rgba(255,68,68,0.8)",redDim:"rgba(255,68,68,0.10)",redBorder:"rgba(255,68,68,0.35)",
  amber:"#FFB800",amberGlow:"rgba(255,184,0,0.8)",amberDim:"rgba(255,184,0,0.12)",amberBorder:"rgba(255,184,0,0.35)",
  blue:"#44AAFF",blueDim:"rgba(68,170,255,0.10)",blueBorder:"rgba(68,170,255,0.35)",
  orange:"#FF9944",orangeDim:"rgba(255,153,68,0.10)",orangeBorder:"rgba(255,153,68,0.35)",
  purple:"#CC99FF",purpleDim:"rgba(204,153,255,0.10)",purpleBorder:"rgba(204,153,255,0.35)",
  teal:"#00DDCC",tealDim:"rgba(0,221,204,0.10)",tealBorder:"rgba(0,221,204,0.35)",
  t1:"#F5F5F5",t2:"#BEBEBE",t3:"#909090",t4:"#585858",
  bg:"#000000",s1:"#0D0D0D",s2:"#141414",s3:"#1E1E1E",
  border:"#2A2A2A",borderHi:"#484848",
};

export const STAGES = [
  {key:"booked",   label:"Booked",        color:C.gold,  glow:C.goldGlow,  dim:C.goldDim,   border:C.goldBorder,  trap:false},
  {key:"ssTaken",  label:"SS Taken",       color:C.blue,  glow:"rgba(68,170,255,0.8)", dim:C.blueDim,  border:C.blueBorder,  trap:false},
  {key:"noshow",   label:"No-Show",        color:C.red,   glow:C.redGlow,   dim:C.redDim,    border:C.redBorder,   trap:true },
  {key:"cancelled",label:"Cancelled",      color:C.orange,glow:"rgba(255,153,68,0.8)",dim:C.orangeDim,border:C.orangeBorder,trap:false},
  {key:"offer",    label:"Offer Made",     color:"#44AAFF",glow:"rgba(68,170,255,0.8)",dim:C.blueDim, border:C.blueBorder,  trap:false},
  {key:"verbal",   label:"Verbal Yes",     color:C.amber, glow:C.amberGlow, dim:C.amberDim,  border:C.amberBorder, trap:true },
  {key:"deposit",  label:"Deposit",        color:C.purple,glow:"rgba(204,153,255,0.8)",dim:C.purpleDim,border:C.purpleBorder,trap:false},
  {key:"closed",   label:"Closed",         color:C.green, glow:C.greenGlow, dim:C.greenDim,  border:C.greenBorder, trap:false},
  {key:"reoffer",  label:"Re-offer Sched.",color:C.teal,  glow:"rgba(0,221,204,0.8)", dim:C.tealDim,  border:C.tealBorder,  trap:false},
  {key:"handedoff",label:"Handed Off",     color:C.green, glow:C.greenGlow, dim:C.greenDim,  border:C.greenBorder, trap:false},
];
const SM = {};
STAGES.forEach(s => SM[s.key] = s);

// Setter pipeline stages (for unified view)
const SETTER_STAGES = [
  {key:"new",    label:"New DM",      color:"#909090", glow:"rgba(144,144,144,0.6)", dim:"rgba(144,144,144,0.08)", border:"rgba(144,144,144,0.25)", trap:false},
  {key:"opener", label:"Opener Sent", color:"#44AAFF", glow:"rgba(68,170,255,0.6)",  dim:"rgba(68,170,255,0.08)",  border:"rgba(68,170,255,0.25)",  trap:false},
  {key:"pain",   label:"Pain",        color:"#FF9944", glow:"rgba(255,153,68,0.6)",  dim:"rgba(255,153,68,0.08)",  border:"rgba(255,153,68,0.25)",  trap:false},
  {key:"link",   label:"Link Sent",   color:"#CC99FF", glow:"rgba(204,153,255,0.6)", dim:"rgba(204,153,255,0.08)", border:"rgba(204,153,255,0.25)", trap:false},
  {key:"booked", label:"Booked",      color:"#FFD700", glow:"rgba(255,215,0,0.6)",   dim:"rgba(255,215,0,0.08)",   border:"rgba(255,215,0,0.25)",  trap:false},
  {key:"disq",   label:"Disq'd",      color:"#FF4444", glow:"rgba(255,68,68,0.6)",   dim:"rgba(255,68,68,0.08)",   border:"rgba(255,68,68,0.25)",  trap:false},
];
SETTER_STAGES.forEach(s => { if (!SM[s.key]) SM[s.key] = s; });

const SS_STAGES      = ["ssTaken","offer","verbal","deposit","closed","reoffer","handedoff"];
const OFFER_STAGES   = ["offer","verbal","deposit","closed","reoffer","handedoff"];
const CLOSE_STAGES   = ["closed","handedoff"];
const REVENUE_STAGES = ["closed","handedoff","deposit"];
const PROGRAMS       = ["DDBA Academy","DDBA Accelerator","Tier 1","Tier 2","Tier 3","Tier 4","Custom"];
const PAYMENT_TYPES  = ["Stripe","Credit Card","Bank Transfer","Cash","Zelle","Other"];

async function apiGet(key) {
  try { const r=await fetch(`/api/setter?key=${encodeURIComponent(key)}`); if(!r.ok) throw new Error(); return (await r.json()).value??null; }
  catch { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
}
async function apiSet(key,value) {
  try { await fetch("/api/setter",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key,value})}); }
  catch { try { if(value===null) localStorage.removeItem(key); else localStorage.setItem(key,JSON.stringify(value)); } catch {} }
}
async function appendHistory(key,entry) {
  const hist=(await apiGet(key))||[];
  const idx=hist.findIndex(h=>h.date===entry.date);
  const next=idx>-1 ? hist.map((h,i)=>i===idx?entry:h) : [...hist,entry].slice(-90);
  await apiSet(key,next);
}

function useStyles() {
  useEffect(()=>{
    if(document.getElementById("cl-styles")) return;
    const s=document.createElement("style"); s.id="cl-styles";
    s.textContent=`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
@keyframes liveDot{0%,100%{box-shadow:0 0 5px 2px rgba(0,255,136,0.9),0 0 12px rgba(0,255,136,0.5)}50%{box-shadow:0 0 9px 4px rgba(0,255,136,1),0 0 22px rgba(0,255,136,0.7)}}
@keyframes goldDot{0%,100%{box-shadow:0 0 5px 2px rgba(255,215,0,0.9),0 0 12px rgba(255,215,0,0.5)}50%{box-shadow:0 0 9px 4px rgba(255,215,0,1),0 0 22px rgba(255,215,0,0.7)}}
@keyframes amberP{0%,100%{box-shadow:0 0 8px rgba(255,184,0,0.5)}50%{box-shadow:0 0 16px rgba(255,184,0,0.9)}}
@keyframes scanline{0%{top:-2px}100%{top:100%}}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
input[type=number]{-moz-appearance:textfield}`;
    document.head.appendChild(s);
  },[]);
}

function SL({children}) {
  return <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
    <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.22em",textTransform:"uppercase",color:C.t3,whiteSpace:"nowrap"}}>{children}</span>
    <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.border},transparent)`}}/>
  </div>;
}

function NbCard({label,children,gold,amber}) {
  const bg=gold?"rgba(255,215,0,0.05)":amber?"rgba(255,184,0,0.04)":C.s1;
  const bc=gold?C.goldBorder:amber?C.amberBorder:C.border;
  const lc=gold?C.gold:amber?C.amber:C.t3;
  return <div style={{background:bg,border:`1.5px solid ${bc}`,borderRadius:8,padding:"15px 18px",display:"flex",flexDirection:"column",gap:8}}>
    <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:lc}}>{label}</span>
    {children}
  </div>;
}
const NBI={background:"transparent",border:"none",color:C.t1,fontFamily:"'Barlow',sans-serif",fontSize:15,fontWeight:500,width:"100%",outline:"none",padding:0};
const NBTA={...NBI,resize:"none",minHeight:72,lineHeight:1.65};

function KpiTile({label,value,display,color,sub,badge,isOverride,onMinus,onPlus,onReset,sparkData,targetHint}) {
  const [hov,setHov]=useState(false);
  const col=color||C.gold;
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:C.s1,border:`1.5px solid ${isOverride?C.goldBorder:hov?C.borderHi:C.border}`,borderRadius:8,padding:"16px 18px",display:"flex",flexDirection:"column",gap:8,transition:"all 0.15s",boxShadow:isOverride?`0 0 18px ${C.goldDim}`:"none"}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",color:C.t2,flex:1,whiteSpace:"nowrap"}}>{label}</span>
        {badge&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:9,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",padding:"3px 8px",borderRadius:3,flexShrink:0,background:isOverride?C.goldDim:C.greenDim,color:isOverride?C.gold:C.green,border:`1px solid ${isOverride?C.goldBorder:C.greenBorder}`}}>{isOverride?"EDITED":"AUTO"}</span>}
        {badge&&<div style={{display:"flex",gap:3,opacity:hov?1:0,transition:"opacity 0.15s",flexShrink:0}}>
          {[["−","#200000",C.red],["+","#002010",C.green]].map(([sym,bg,c],i)=>(
            <button key={sym} onClick={i===0?onMinus:onPlus} style={{width:24,height:24,borderRadius:3,border:`1px solid ${C.border}`,background:C.s2,color:C.t4,cursor:"pointer",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.1s",lineHeight:1}}
              onMouseEnter={e=>{e.target.style.background=bg;e.target.style.color=c;e.target.style.borderColor=c+"66";}}
              onMouseLeave={e=>{e.target.style.background=C.s2;e.target.style.color=C.t4;e.target.style.borderColor=C.border;}}>{sym}</button>
          ))}
          {isOverride&&<button onClick={onReset} style={{width:24,height:24,borderRadius:3,border:`1px solid ${C.goldBorder}`,background:C.goldDim,color:C.gold,cursor:"pointer",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>↺</button>}
        </div>}
      </div>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:56,fontWeight:900,lineHeight:1,color:col,letterSpacing:"-0.02em",textShadow:`0 0 18px ${col},0 0 36px ${col}55`}}>{display??value??"—"}</div>
        {sparkData&&sparkData.length>1&&<Sparkline data={sparkData} color={col} width={56} height={24}/>}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        {sub&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.t3,letterSpacing:"0.12em",textTransform:"uppercase"}}>{sub}</span>}
        {targetHint&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t4}}>{targetHint}</span>}
      </div>
    </div>
  );
}

function CloserFunnel({pipeline}) {
  const today=pipeline.filter(l=>l.date===TODAY);
  const total=Math.max(today.length,1);
  const display=["booked","ssTaken","offer","deposit","closed","handedoff","noshow","cancelled","verbal"];
  return (
    <div style={{overflowX:"auto"}}>
      <div style={{display:"flex",background:C.s1,borderRadius:8,overflow:"hidden",border:`1.5px solid ${C.border}`,minWidth:680}}>
        {display.map(key=>{
          const s=SM[key]; if(!s) return null;
          const n=today.filter(l=>l.stage===key).length;
          return <div key={key} style={{flex:1,padding:"12px 10px",borderRight:`1px solid ${C.border}`,position:"relative"}}>
            {s.trap&&n>0&&<div style={{position:"absolute",top:6,right:6,width:7,height:7,borderRadius:"50%",background:C.amber,boxShadow:`0 0 8px ${C.amberGlow}`,animation:"amberP 2s ease-in-out infinite"}}/>}
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.t3,marginBottom:5}}>{s.label}</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,fontWeight:900,lineHeight:1,color:s.color,textShadow:`0 0 10px ${s.color}88`}}>{n}</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:s.color,opacity:0.7,marginTop:3}}>{today.length>0?Math.round((n/total)*100)+"%":"—"}</div>
          </div>;
        })}
      </div>
    </div>
  );
}

function CloserGraphs({pipeline,history}) {
  const br=d=>buildRange(30).map(r=>({date:r.date,value:pipeline.filter(l=>l.date===r.date&&d(l)).length}));
  const bookedD  = br(()=>true);
  const ssD      = br(l=>SS_STAGES.includes(l.stage));
  const noshowD  = br(l=>l.stage==="noshow");
  const cancelD  = br(l=>l.stage==="cancelled");
  const closedD  = br(l=>CLOSE_STAGES.includes(l.stage));
  const depositD = br(l=>l.stage==="deposit");
  const revenueD   =(history||[]).map(h=>({date:h.date,value:h.revenue||0}));
  const closeRateD =(history||[]).map(h=>({date:h.date,value:h.closeRate||0}));
  const showRateD  =(history||[]).map(h=>({date:h.date,value:h.showRate||0}));
  const oneCallD   =(history||[]).map(h=>({date:h.date,value:h.oneCallRate||0}));
  const G2={display:"grid",gridTemplateColumns:"1fr 1fr",gap:14};
  const G3={display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14};
  return (
    <div style={{maxWidth:980,margin:"0 auto",padding:"28px 24px"}}>
      <SL>Revenue &amp; Cash — EOD History</SL>
      <div style={{marginBottom:14}}><ChartCard><BarChart data={revenueD} color={C.green} barH={140} label="Revenue Collected / Day" format={fmtMoney}/></ChartCard></div>
      <SL>Performance Rates — EOD History</SL>
      <div style={{...G3,marginBottom:14}}>
        <ChartCard><LineChart data={closeRateD} color={C.green} chartH={120} label="Close Rate" format={fmtPct}/><div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t4,letterSpacing:"0.1em",marginTop:6}}>TARGET ≥70%</div></ChartCard>
        <ChartCard><LineChart data={showRateD}  color={C.blue}  chartH={120} label="Show Rate"  format={fmtPct}/><div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t4,letterSpacing:"0.1em",marginTop:6}}>TARGET ≥75%</div></ChartCard>
        <ChartCard><LineChart data={oneCallD}   color={C.gold}  chartH={120} label="One-Call Close Rate" format={fmtPct}/><div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t4,letterSpacing:"0.1em",marginTop:6}}>TARGET ≥90%</div></ChartCard>
      </div>
      <SL>Pipeline Volume — Live Pipeline Data</SL>
      <div style={{...G2,marginBottom:14}}>
        <ChartCard><BarChart data={bookedD}  color={C.gold}   barH={120} label="Calls Booked / Day"/></ChartCard>
        <ChartCard><BarChart data={ssD}      color={C.blue}   barH={120} label="SS Taken / Day"/></ChartCard>
      </div>
      <div style={{...G3,marginBottom:14}}>
        <ChartCard><BarChart data={closedD}  color={C.green}  barH={110} label="Closes / Day"/></ChartCard>
        <ChartCard><BarChart data={depositD} color={C.purple} barH={110} label="Deposits / Day"/></ChartCard>
        <ChartCard>
          <MultiLineChart series={[{label:"No-Show",color:C.red,data:noshowD},{label:"Cancelled",color:C.orange,data:cancelD}]} chartH={110} label="No-Shows + Cancelled"/>
        </ChartCard>
      </div>
    </div>
  );
}

function CloserEOD({pipeline,history,onHistoryUpdate}) {
  const eodKey=EOD_KEY_FN();
  const [overrides,setOverrides]=useState({scheduled:null,held:null,noshow:null,cancelled:null,ssTaken:null,offers:null,closes:null,oneCall:null,deposits:null});
  const [nb,setNb]=useState({newCash:"",recurCash:"",topObjection:"",biggestWin:"",oneFix:""});
  const [loaded,setLoaded]=useState(false);
  const [reportTxt,setReportTxt]=useState("");
  const [showReport,setShowReport]=useState(false);

  useEffect(()=>{ apiGet(eodKey).then(d=>{ if(d){setOverrides(d.overrides||{scheduled:null,held:null,noshow:null,cancelled:null,ssTaken:null,offers:null,closes:null,oneCall:null,deposits:null}); setNb(d.nb||{newCash:"",recurCash:"",topObjection:"",biggestWin:"",oneFix:""});} setLoaded(true); }); },[]);
  useEffect(()=>{ if(!loaded) return; const t=setTimeout(()=>apiSet(eodKey,{overrides,nb}),700); return()=>clearTimeout(t); },[overrides,nb,loaded]);

  const tl=pipeline.filter(l=>l.date===TODAY);
  const auto={
    scheduled:tl.length, held:tl.filter(l=>SS_STAGES.includes(l.stage)).length,
    noshow:tl.filter(l=>l.stage==="noshow").length, cancelled:tl.filter(l=>l.stage==="cancelled").length,
    ssTaken:tl.filter(l=>SS_STAGES.includes(l.stage)).length, offers:tl.filter(l=>OFFER_STAGES.includes(l.stage)).length,
    closes:tl.filter(l=>CLOSE_STAGES.includes(l.stage)).length, oneCall:tl.filter(l=>CLOSE_STAGES.includes(l.stage)&&l.oneCallClose).length,
    deposits:tl.filter(l=>l.stage==="deposit").length,
  };
  const eff=k=>overrides[k]!==null?overrides[k]:auto[k];
  const ovr=(k,d)=>setOverrides(p=>({...p,[k]:Math.max(0,(p[k]!==null?p[k]:auto[k])+d)}));
  const rst=k=>setOverrides(p=>({...p,[k]:null}));
  const autoRevenue=tl.filter(l=>REVENUE_STAGES.includes(l.stage)&&l.cash).reduce((s,l)=>s+(parseFloat(l.cash)||0),0);
  const held=eff("held")||0, sched=eff("scheduled")||0, closes=eff("closes")||0, oneCall=eff("oneCall")||0;
  const showRate=sched>0?Math.round((held/sched)*100):null;
  const closeRate=held>0?Math.round((closes/held)*100):null;
  const oneCallRate=closes>0?Math.round((oneCall/closes)*100):null;
  const kpiC=(v,t)=>v===null?C.t4:v>=t?C.green:v>=t*0.85?C.amber:C.red;
  const spark=fn=>buildRange(7).map(r=>({date:r.date,value:pipeline.filter(l=>l.date===r.date&&fn(l)).length}));
  const sparkH=k=>(history||[]).slice(-7).map(h=>({date:h.date,value:h[k]||0}));
  const resetDay=()=>{ setOverrides({scheduled:null,held:null,noshow:null,cancelled:null,ssTaken:null,offers:null,closes:null,oneCall:null,deposits:null}); setNb({newCash:"",recurCash:"",topObjection:"",biggestWin:"",oneFix:""}); apiSet(eodKey,null); };

  const pushReport=async()=>{
    const g=k=>(nb[k]||"—").trim()||"—";
    const fmt=n=>n!==null?n+"%":"—";
    const revenue=autoRevenue+(parseFloat(nb.newCash)||0)+(parseFloat(nb.recurCash)||0);
    await appendHistory(HIST_KEY,{date:TODAY,scheduled:sched,held,noshow:eff("noshow"),cancelled:eff("cancelled"),ssTaken:eff("ssTaken"),offers:eff("offers"),closes,oneCall,deposits:eff("deposits"),revenue,closeRate,showRate,oneCallRate});
    if(onHistoryUpdate) onHistoryUpdate();
    setReportTxt([
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,`DDBA // CLOSER EOD REPORT`,`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Date:           ${TODAY}`,`Closer:         JP Campbell`,``,
      `━━ CALL ACTIVITY ━━━━━━━━━━━━━━━━━━━━━━━`,
      `Calls Scheduled:     ${sched}`,`Calls Held / SS:     ${held}`,`No-Shows:            ${eff("noshow")}`,`Cancelled:           ${eff("cancelled")}`,`Show Rate:           ${fmt(showRate)}  [target ≥75%]`,``,
      `━━ PERFORMANCE ━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Offers Made:         ${eff("offers")}`,`Deposits:            ${eff("deposits")}`,`Closes:              ${closes}`,`One-Call Closes:     ${oneCall}`,`Close Rate:          ${fmt(closeRate)}  [target ≥70%]`,`One-Call Close Rate: ${fmt(oneCallRate)}  [target ≥90%]`,``,
      `━━ REVENUE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Cash from Pipeline:  ${autoRevenue>0?"$"+autoRevenue.toLocaleString():"$0"}`,`New Cash:            ${g("newCash")}`,`Recurring Cash:      ${g("recurCash")}`,``,
      `━━ INTEL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Top Objection:       ${g("topObjection")}`,`Biggest Win:         ${g("biggestWin")}`,``,
      `━━ ONE FIX FOR TOMORROW ━━━━━━━━━━━━━━━━`,g("oneFix"),`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ].join("\n"));
    setShowReport(true);
  };

  if(!loaded) return <div style={{padding:60,textAlign:"center",fontFamily:"'DM Mono',monospace",fontSize:12,color:C.t4,letterSpacing:"0.16em"}}>SYNCING...</div>;
  const G3={display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12};
  const G2={display:"grid",gridTemplateColumns:"1fr 1fr",gap:12};

  return (
    <div style={{maxWidth:980,margin:"0 auto",padding:"28px 24px"}}>
      <SL>Pipeline Funnel — Today</SL>
      <div style={{marginBottom:10}}><CloserFunnel pipeline={pipeline}/></div>
      {tl.filter(l=>l.stage==="verbal").length>0&&(
        <div style={{marginBottom:12,padding:"9px 16px",background:"rgba(255,184,0,0.06)",border:`1px solid ${C.amberBorder}`,borderRadius:6,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:C.amber,boxShadow:`0 0 8px ${C.amberGlow}`,flexShrink:0,animation:"amberP 2s ease-in-out infinite"}}/>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,color:C.amber,letterSpacing:"0.1em"}}>{tl.filter(l=>l.stage==="verbal").length} VERBAL YES — AGREED BUT NOT PAID. NOT A CLOSE.</span>
        </div>
      )}
      <div style={{marginBottom:24}}/>
      <SL>Call Activity — Auto-Pulled from Pipeline</SL>
      <div style={{...G3,marginBottom:12}}>
        <KpiTile label="Calls Booked"  value={sched}          color={C.gold}    sub="Today's calendar"   badge isOverride={overrides.scheduled!==null} onMinus={()=>ovr("scheduled",-1)} onPlus={()=>ovr("scheduled",1)} onReset={()=>rst("scheduled")} sparkData={spark(()=>true)}/>
        <KpiTile label="SS Taken"      value={held}           color={C.blue}    sub="Call held"           badge isOverride={overrides.held!==null}      onMinus={()=>ovr("held",-1)}      onPlus={()=>ovr("held",1)}      onReset={()=>rst("held")}      sparkData={spark(l=>SS_STAGES.includes(l.stage))}/>
        <KpiTile label="No-Shows"      value={eff("noshow")}  color={C.red}     sub="No notice"           badge isOverride={overrides.noshow!==null}    onMinus={()=>ovr("noshow",-1)}    onPlus={()=>ovr("noshow",1)}    onReset={()=>rst("noshow")}    sparkData={spark(l=>l.stage==="noshow")}/>
      </div>
      <div style={{...G3,marginBottom:24}}>
        <KpiTile label="Cancelled"     value={eff("cancelled")} color={C.orange}  sub="With notice"        badge isOverride={overrides.cancelled!==null} onMinus={()=>ovr("cancelled",-1)} onPlus={()=>ovr("cancelled",1)} onReset={()=>rst("cancelled")} sparkData={spark(l=>l.stage==="cancelled")}/>
        <KpiTile label="Offers Made"   value={eff("offers")}  color={"#44AAFF"} sub="Pitched today"       badge isOverride={overrides.offers!==null}    onMinus={()=>ovr("offers",-1)}    onPlus={()=>ovr("offers",1)}    onReset={()=>rst("offers")}    sparkData={spark(l=>OFFER_STAGES.includes(l.stage))}/>
        <KpiTile label="Deposits"      value={eff("deposits")} color={C.purple}  sub="Payment plan 1st"   badge isOverride={overrides.deposits!==null}  onMinus={()=>ovr("deposits",-1)}  onPlus={()=>ovr("deposits",1)}  onReset={()=>rst("deposits")}  sparkData={spark(l=>l.stage==="deposit")}/>
      </div>
      <SL>Performance KPIs — Live vs Targets</SL>
      <div style={{...G3,marginBottom:12}}>
        {[["Show Rate",showRate,75,"HELD/SCHED","TARGET ≥75%","showRate"],["Close Rate",closeRate,70,"CLOSES/HELD","TARGET ≥70%","closeRate"],["1-Call Close",oneCallRate,90,"1-CALL/CLOSES","TARGET ≥90%","oneCallRate"]].map(([lbl,val,tgt,sub,hint,hk])=>(
          <div key={lbl} style={{background:C.s1,border:`1.5px solid ${C.border}`,borderRadius:8,padding:"16px 18px",display:"flex",flexDirection:"column",gap:8}}>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",color:C.t2}}>{lbl}</span>
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:56,fontWeight:900,lineHeight:1,color:kpiC(val,tgt),textShadow:`0 0 18px ${kpiC(val,tgt)},0 0 36px ${kpiC(val,tgt)}55`}}>{val!==null?val+"%":"—"}</span>
              <Sparkline data={sparkH(hk)} color={kpiC(val,tgt)} width={56} height={24}/>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.t3,letterSpacing:"0.1em",textTransform:"uppercase"}}>{sub}</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t4}}>{hint}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{...G3,marginBottom:24}}>
        <KpiTile label="Closes"          value={closes}  color={C.green} sub="Full payment"   badge isOverride={overrides.closes!==null}  onMinus={()=>ovr("closes",-1)}  onPlus={()=>ovr("closes",1)}  onReset={()=>rst("closes")}  sparkData={spark(l=>CLOSE_STAGES.includes(l.stage))}/>
        <KpiTile label="One-Call Closes" value={oneCall} color={C.green} sub="Same-day close"  badge isOverride={overrides.oneCall!==null} onMinus={()=>ovr("oneCall",-1)} onPlus={()=>ovr("oneCall",1)} onReset={()=>rst("oneCall")} sparkData={spark(l=>CLOSE_STAGES.includes(l.stage)&&l.oneCallClose)}/>
        <div style={{background:"rgba(0,255,136,0.04)",border:`1.5px solid ${C.greenBorder}`,borderRadius:8,padding:"16px 18px",display:"flex",flexDirection:"column",gap:8}}>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",color:C.t2}}>Revenue (Pipeline)</span>
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:44,fontWeight:900,lineHeight:1,color:autoRevenue>0?C.green:C.t4,textShadow:autoRevenue>0?`0 0 20px ${C.green},0 0 40px rgba(0,255,136,0.4)`:"none"}}>{autoRevenue>0?"$"+autoRevenue.toLocaleString():"$0"}</span>
            <Sparkline data={(history||[]).slice(-7).map(h=>({date:h.date,value:h.revenue||0}))} color={C.green} width={56} height={24}/>
          </div>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t4,letterSpacing:"0.1em",textTransform:"uppercase"}}>FROM PIPELINE TODAY</span>
        </div>
      </div>
      <SL>Revenue Breakdown</SL>
      <div style={{marginBottom:24}}>
        <div style={{background:"rgba(0,255,136,0.04)",border:`1.5px solid ${C.greenBorder}`,borderRadius:8,padding:"18px 20px",display:"flex",alignItems:"center",gap:24}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:C.t3,marginBottom:6}}>Cash from Pipeline (auto)</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:40,fontWeight:900,lineHeight:1,color:autoRevenue>0?C.green:C.t4}}>{autoRevenue>0?"$"+autoRevenue.toLocaleString():"$0"}</div>
          </div>
          <div style={{width:1,height:50,background:C.border}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,flex:1}}>
            {[["New Cash","newCash"],["Recurring Cash","recurCash"]].map(([lbl,k])=>(
              <div key={k}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t3,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6}}>{lbl}</div>
                <input value={nb[k]} onChange={e=>setNb(p=>({...p,[k]:e.target.value}))} placeholder="$0" style={{background:"transparent",border:"none",color:C.t1,fontFamily:"'Bebas Neue',sans-serif",fontSize:26,fontWeight:900,width:"100%",outline:"none",padding:0}}/>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SL>Notebook — Manual Fields</SL>
      <div style={{...G2,marginBottom:12}}>
        <NbCard label="Top Objection Today" amber><input style={NBI} value={nb.topObjection} onChange={e=>setNb(p=>({...p,topObjection:e.target.value}))} placeholder="What came up most on calls today?"/></NbCard>
        <NbCard label="Biggest Win Today"><input style={NBI} value={nb.biggestWin} onChange={e=>setNb(p=>({...p,biggestWin:e.target.value}))} placeholder="Best moment, breakthrough, or result..."/></NbCard>
      </div>
      <div style={{marginBottom:24}}>
        <NbCard label="⚡ One Fix for Tomorrow" gold><textarea style={{...NBTA,fontSize:15}} value={nb.oneFix} onChange={e=>setNb(p=>({...p,oneFix:e.target.value}))} placeholder="What specifically did not work today — and what specifically changes tomorrow? Not a placeholder. Something real."/></NbCard>
      </div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        <button onClick={pushReport} style={{flex:2,minWidth:200,padding:"18px 0",fontFamily:"'Bebas Neue',sans-serif",fontSize:20,fontWeight:900,letterSpacing:"0.18em",background:`linear-gradient(135deg,#FFE566,${C.gold},#CC8800,${C.gold})`,color:"#000",border:"none",borderRadius:6,cursor:"pointer",boxShadow:`0 0 28px ${C.goldGlow},0 0 56px rgba(255,215,0,0.25)`,transition:"all 0.2s"}}
          onMouseEnter={e=>{e.target.style.boxShadow=`0 0 48px ${C.goldGlow},0 0 90px rgba(255,215,0,0.4)`;e.target.style.transform="translateY(-2px)";}}
          onMouseLeave={e=>{e.target.style.boxShadow=`0 0 28px ${C.goldGlow},0 0 56px rgba(255,215,0,0.25)`;e.target.style.transform="none";}}>⬆ PUSH EOD REPORT</button>
        <button style={{flex:1,minWidth:110,padding:"18px 0",fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:"0.14em",background:"transparent",border:`2px solid ${C.border}`,color:C.t2,borderRadius:6,cursor:"pointer",transition:"all 0.15s"}}
          onMouseEnter={e=>{e.target.style.borderColor=C.borderHi;e.target.style.color=C.t1;}} onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.t2;}}>SAVE DRAFT</button>
        <button onClick={()=>{if(window.confirm("Reset today? Pipeline data not affected.")) resetDay();}} style={{flex:1,minWidth:110,padding:"18px 0",fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:"0.14em",background:"transparent",border:`2px solid ${C.redBorder}`,color:C.red,borderRadius:6,cursor:"pointer",transition:"all 0.15s"}}
          onMouseEnter={e=>{e.target.style.background=C.redDim;}} onMouseLeave={e=>{e.target.style.background="transparent";}}>RESET DAY</button>
      </div>
      {showReport&&(
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
              <button onClick={()=>navigator.clipboard.writeText(reportTxt).catch(()=>{})} style={{flex:1,padding:"13px 0",fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:"0.14em",background:`linear-gradient(135deg,${C.gold},#CC8800)`,color:"#000",border:"none",borderRadius:5,cursor:"pointer",boxShadow:`0 0 20px ${C.goldGlow}`}}>COPY TO CLIPBOARD</button>
              <button onClick={()=>{navigator.clipboard.writeText(reportTxt).catch(()=>{}); setShowReport(false); resetDay();}} style={{flex:1,padding:"13px 0",fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:"0.14em",background:"transparent",border:`2px solid ${C.redBorder}`,color:C.red,borderRadius:5,cursor:"pointer"}}>COPY + RESET DAY</button>
              <button onClick={()=>setShowReport(false)} style={{padding:"13px 16px",fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:"0.12em",background:"transparent",border:`2px solid ${C.border}`,color:C.t3,borderRadius:5,cursor:"pointer"}}>CLOSE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CloserPipeline({pipeline,setGlobalPipeline,setterLeads=[]}) {
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState(makeEmpty());
  const [editId,setEditId]=useState(null);
  const [stageFilter,setStageFilter]=useState(null);
  const [repFilter,setRepFilter]=useState("all"); // all | liz | chantal | jp
  const [errH,setErrH]=useState(false);
  const [errCash,setErrCash]=useState(false);
  const leadsRef=useRef([]);
  useEffect(()=>{leadsRef.current=pipeline;},[pipeline]);

  function makeEmpty(){return{date:TODAY,name:"",handle:"",closer:"JP Campbell",program:"",cash:"",paymentMethod:"",callTime:"",objection:"",oneCallClose:false,setterName:"",notes:"",stage:"booked"};}
  const persist=next=>{apiSet(PIPE_KEY,next); setGlobalPipeline(next);};
  const save=()=>{
    if(!form.handle.trim()){setErrH(true);return;}
    if(["closed","handedoff","deposit"].includes(form.stage)&&!form.cash.trim()){setErrCash(true);return;}
    setErrH(false); setErrCash(false);
    const cur=leadsRef.current;
    const next=editId!==null?cur.map(l=>l.id===editId?{...l,...form}:l):[...cur,{...form,id:Date.now()}];
    leadsRef.current=next; persist(next); setShowAdd(false); setEditId(null); setForm(makeEmpty());
  };
  const del=id=>{if(!window.confirm("Remove?"))return; const n=leadsRef.current.filter(l=>l.id!==id); leadsRef.current=n; persist(n);};
  const startEdit=l=>{setForm({...makeEmpty(),...l}); setEditId(l.id); setErrH(false); setErrCash(false); setShowAdd(true);};
  const openAdd=()=>{setForm(makeEmpty()); setEditId(null); setErrH(false); setErrCash(false); setShowAdd(true);};

  // Merge all leads with source tags
  const closerTagged  = pipeline.map(l=>({...l, _rep:"JP", _source:"closer"}));
  const allLeads      = [...closerTagged, ...setterLeads].sort((a,b)=>b.id-a.id);

  // Apply filters
  const visible = allLeads.filter(l => {
    const repOk = repFilter==="all" || l._rep?.toLowerCase()===repFilter;
    const stageOk = !stageFilter || l.stage===stageFilter;
    return repOk && stageOk;
  });

  // Stats row
  const total    = allLeads.length;
  const todayAll = allLeads.filter(l=>l.date===TODAY).length;

  const pill=key=>{const s=SM[key]||{label:key,color:C.t4,dim:"transparent",border:C.border,glow:"transparent",trap:false}; return <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"3px 9px",borderRadius:3,background:s.dim,color:s.color,border:`1px solid ${s.border}`,whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:5}}>{s.trap&&<span style={{width:5,height:5,borderRadius:"50%",background:s.color,display:"inline-block"}}/>}{s.label}</span>;};

  const repPill=(rep,source)=>{
    const colors={Liz:C.green,Chantal:"#44AAFF",JP:C.gold};
    const col=colors[rep]||C.t3;
    return <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"2px 7px",borderRadius:3,background:`${col}15`,color:col,border:`1px solid ${col}30`,whiteSpace:"nowrap"}}>{rep}</span>;
  };

  const FI={background:C.s2,border:`1.5px solid ${C.border}`,borderRadius:5,padding:"10px 13px",fontSize:14,color:C.t1,fontFamily:"'Barlow',sans-serif",width:"100%",outline:"none",boxSizing:"border-box",transition:"border-color 0.15s"};
  const SEL={...FI,cursor:"pointer",appearance:"none",WebkitAppearance:"none"};

  return (
    <div style={{padding:"0 24px 28px",maxWidth:1100,margin:"0 auto"}}>

      {/* Stats bar */}
      <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:14,padding:"10px 16px",background:C.s1,borderRadius:6,border:`1px solid ${C.border}`}}>
        {[["Total Leads",total,C.t2],["Today",todayAll,C.gold],["Liz",setterLeads.filter(l=>l._rep==="Liz").length,C.green],["Chantal",setterLeads.filter(l=>l._rep==="Chantal").length,"#44AAFF"],["JP Pipeline",pipeline.length,C.gold]].map(([lbl,val,col])=>(
          <div key={lbl} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,fontWeight:900,color:col,lineHeight:1,textShadow:`0 0 10px ${col}66`}}>{val}</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:8,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:C.t4}}>{lbl}</span>
          </div>
        ))}
        <div style={{flex:1}}/>
        <button onClick={openAdd} style={{padding:"9px 20px",fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:"0.14em",background:`linear-gradient(135deg,${C.gold},#CC8800)`,color:"#000",border:"none",borderRadius:5,cursor:"pointer",boxShadow:`0 0 16px ${C.goldGlow}`,flexShrink:0}}>+ ADD LEAD</button>
      </div>

      {/* Filters */}
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:12}}>
        {/* Rep filter */}
        <div style={{display:"flex",gap:5,marginRight:8}}>
          {[["all","ALL",C.gold],["liz","LIZ",C.green],["chantal","CHANTAL","#44AAFF"],["jp","JP",C.gold]].map(([val,lbl,col])=>(
            <button key={val} onClick={()=>setRepFilter(val)}
              style={{padding:"5px 11px",fontFamily:"'DM Mono',monospace",fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",borderRadius:4,cursor:"pointer",background:repFilter===val?`${col}18`:"transparent",color:repFilter===val?col:C.t4,border:`1px solid ${repFilter===val?col+"55":C.border}`,transition:"all 0.1s"}}>
              {lbl}
            </button>
          ))}
        </div>
        <div style={{width:1,height:20,background:C.border}}/>
        {/* Stage filter */}
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          <button onClick={()=>setStageFilter(null)} style={{padding:"4px 9px",fontFamily:"'DM Mono',monospace",fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",borderRadius:3,cursor:"pointer",background:!stageFilter?C.goldDim:"transparent",color:!stageFilter?C.gold:C.t4,border:`1px solid ${!stageFilter?C.goldBorder:C.border}`,transition:"all 0.1s"}}>ALL STAGES</button>
          {[...STAGES,...SETTER_STAGES.filter(s=>!SM[s.key]||s.key==="new"||s.key==="opener"||s.key==="pain"||s.key==="link"||s.key==="disq")].map(s=>(
            <button key={s.key} onClick={()=>setStageFilter(s.key===stageFilter?null:s.key)}
              style={{padding:"4px 9px",fontFamily:"'DM Mono',monospace",fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",borderRadius:3,cursor:"pointer",background:stageFilter===s.key?s.dim:"transparent",color:stageFilter===s.key?s.color:C.t4,border:`1px solid ${stageFilter===s.key?s.border:C.border}`,transition:"all 0.1s"}}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Unified table */}
      <div style={{overflowX:"auto",background:C.s1,border:`1.5px solid ${C.border}`,borderRadius:8}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:960}}>
          <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>
            {["Date","Rep","Prospect","Stage","Cash","1-Call","KW / Program","Objection / Notes",""].map(h=><th key={h} style={{padding:"11px 12px",fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:C.t3,textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {visible.map((l,i)=>{
              const isCloser=l._source==="closer";
              const rowBg=l.stage==="verbal"?"rgba(255,184,0,0.02)":"transparent";
              return (
                <tr key={`${l._source}-${l.id}-${i}`}
                  style={{borderBottom:`1px solid ${C.s3}`,background:rowBg,transition:"background 0.1s",borderLeft:isCloser?`2px solid rgba(255,215,0,0.15)`:`2px solid rgba(68,170,255,0.1)`}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.s2}
                  onMouseLeave={e=>e.currentTarget.style.background=rowBg}>
                  <td style={{padding:"9px 12px",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.t3,whiteSpace:"nowrap"}}>{l.date}</td>
                  <td style={{padding:"9px 12px"}}>{repPill(l._rep,l._source)}</td>
                  <td style={{padding:"9px 12px"}}>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:"0.08em",color:C.t1,whiteSpace:"nowrap"}}>{l.name||l.handle}</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.t4}}>{l.handle}</div>
                  </td>
                  <td style={{padding:"9px 12px"}}>{pill(l.stage)}</td>
                  <td style={{padding:"9px 12px",fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:l.cash?C.green:C.t4,textShadow:l.cash?`0 0 8px rgba(0,255,136,0.5)`:"none",whiteSpace:"nowrap"}}>{l.cash?"$"+parseFloat(l.cash).toLocaleString():"—"}</td>
                  <td style={{padding:"9px 12px",textAlign:"center"}}>
                    {isCloser
                      ? <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,padding:"3px 7px",borderRadius:3,background:l.oneCallClose?C.greenDim:"transparent",color:l.oneCallClose?C.green:C.t4,border:`1px solid ${l.oneCallClose?C.greenBorder:C.border}`}}>{l.oneCallClose?"YES":"—"}</span>
                      : <span style={{color:C.t4,fontSize:11}}>—</span>
                    }
                  </td>
                  <td style={{padding:"9px 12px",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.t3,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.kw||l.program||"—"}</td>
                  <td style={{padding:"9px 12px",fontSize:12,color:C.t3,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.objection||l.notes||"—"}</td>
                  <td style={{padding:"9px 12px",whiteSpace:"nowrap"}}>
                    {isCloser ? (
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>startEdit(l)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:4,padding:"4px 9px",color:C.t3,cursor:"pointer",fontSize:11,fontFamily:"'DM Mono',monospace",transition:"all 0.1s"}} onMouseEnter={e=>{e.target.style.borderColor=C.gold;e.target.style.color=C.gold;}} onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.t3;}}>EDIT</button>
                        <button onClick={()=>del(l.id)} style={{background:"none",border:`1px solid ${C.redBorder}`,borderRadius:4,padding:"4px 9px",color:C.red,cursor:"pointer",fontSize:11,fontFamily:"'DM Mono',monospace",transition:"all 0.1s"}} onMouseEnter={e=>{e.target.style.background=C.redDim;}} onMouseLeave={e=>{e.target.style.background="none";}}>✕</button>
                      </div>
                    ) : (
                      <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t4,letterSpacing:"0.1em"}}>READ-ONLY</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {visible.length===0&&<tr><td colSpan={9} style={{padding:"48px 14px",textAlign:"center",fontFamily:"'DM Mono',monospace",fontSize:12,color:C.t4,letterSpacing:"0.14em"}}>NO LEADS MATCH CURRENT FILTERS</td></tr>}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT modal — closer leads only */}
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:500,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"24px 20px",backdropFilter:"blur(8px)",overflowY:"auto"}}>
          <div style={{background:C.s1,border:`2px solid ${C.border}`,borderRadius:10,maxWidth:560,width:"100%",animation:"fadeIn 0.2s ease"}}>
            <div style={{padding:"20px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:"0.12em",color:C.gold,textShadow:`0 0 14px ${C.goldGlow}`}}>{editId!==null?"EDIT LEAD":"NEW CLOSER LEAD"}</span>
              <button onClick={()=>{setShowAdd(false);setEditId(null);}} style={{background:"none",border:"none",color:C.t3,fontSize:20,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:24,display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:C.t3,textTransform:"uppercase",marginBottom:8}}>Stage</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {STAGES.map(s=><button key={s.key} onClick={()=>setForm(p=>({...p,stage:s.key}))} style={{padding:"10px 8px",fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",borderRadius:5,cursor:"pointer",textAlign:"center",background:form.stage===s.key?s.dim:"transparent",color:form.stage===s.key?s.color:C.t3,border:`2px solid ${form.stage===s.key?s.color:C.border}`,boxShadow:form.stage===s.key?`0 0 12px ${s.glow}55`:"none",transition:"all 0.12s"}}>{s.label}</button>)}
                </div>
                {form.stage==="verbal"&&<div style={{marginTop:8,padding:"8px 12px",background:C.amberDim,border:`1px solid ${C.amberBorder}`,borderRadius:4,fontFamily:"'DM Mono',monospace",fontSize:10,color:C.amber,letterSpacing:"0.1em",fontWeight:700}}>⚠ VERBAL YES ≠ A CLOSE. LOG PAYMENT WHEN COLLECTED.</div>}
              </div>
              {[["date","Date","MM/DD/YYYY"],["name","Full Name",""],["handle","Handle *","@username"],["callTime","Call Date + Time",""],["setterName","Setter Who Booked",""]].map(([k,lbl,ph])=>(
                <div key={k}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:k==="handle"&&errH?C.red:C.t3,textTransform:"uppercase",marginBottom:6}}>{lbl}</div>
                  <input value={form[k]||""} onChange={e=>{setForm(p=>({...p,[k]:e.target.value}));if(k==="handle")setErrH(false);}} placeholder={ph} style={{...FI,borderColor:k==="handle"&&errH?C.redBorder:C.border}} onFocus={e=>e.target.style.borderColor=C.goldBorder} onBlur={e=>e.target.style.borderColor=k==="handle"&&errH?C.redBorder:C.border}/>
                  {k==="handle"&&errH&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.red,marginTop:4}}>Handle is required.</div>}
                </div>
              ))}
              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:C.t3,textTransform:"uppercase",marginBottom:6}}>Program</div>
                <select value={form.program||""} onChange={e=>setForm(p=>({...p,program:e.target.value}))} style={SEL}><option value="">Select...</option>{PROGRAMS.map(p=><option key={p} value={p}>{p}</option>)}</select>
              </div>
              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:errCash?C.red:["closed","handedoff","deposit"].includes(form.stage)?C.green:C.t3,textTransform:"uppercase",marginBottom:6}}>Cash Collected ($){["closed","handedoff","deposit"].includes(form.stage)&&<span style={{color:C.red}}> *</span>}</div>
                <input value={form.cash||""} onChange={e=>{setForm(p=>({...p,cash:e.target.value}));setErrCash(false);}} placeholder="0.00" style={{...FI,borderColor:errCash?C.redBorder:["closed","handedoff","deposit"].includes(form.stage)?C.greenBorder:C.border,color:form.cash?C.green:C.t1,fontFamily:"'Bebas Neue',sans-serif",fontSize:22,fontWeight:900}}/>
                {errCash&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.red,marginTop:4}}>Cash required. Revenue is collected — not agreed to.</div>}
              </div>
              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:C.t3,textTransform:"uppercase",marginBottom:6}}>Payment Method</div>
                <select value={form.paymentMethod||""} onChange={e=>setForm(p=>({...p,paymentMethod:e.target.value}))} style={SEL}><option value="">Select...</option>{PAYMENT_TYPES.map(m=><option key={m} value={m}>{m}</option>)}</select>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <button onClick={()=>setForm(p=>({...p,oneCallClose:!p.oneCallClose}))} style={{width:44,height:24,borderRadius:12,background:form.oneCallClose?C.green:"#1a1a1a",border:`1.5px solid ${form.oneCallClose?C.greenBorder:C.border}`,cursor:"pointer",position:"relative",transition:"all 0.2s",flexShrink:0,boxShadow:form.oneCallClose?`0 0 12px ${C.greenGlow}`:"none"}}>
                  <div style={{position:"absolute",top:2,left:form.oneCallClose?22:2,width:16,height:16,borderRadius:"50%",background:form.oneCallClose?C.green:C.t4,transition:"all 0.2s"}}/>
                </button>
                <div><div style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:"0.14em",color:form.oneCallClose?C.green:C.t3,textTransform:"uppercase"}}>One-Call Close</div><div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.t4}}>Closed and collected on this call</div></div>
              </div>
              {[["objection","Objection","Main objection from this call"],["notes","Notes","Anything relevant"]].map(([k,lbl,ph])=>(
                <div key={k}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",color:C.t3,textTransform:"uppercase",marginBottom:6}}>{lbl}</div>
                  <input value={form[k]||""} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={FI} onFocus={e=>e.target.style.borderColor=C.goldBorder} onBlur={e=>e.target.style.borderColor=C.border}/>
                </div>
              ))}
            </div>
            <div style={{padding:"16px 24px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10}}>
              <button onClick={save} style={{flex:1,padding:"14px 0",fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:"0.14em",background:`linear-gradient(135deg,${C.gold},#CC8800)`,color:"#000",border:"none",borderRadius:5,cursor:"pointer",boxShadow:`0 0 20px ${C.goldGlow}`}}>SAVE</button>
              <button onClick={()=>{setShowAdd(false);setEditId(null);}} style={{padding:"14px 18px",fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:"0.12em",background:"transparent",border:`2px solid ${C.border}`,color:C.t3,borderRadius:5,cursor:"pointer"}}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CloserLive({onNavigate}) {
  useStyles();
  const [tab,setPipeline2]=useState("eod");
  const setTab=setPipeline2;
  const [pipeline,setPipeline]=useState([]);
  const [setterLeads,setSetterLeads]=useState([]);
  const [history,setHistory]=useState([]);
  const [loaded,setLoaded]=useState(false);

  const loadAll = useCallback(() => {
    Promise.all([
      apiGet(PIPE_KEY),
      apiGet(HIST_KEY),
      ...SETTER_KEYS.map(s => apiGet(s.key).then(d => ({ data:d, rep:s.rep }))),
    ]).then(([p, h, ...setterResults]) => {
      if (p) setPipeline(p);
      if (h) setHistory(h);
      // Merge setter leads with rep label
      const merged = setterResults.flatMap(r =>
        (r.data || []).map(l => ({ ...l, _rep: r.rep, _source:"setter" }))
      );
      setSetterLeads(merged);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    loadAll();
    const fn = () => { if (!document.hidden) loadAll(); };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [loadAll]);

  const refreshHistory=useCallback(()=>{apiGet(HIST_KEY).then(h=>{if(h)setHistory(h);});},[]);

  const TABS=[{key:"eod",label:"EOD Tracker"},{key:"pipeline",label:"Pipeline"},{key:"graphs",label:"📈 Graphs"}];

  return (
    <div style={{minHeight:"100vh",background:"#000000",color:C.t1}}>
      <div style={{position:"fixed",inset:0,backgroundImage:`linear-gradient(rgba(255,215,0,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,215,0,0.022) 1px,transparent 1px)`,backgroundSize:"60px 60px",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",top:-200,left:"50%",transform:"translateX(-50%)",width:900,height:600,background:`radial-gradient(ellipse,rgba(255,215,0,0.07) 0%,transparent 65%)`,pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,rgba(255,215,0,0.08) 20%,rgba(255,215,0,0.06) 50%,rgba(255,215,0,0.08) 80%,transparent)`,animation:"scanline 7s linear infinite",pointerEvents:"none",zIndex:1}}/>
      <div style={{position:"relative",zIndex:2}}>
        <div style={{background:"rgba(0,0,0,0.92)",borderBottom:`2px solid rgba(255,215,0,0.12)`,padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(20px)"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:C.gold,animation:"goldDot 2s ease-in-out infinite",flexShrink:0}}/>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:"0.1em",color:C.gold,textShadow:`0 0 14px ${C.goldGlow}`}}>JP // CLOSER LIVE</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.t4,letterSpacing:"0.1em"}}>{TODAY_D}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {TABS.map(t=><button key={t.key} onClick={()=>setTab(t.key)} style={{padding:"7px 14px",fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",borderRadius:4,cursor:"pointer",border:tab===t.key?`1px solid ${C.goldBorder}`:`1px solid ${C.border}`,background:tab===t.key?C.goldDim:"transparent",color:tab===t.key?C.gold:C.t3,boxShadow:tab===t.key?`0 0 10px rgba(255,215,0,0.2)`:"none",transition:"all 0.15s"}}>{t.label}</button>)}
            <button onClick={()=>onNavigate("hub")} style={{padding:"7px 14px",fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",color:C.t3,background:"transparent",border:`1px solid ${C.border}`,borderRadius:4,cursor:"pointer",transition:"all 0.15s"}} onMouseEnter={e=>{e.target.style.color=C.gold;e.target.style.borderColor=C.goldBorder;}} onMouseLeave={e=>{e.target.style.color=C.t3;e.target.style.borderColor=C.border;}}>Hub →</button>
          </div>
        </div>
        {!loaded
          ? <div style={{padding:80,textAlign:"center",fontFamily:"'DM Mono',monospace",fontSize:12,color:C.t4,letterSpacing:"0.16em"}}>LOADING...</div>
          : tab==="eod"      ? <CloserEOD pipeline={pipeline} history={history} onHistoryUpdate={refreshHistory}/>
          : tab==="pipeline" ? <CloserPipeline pipeline={pipeline} setGlobalPipeline={setPipeline} setterLeads={setterLeads}/>
          : <CloserGraphs pipeline={pipeline} history={history}/>
        }
      </div>
    </div>
  );
}
