import { useState } from "react";
import { C } from "../../../shared/colors.js";

// ── METRIC TILE — FIXED LAYOUT (no overlap) ───────────────────────────────
// Layout: top row = [LABEL] [badge] [−][+][↺?]  all inline, no absolute
export default function Tile({
  label,
  value,
  color,
  sub,
  isOverride,
  onMinus,
  onPlus,
  onReset,
}) {
  const [hov, setHov] = useState(false);
  const col = color || C.gold;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.s1,
        border: `1.5px solid ${isOverride ? C.goldBorder : hov ? C.borderHi : C.border}`,
        borderRadius: 8,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "all 0.15s",
        boxShadow: isOverride
          ? `0 0 18px ${C.goldDim}, inset 0 0 16px rgba(255,215,0,0.03)`
          : "none",
      }}
    >
      {/* TOP ROW: label | badge | controls — all inline, no absolute */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: C.t2,
            flex: 1,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>

        {/* Badge */}
        <span
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: 3,
            flexShrink: 0,
            background: isOverride ? C.goldDim : C.greenDim,
            color: isOverride ? C.gold : C.green,
            border: `1px solid ${isOverride ? C.goldBorder : C.greenBorder}`,
            textShadow: isOverride
              ? `0 0 8px ${C.goldGlow}`
              : `0 0 8px ${C.greenGlow}`,
          }}
        >
          {isOverride ? "EDITED" : "AUTO"}
        </span>

        {/* Override controls — always in flow, visible on hover */}
        <div
          style={{
            display: "flex",
            gap: 3,
            opacity: hov ? 1 : 0,
            transition: "opacity 0.15s",
            flexShrink: 0,
          }}
        >
          <button
            onClick={onMinus}
            style={{
              width: 24,
              height: 24,
              borderRadius: 3,
              border: `1px solid ${C.border}`,
              background: C.s2,
              color: C.t4,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.1s",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#200000";
              e.target.style.color = C.red;
              e.target.style.borderColor = C.redBorder;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = C.s2;
              e.target.style.color = C.t4;
              e.target.style.borderColor = C.border;
            }}
          >
            −
          </button>
          <button
            onClick={onPlus}
            style={{
              width: 24,
              height: 24,
              borderRadius: 3,
              border: `1px solid ${C.border}`,
              background: C.s2,
              color: C.t4,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.1s",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#002010";
              e.target.style.color = C.green;
              e.target.style.borderColor = C.greenBorder;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = C.s2;
              e.target.style.color = C.t4;
              e.target.style.borderColor = C.border;
            }}
          >
            +
          </button>
          {isOverride && (
            <button
              onClick={onReset}
              title="Reset to auto"
              style={{
                width: 24,
                height: 24,
                borderRadius: 3,
                border: `1px solid ${C.goldBorder}`,
                background: C.goldDim,
                color: C.gold,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textShadow: `0 0 8px ${C.goldGlow}`,
              }}
            >
              ↺
            </button>
          )}
        </div>
      </div>

      {/* BIG NUMBER */}
      <div
        style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 60,
          fontWeight: 900,
          lineHeight: 1,
          color: col,
          letterSpacing: "-0.02em",
          textShadow: `0 0 18px ${col}, 0 0 36px ${col}55`,
        }}
      >
        {value ?? "—"}
      </div>

      {sub && (
        <div
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 10,
            color: C.t3,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
