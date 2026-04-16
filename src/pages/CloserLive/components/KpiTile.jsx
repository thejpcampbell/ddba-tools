import { useState } from "react";
import { C } from "../../../shared/colors.js";
import { Sparkline } from "../../../shared/Charts.jsx";

export default function KpiTile({label,value,display,color,sub,badge,isOverride,onMinus,onPlus,onReset,sparkData,targetHint}) {
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
