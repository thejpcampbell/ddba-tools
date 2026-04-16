import { C } from "../../../shared/colors.js";

export default function SectionLabel({ children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
      }}
    >
      <span
        style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: C.t3,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
      <div
        style={{
          flex: 1,
          height: 1,
          background: `linear-gradient(90deg,${C.border},transparent)`,
        }}
      />
    </div>
  );
}
