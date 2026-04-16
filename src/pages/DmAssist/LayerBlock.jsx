import { useState, useEffect } from "react";
import { C } from "../../shared/colors.js";
import { LAYER_COLORS } from "./constants.js";
import { stripMarkdown } from "./helpers.js";

export function useStyles() {
  useEffect(() => {
    if (document.getElementById("dm-assist-styles")) return;
    const s = document.createElement("style");
    s.id = "dm-assist-styles";
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
      @keyframes goldDot{0%,100%{box-shadow:0 0 5px 2px rgba(0,170,255,0.9),0 0 12px rgba(0,170,255,0.5)}50%{box-shadow:0 0 9px 4px rgba(0,170,255,1),0 0 22px rgba(0,170,255,0.7)}}
      @keyframes scanline{0%{top:-2px}100%{top:100%}}
      @keyframes dmFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes thinking{0%,80%,100%{opacity:0.2;transform:scale(0.8)}40%{opacity:1;transform:scale(1)}}
      .dm-msg{animation:dmFadeIn 0.2s ease}
      .dm-dot span{width:6px;height:6px;background:#00AAFF;border-radius:50%;display:inline-block;animation:thinking 1.2s ease-in-out infinite}
      .dm-dot span:nth-child(2){animation-delay:0.2s}
      .dm-dot span:nth-child(3){animation-delay:0.4s}
      textarea.dm-input{resize:none;outline:none;scrollbar-width:thin}
      textarea.dm-input::-webkit-scrollbar{width:3px}
      textarea.dm-input::-webkit-scrollbar-thumb{background:#2A2A32;border-radius:2px}
    `;
    document.head.appendChild(s);
  }, []);
}

export default function LayerBlock({ num, content }) {
  const [copied, setCopied] = useState(false);
  const lc = LAYER_COLORS[num];
  const copy = () => {
    navigator.clipboard.writeText(stripMarkdown(content)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };
  return (
    <div style={{ background:lc.bg, border:`1px solid ${lc.border}`, borderRadius:8, overflow:"hidden", marginBottom:8 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 14px", borderBottom:`1px solid ${lc.border}` }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.14em", color:lc.label }}>{lc.tag}</span>
        {num === 2 && (
          <button onClick={copy}
            style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.1em", padding:"3px 10px", borderRadius:3, cursor:"pointer", background:copied?"rgba(0,255,136,0.15)":"transparent", border:`1px solid ${copied?C.greenBorder:C.border}`, color:copied?C.green:C.t3, transition:"all 0.15s" }}>
            {copied ? "COPIED ✓" : "COPY"}
          </button>
        )}
      </div>
      <div style={{ padding:"14px", fontFamily:"'Barlow',sans-serif", fontSize:14, lineHeight:1.75, color:C.t1, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
        {stripMarkdown(content)}
      </div>
    </div>
  );
}
