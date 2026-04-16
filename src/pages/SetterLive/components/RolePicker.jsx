import { C } from "../../../shared/colors.js";
import { TODAY_D } from "../../../shared/dateConstants.js";

// ── ROLE PICKER ───────────────────────────────────────────────────────────
export default function RolePicker({ onPick, onBack }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        padding: 32,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,215,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,215,0,0.03) 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 600,
          background: `radial-gradient(ellipse,rgba(255,215,0,0.1) 0%,transparent 65%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg,transparent,${C.goldDim} 20%,rgba(0,170,255,0.08) 50%,${C.goldDim} 80%,transparent)`,
          animation: "scanline 7s linear infinite",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 10,
            letterSpacing: "0.32em",
            color: C.t4,
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          DDBA · DIVISION 2 · SETTER LIVE
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: "clamp(56px,11vw,96px)",
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: "0.04em",
            background: `linear-gradient(135deg,#33CCFF 0%,${C.gold} 30%,#0088DD 65%,${C.gold} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: `drop-shadow(0 0 28px rgba(0,170,255,0.5))`,
            marginBottom: 14,
          }}
        >
          SETTER LIVE
          <br />
          DASHBOARD
        </div>
        <div
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 13,
            color: C.t3,
            letterSpacing: "0.08em",
          }}
        >
          {TODAY_D}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { name: "Liz", sub: "Setter View" },
          { name: "Chantal", sub: "Setter View" },
        ].map(({ name, sub }) => (
          <button
            key={name}
            onClick={() => onPick(name)}
            style={{
              width: 220,
              padding: 0,
              borderRadius: 10,
              border: `1.5px solid ${C.border}`,
              background: C.s1,
              cursor: "pointer",
              overflow: "hidden",
              transition: "all 0.25s",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.goldBorder;
              e.currentTarget.style.boxShadow = `0 0 28px rgba(255,215,0,0.2),0 0 56px rgba(0,170,255,0.08)`;
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.background = C.s2;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.background = C.s1;
            }}
          >
            <div style={{ padding: "28px 24px 26px" }}>
              <div
                style={{
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 40,
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  lineHeight: 1,
                  background: `linear-gradient(135deg,#33CCFF,${C.gold},#0088DD)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: `drop-shadow(0 0 8px rgba(0,170,255,0.6))`,
                  marginBottom: 8,
                  whiteSpace: "nowrap",
                }}
              >
                {name.toUpperCase()}
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  color: C.t3,
                  textTransform: "uppercase",
                }}
              >
                {sub}
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        style={{
          position: "relative",
          zIndex: 2,
          fontFamily: "'DM Mono',monospace",
          fontSize: 11,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: C.t4,
          background: "none",
          border: `1px solid ${C.border}`,
          borderRadius: 5,
          padding: "10px 20px",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          e.target.style.color = C.gold;
          e.target.style.borderColor = C.goldBorder;
          e.target.style.textShadow = `0 0 8px ${C.goldGlow}`;
        }}
        onMouseLeave={(e) => {
          e.target.style.color = C.t4;
          e.target.style.borderColor = C.border;
          e.target.style.textShadow = "none";
        }}
      >
        ← BACK TO HUB
      </button>
    </div>
  );
}
