import { useState, useMemo } from "react";

// ── DATE HELPERS ──────────────────────────────────────────────────────────
export function buildRange(days) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const m   = (d.getMonth()+1).toString().padStart(2,"0");
    const day = d.getDate().toString().padStart(2,"0");
    const y   = d.getFullYear();
    result.push({
      date:  `${m}/${day}/${y}`,
      label: `${parseInt(m)}/${parseInt(day)}`,
    });
  }
  return result;
}

export function fillRange(data, days) {
  const range = buildRange(days);
  return range.map(r => {
    const found = (data||[]).find(x => x.date === r.date);
    return { ...r, value: found ? (found.value ?? 0) : 0 };
  });
}

export const fmtCount = v => String(Math.round(v||0));
export const fmtPct   = v => Math.round(v||0) + "%";
export const fmtMoney = v => {
  const n = v||0;
  if (n >= 1000000) return "$" + (n/1000000).toFixed(1) + "M";
  if (n >= 1000)    return "$" + (n/1000).toFixed(1) + "K";
  return "$" + Math.round(n);
};

// ── RANGE TOGGLE ──────────────────────────────────────────────────────────
function RangeToggle({ range, setRange }) {
  return (
    <div style={{ display:"flex", gap:3 }}>
      {[7,30].map(d => (
        <button key={d} onClick={() => setRange(d)} style={{
          fontFamily:"'DM Mono',monospace", fontSize:9, fontWeight:700,
          letterSpacing:"0.1em", padding:"3px 8px", borderRadius:3, cursor:"pointer",
          background: range===d ? "rgba(255,215,0,0.1)" : "transparent",
          color:      range===d ? "#FFD700" : "#555",
          border:     `1px solid ${range===d ? "rgba(255,215,0,0.3)" : "#252525"}`,
          transition: "all 0.15s",
        }}>{d}D</button>
      ))}
    </div>
  );
}

// ── BAR CHART — div-based, perfectly responsive ───────────────────────────
export function BarChart({
  data = [], color = "#FFD700", barH = 120,
  label, format = fmtCount, defaultRange = 7,
}) {
  const [range, setRange] = useState(defaultRange);
  const filled = useMemo(() => fillRange(data, range), [data, range]);
  const max    = Math.max(...filled.map(d => d.value), 1);
  const skip   = range > 20 ? Math.ceil(range / 15) : range > 10 ? 2 : 1;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        {label && (
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#888" }}>
            {label}
          </span>
        )}
        <RangeToggle range={range} setRange={setRange} />
      </div>
      <div style={{ display:"flex", alignItems:"flex-end", gap: range > 20 ? 1 : 2, height: barH + 18, paddingBottom:16, position:"relative" }}>
        {[25,50,75].map(p => (
          <div key={p} style={{ position:"absolute", left:0, right:0, bottom: 16 + (barH*(p/100)), height:1, background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />
        ))}
        {filled.map((d, i) => {
          const h = max > 0 ? (d.value / max) * barH : 0;
          return (
            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", height: barH + 16, position:"relative", minWidth:0 }}>
              <div style={{
                width:"80%", minWidth:1,
                height: Math.max(h, 0),
                background: d.value > 0 ? color : "rgba(255,255,255,0.04)",
                borderRadius: "2px 2px 0 0",
                boxShadow: d.value > 0 ? `0 0 6px ${color}55, 0 0 12px ${color}22` : "none",
                transition: "height 0.35s ease",
                flexShrink: 0,
              }} />
              {i % skip === 0 && (
                <span style={{ position:"absolute", bottom:0, fontSize:7, color:"#444", fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>
                  {d.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── LINE CHART — SVG with area fill ───────────────────────────────────────
export function LineChart({
  data = [], color = "#FFD700", chartH = 120,
  label, format = fmtCount, defaultRange = 7,
}) {
  const [range, setRange] = useState(defaultRange);
  const filled = useMemo(() => fillRange(data, range), [data, range]);
  const max    = Math.max(...filled.map(d => d.value), 1);
  const skip   = range > 20 ? Math.ceil(range / 10) : range > 10 ? 2 : 1;

  const W=300, H=90, PL=4, PR=4, PT=12, PB=20;
  const IW = W-PL-PR, IH = H-PT-PB, n = filled.length;
  const pts = filled.map((d, i) => ({
    x: PL + (n > 1 ? (i/(n-1))*IW : IW/2),
    y: PT + IH - (d.value/max)*IH,
    ...d,
  }));
  const lp = pts.length > 1 ? pts.map((p,i) => `${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") : "";
  const ap = lp ? `${lp} L${pts[pts.length-1].x.toFixed(1)},${PT+IH} L${PL},${PT+IH} Z` : "";
  const gid = `lg${color.replace(/[^a-z0-9]/gi,"")}${range}`;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        {label && (
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#888" }}>
            {label}
          </span>
        )}
        <RangeToggle range={range} setRange={setRange} />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:chartH, overflow:"visible" }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0.25,0.5,0.75].map(p => (
          <line key={p} x1={PL} y1={PT+IH*(1-p)} x2={W-PR} y2={PT+IH*(1-p)} stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
        ))}
        {ap && <path d={ap} fill={`url(#${gid})`} />}
        {lp && <path d={lp} fill="none" stroke={color} strokeWidth="1.5" style={{ filter:`drop-shadow(0 0 4px ${color})` }} />}
        {pts.map((p,i) => p.value > 0 && (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} style={{ filter:`drop-shadow(0 0 5px ${color})` }} />
        ))}
        {pts.map((p,i) => i % skip === 0 && (
          <text key={i} x={p.x} y={H-3} textAnchor="middle" fontSize="7" fill="#484848" fontFamily="'DM Mono',monospace">
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ── MULTI-LINE COMPARISON CHART ───────────────────────────────────────────
export function MultiLineChart({ series = [], chartH = 140, label, defaultRange = 7 }) {
  const [range, setRange] = useState(defaultRange);
  const allFilled = useMemo(() =>
    series.map(s => ({ ...s, pts: fillRange(s.data, range) })),
    [series, range]
  );
  const max  = Math.max(...allFilled.flatMap(s => s.pts.map(p => p.value)), 1);
  const skip = range > 20 ? Math.ceil(range/10) : range > 10 ? 2 : 1;

  const W=300, H=90, PL=4, PR=4, PT=12, PB=20;
  const IW = W-PL-PR, IH = H-PT-PB, n = range;
  const gx = i => PL + (n > 1 ? (i/(n-1))*IW : IW/2);
  const gy = v => PT + IH - (v/max)*IH;
  const base = allFilled[0]?.pts || [];

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        {label && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#888" }}>{label}</span>}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {series.map(s => (
            <div key={s.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:14, height:2, background:s.color, boxShadow:`0 0 4px ${s.color}` }} />
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:s.color, letterSpacing:"0.08em", textTransform:"uppercase" }}>{s.label}</span>
            </div>
          ))}
          <RangeToggle range={range} setRange={setRange} />
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:chartH, overflow:"visible" }} preserveAspectRatio="none">
        {[0.25,0.5,0.75].map(p => (
          <line key={p} x1={PL} y1={PT+IH*(1-p)} x2={W-PR} y2={PT+IH*(1-p)} stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
        ))}
        {allFilled.map(s => {
          const lp = s.pts.length > 1 ? s.pts.map((p,i) => `${i===0?"M":"L"}${gx(i).toFixed(1)},${gy(p.value).toFixed(1)}`).join(" ") : "";
          return lp ? <path key={s.label} d={lp} fill="none" stroke={s.color} strokeWidth="1.5" style={{ filter:`drop-shadow(0 0 3px ${s.color})` }} /> : null;
        })}
        {base.map((_,i) => i % skip === 0 && (
          <text key={i} x={gx(i)} y={H-3} textAnchor="middle" fontSize="7" fill="#484848" fontFamily="'DM Mono',monospace">
            {base[i]?.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ── SPARKLINE — tiny inline trend ─────────────────────────────────────────
export function Sparkline({ data = [], color = "#FFD700", width = 56, height = 22 }) {
  const vals = (data||[]).map(d => typeof d === "object" ? (d.value||0) : (d||0));
  if (vals.length < 2) return null;
  const max = Math.max(...vals, 1);
  const pts = vals.map((v,i) => ({
    x: (i/(vals.length-1))*width,
    y: height - (v/max)*(height-2) - 1,
  }));
  const lp = pts.map((p,i) => `${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow:"visible", flexShrink:0, display:"block" }}>
      <path d={lp} fill="none" stroke={color} strokeWidth="1.5" style={{ filter:`drop-shadow(0 0 3px ${color})` }} />
    </svg>
  );
}

// ── CHART CARD WRAPPER ────────────────────────────────────────────────────
export function ChartCard({ children, style }) {
  return (
    <div style={{
      background: "#0D0D0D",
      border: "1.5px solid #2A2A2A",
      borderRadius: 8,
      padding: "16px 18px",
      ...style,
    }}>
      {children}
    </div>
  );
}
