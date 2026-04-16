import { useState } from "react";
import { STATUS, INTERNAL_ROUTES } from "./constants";

function IconButton({ onClick, children, hoverColor }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "12px 14px", fontSize: 14, background: "transparent",
        border: `1px solid ${hov ? hoverColor : "#141414"}`,
        borderRadius: 7, cursor: "pointer",
        color: hov ? hoverColor : "#333",
        boxShadow: hov ? `0 0 10px ${hoverColor}4d` : "none",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

export default function ToolCard({ tool, onEdit, onDelete, onNavigate }) {
  const [hov, setHov] = useState(false);
  const st     = STATUS[tool.status] || STATUS.planned;
  const isLive = tool.status === "live";
  const canOpen = isLive && !!tool.url;

  const handleOpen = () => {
    if (!canOpen) return;
    if (tool.internal) {
      const route = INTERNAL_ROUTES[tool.url];
      if (route) onNavigate(route);
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
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent 0%, #00AAFF 20%, #0088DD 50%, #00AAFF 80%, transparent 100%)",
            boxShadow: "0 0 20px rgba(0,170,255,0.9), 0 0 40px rgba(0,170,255,0.5), 0 0 80px rgba(0,170,255,0.2)",
          }} />
        )}

        {/* Ambient inner glow */}
        <div style={{
          position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
          width: 200, height: 120,
          background: hov
            ? "radial-gradient(ellipse, rgba(0,170,255,0.08) 0%, transparent 70%)"
            : "radial-gradient(ellipse, rgba(0,170,255,0.02) 0%, transparent 70%)",
          pointerEvents: "none", transition: "all 0.4s",
        }} />

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Icon */}
            <div style={{
              width: 50, height: 50, borderRadius: 10, flexShrink: 0,
              background: hov
                ? "linear-gradient(135deg, #1f1800, #2e2100, #1a1500)"
                : "linear-gradient(135deg, #121000, #1a1600, #0e0c00)",
              border: `1px solid ${hov ? "rgba(0,170,255,0.5)" : "rgba(0,170,255,0.12)"}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              boxShadow: hov ? "0 0 20px rgba(0,170,255,0.35), inset 0 0 10px rgba(0,170,255,0.05)" : "none",
              transition: "all 0.3s",
            }}>
              {tool.emoji}
            </div>

            <div>
              <div style={{
                fontSize: 17, lineHeight: 1.1, marginBottom: 5,
                fontFamily: "'Bebas Neue','Anton','Impact',sans-serif",
                letterSpacing: "0.1em",
                ...(hov
                  ? { background: "linear-gradient(135deg, #33CCFF, #00AAFF, #0088DD, #00AAFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", filter: "drop-shadow(0 0 8px rgba(0,170,255,0.5))" }
                  : { color: "#E8E4DC" }),
                transition: "all 0.3s",
              }}>
                {tool.name}
              </div>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace" }}>
                {tool.category} · {tool.version}
              </div>
            </div>
          </div>

          {/* Status badge */}
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
            color: st.color, background: st.bg,
            padding: "5px 11px", borderRadius: 4, flexShrink: 0,
            border: `1px solid ${st.color}44`,
            fontFamily: "'DM Mono',monospace",
            boxShadow: isLive ? `0 0 10px ${st.glow}, 0 0 20px ${st.glow.replace("0.6", "0.2")}` : "none",
            animation: isLive ? "livePulse 2.5s ease-in-out infinite" : "none",
          }}>
            {isLive && (
              <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: st.color, marginRight: 5, verticalAlign: "middle", boxShadow: `0 0 6px ${st.color}` }} />
            )}
            {st.label}
          </span>
        </div>

        {/* Divider */}
        <div style={{
          height: 1, marginBottom: 16,
          background: hov
            ? "linear-gradient(90deg, rgba(0,170,255,0.5), rgba(255,140,0,0.3), transparent)"
            : "linear-gradient(90deg, rgba(0,170,255,0.1), transparent)",
          transition: "all 0.3s",
        }} />

        <div style={{ fontSize: 13, color: hov ? "#BBB" : "#888", lineHeight: 1.75, marginBottom: 12, flex: 1, fontFamily: "'Barlow',sans-serif", transition: "color 0.2s" }}>
          {tool.tagline}
        </div>

        {tool.note && (
          <div style={{ fontSize: 10, color: "#3a3a3a", lineHeight: 1.6, marginBottom: 16, fontFamily: "'DM Mono',monospace" }}>
            → {tool.note}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: "auto", position: "relative", zIndex: 1 }}>
          <button
            onClick={handleOpen}
            disabled={!canOpen}
            style={{
              flex: 1, padding: "12px 0", fontSize: 12, fontWeight: 700, letterSpacing: "0.16em",
              background: canOpen
                ? hov
                  ? "linear-gradient(135deg, #33CCFF 0%, #00AAFF 25%, #0088DD 60%, #00AAFF 100%)"
                  : "linear-gradient(135deg, #00AAFF 0%, #0077BB 50%, #00AAFF 100%)"
                : "#080808",
              color: canOpen ? "#000" : "#1e1e1e",
              border: canOpen ? "none" : "1px solid #111",
              borderRadius: 7, cursor: canOpen ? "pointer" : "default",
              fontFamily: "'Bebas Neue','Anton',sans-serif",
              boxShadow: canOpen
                ? hov ? "0 0 40px rgba(0,170,255,0.8), 0 4px 20px rgba(0,170,255,0.4)" : "0 0 20px rgba(0,170,255,0.4)"
                : "none",
              transition: "all 0.2s",
            }}
          >
            {isLive ? (canOpen ? (tool.internal ? "OPEN →" : "OPEN TOOL →") : "URL REQUIRED") : st.label}
          </button>
          <IconButton onClick={() => onEdit(tool)} hoverColor="#00AAFF">✎</IconButton>
          <IconButton onClick={() => onDelete(tool.id)} hoverColor="#ff2200">×</IconButton>
        </div>

      </div>
    </div>
  );
}
