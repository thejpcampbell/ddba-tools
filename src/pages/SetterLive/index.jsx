import { useState, useEffect } from "react";
import { C } from "../../shared/colors.js";
import RolePicker from "./components/RolePicker.jsx";
import SetterView from "./components/SetterView.jsx";
import PipelinePanel from "./components/PipelinePanel.jsx";
import SetterGraphs from "./components/SetterGraphs.jsx";

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
      ::-webkit-scrollbar-thumb{ background:#00AAFF40; border-radius:2px; }
      ::-webkit-scrollbar-thumb:hover{ background:#00AAFF80; }
    `;
    document.head.appendChild(s);
  }, []);
}

export default function SetterLive({ onNavigate }) {
  useGlobalStyles();
  const [role, setRole] = useState(null);
  const [tab, setTab] = useState("eod");

  if (!role)
    return <RolePicker onPick={setRole} onBack={() => onNavigate("hub")} />;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.t1 }}>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(0,170,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,170,255,0.025) 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 600,
          background: `radial-gradient(ellipse,rgba(0,170,255,0.08) 0%,transparent 65%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg,transparent,rgba(0,170,255,0.12) 20%,rgba(0,204,255,0.08) 50%,rgba(0,170,255,0.12) 80%,transparent)`,
          animation: "scanline 7s linear infinite",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Header */}
        <div
          style={{
            background: "rgba(17,17,20,0.94)",
            borderBottom: `2px solid rgba(0,170,255,0.15)`,
            padding: "14px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100,
            backdropFilter: "blur(20px)",
            boxShadow: `0 0 40px rgba(0,0,0,0.8),0 2px 0 rgba(0,170,255,0.08)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setRole(null)}
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 11,
                letterSpacing: "0.12em",
                color: C.t3,
                background: "none",
                border: `1px solid ${C.border}`,
                borderRadius: 4,
                padding: "7px 14px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = C.gold;
                e.target.style.borderColor = C.goldBorder;
              }}
              onMouseLeave={(e) => {
                e.target.style.color = C.t3;
                e.target.style.borderColor = C.border;
              }}
            >
              ← SWITCH
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 20,
                  letterSpacing: "0.1em",
                  color: C.gold,
                  textShadow: `0 0 14px ${C.goldGlow}`,
                }}
              >
                {`${role.toUpperCase()} // SETTER LIVE`}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: C.green,
                    animation: "liveDot 2s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 10,
                    color: C.green,
                    letterSpacing: "0.12em",
                    textShadow: `0 0 8px ${C.greenGlow}`,
                  }}
                >
                  LIVE
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {["eod", "pipeline", "graphs"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: "7px 16px",
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    borderRadius: 4,
                    cursor: "pointer",
                    border:
                      tab === t
                        ? `1px solid ${C.goldBorder}`
                        : `1px solid ${C.border}`,
                    background: tab === t ? C.goldDim : "transparent",
                    color: tab === t ? C.gold : C.t3,
                    boxShadow:
                      tab === t ? `0 0 10px rgba(255,215,0,0.2)` : "none",
                    transition: "all 0.15s",
                    textShadow: tab === t ? `0 0 8px ${C.goldGlow}` : "none",
                  }}
                >
                  {t === "eod"
                    ? "EOD Tracker"
                    : t === "pipeline"
                      ? "Pipeline"
                      : "📈 Graphs"}
                </button>
              ))}
            <button
              onClick={() => onNavigate("hub")}
              style={{
                padding: "7px 14px",
                fontFamily: "'DM Mono',monospace",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.t3,
                background: "transparent",
                border: `1px solid ${C.border}`,
                borderRadius: 4,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = C.gold;
                e.target.style.borderColor = C.goldBorder;
              }}
              onMouseLeave={(e) => {
                e.target.style.color = C.t3;
                e.target.style.borderColor = C.border;
              }}
            >
              Hub →
            </button>
          </div>
        </div>

        {tab === "eod" ? (
          <SetterView rep={role} />
        ) : tab === "pipeline" ? (
          <PipelinePanel rep={role} />
        ) : (
          <SetterGraphs rep={role} />
        )}
      </div>
    </div>
  );
}
