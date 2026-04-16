import { C } from "../../../shared/colors.js";

export function NbCard({label,children,gold,amber}) {
  const bg=gold?"rgba(255,215,0,0.05)":amber?"rgba(255,184,0,0.04)":C.s1;
  const bc=gold?C.goldBorder:amber?C.amberBorder:C.border;
  const lc=gold?C.gold:amber?C.amber:C.t3;
  return <div style={{background:bg,border:`1.5px solid ${bc}`,borderRadius:8,padding:"15px 18px",display:"flex",flexDirection:"column",gap:8}}>
    <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:lc}}>{label}</span>
    {children}
  </div>;
}
export const NBI={background:"transparent",border:"none",color:C.t1,fontFamily:"'Barlow',sans-serif",fontSize:15,fontWeight:500,width:"100%",outline:"none",padding:0};
export const NBTA={...NBI,resize:"none",minHeight:72,lineHeight:1.65};
