import { C } from "../../../shared/colors.js";
import { TODAY } from "../../../shared/dateConstants.js";
import { STAGES } from "../constants.js";

export default function FunnelBar({ pipeline }) {
  const today = pipeline.filter((l) => l.date === TODAY);
  const total = Math.max(today.length, 1);
  return (
    <div
      style={{
        display: "flex",
        background: C.s1,
        borderRadius: 8,
        overflow: "hidden",
        border: `1.5px solid ${C.border}`,
      }}
    >
      {STAGES.map((s) => {
        const n = today.filter((l) => l.stage === s.key).length;
        return (
          <div
            key={s.key}
            style={{
              flex: 1,
              padding: "12px 10px",
              borderRight: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.t3,
                marginBottom: 5,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 32,
                fontWeight: 900,
                lineHeight: 1,
                color: s.color,
                textShadow: `0 0 10px ${s.color}88, 0 0 20px ${s.color}44`,
              }}
            >
              {n}
            </div>
            <div
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 9,
                color: s.color,
                opacity: 0.7,
                marginTop: 3,
              }}
            >
              {today.length > 0 ? Math.round((n / total) * 100) + "%" : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
