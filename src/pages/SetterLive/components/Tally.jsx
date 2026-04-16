import { C } from "../../../shared/colors.js";

export default function Tally({ value, onChange, color = C.gold }) {
  return (
    <div
      style={{
        display: "flex",
        height: 60,
        borderRadius: 6,
        overflow: "hidden",
        border: `1.5px solid ${C.border}`,
      }}
    >
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        style={{
          width: 50,
          flexShrink: 0,
          background: C.s1,
          border: "none",
          color: C.t4,
          fontSize: 26,
          cursor: "pointer",
          fontFamily: "'Bebas Neue',sans-serif",
          transition: "all 0.1s",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "#180000";
          e.target.style.color = C.red;
          e.target.style.textShadow = `0 0 10px ${C.redGlow}`;
        }}
        onMouseLeave={(e) => {
          e.target.style.background = C.s1;
          e.target.style.color = C.t4;
          e.target.style.textShadow = "none";
        }}
      >
        −
      </button>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.bg,
          borderLeft: `1px solid ${C.border}`,
          borderRight: `1px solid ${C.border}`,
        }}
      >
        <span
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 36,
            fontWeight: 900,
            lineHeight: 1,
            color,
            textShadow: `0 0 14px ${color}, 0 0 28px ${color}66`,
          }}
        >
          {value}
        </span>
      </div>
      <button
        onClick={() => onChange(value + 1)}
        style={{
          width: 50,
          flexShrink: 0,
          background: C.s1,
          border: "none",
          color: C.t4,
          fontSize: 26,
          cursor: "pointer",
          fontFamily: "'Bebas Neue',sans-serif",
          transition: "all 0.1s",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "#001808";
          e.target.style.color = C.green;
          e.target.style.textShadow = `0 0 10px ${C.greenGlow}`;
        }}
        onMouseLeave={(e) => {
          e.target.style.background = C.s1;
          e.target.style.color = C.t4;
          e.target.style.textShadow = "none";
        }}
      >
        +
      </button>
    </div>
  );
}
