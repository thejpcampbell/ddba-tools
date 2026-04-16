import { useState, useEffect, useRef } from "react";
import { C } from "../../../shared/colors.js";
import { TODAY } from "../../../shared/dateConstants.js";
import { apiSet } from "../../../shared/api.js";
import { STAGES, SETTER_STAGES, SM, PROGRAMS, PAYMENT_TYPES, PIPE_KEY } from "../constants.js";

export default function CloserPipeline({pipeline,setGlobalPipeline,setterLeads=[]}) {
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
