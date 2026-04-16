import { C } from "../../../shared/colors.js";
import { TODAY } from "../../../shared/dateConstants.js";
import { SM } from "../constants.js";

export default function CloserFunnel({pipeline}) {
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
