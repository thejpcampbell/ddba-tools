import { C } from "../../../shared/colors.js";

export function NbCard({ label, children, gold }) {
  return (
    <div
      style={{
        background: gold ? "rgba(255,215,0,0.05)" : C.s1,
        border: `1.5px solid ${gold ? C.goldBorder : C.border}`,
        borderRadius: 8,
        padding: "15px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: gold
          ? `0 0 20px rgba(255,215,0,0.05), inset 0 0 20px rgba(255,215,0,0.02)`
          : "none",
      }}
    >
      <span
        style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: gold ? C.gold : C.t3,
          textShadow: gold ? `0 0 8px ${C.goldGlow}` : "none",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

export const NBI = {
  background: "transparent",
  border: "none",
  color: C.t1,
  fontFamily: "'Barlow',sans-serif",
  fontSize: 15,
  fontWeight: 500,
  width: "100%",
  outline: "none",
  padding: 0,
};
export const NBTA = { ...NBI, resize: "none", minHeight: 74, lineHeight: 1.65 };
