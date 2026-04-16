import { useState } from "react";
import { C } from "../../../shared/colors.js";
import { feedCloserPipeline } from "../../../shared/pipelineUtils.js";

export default function QualifiedLeadModal({ lead, rep, onClose }) {
  const [extra, setExtra] = useState({
    name: lead.name || "",
    phone: "",
    email: "",
    closer: lead.closer || "",
    datetime: "",
  });
  const [copied, setCopied] = useState(false);

  const format = () => {
    const n = extra.name || lead.handle;
    return [
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `DDBA // QUALIFIED LEAD FORMAT`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Name:             ${n}`,
      `Insta handle:     ${lead.handle}`,
      `Initial contact:  ${lead.date}`,
      `KW:               ${lead.kw || "—"}`,
      `DM Setter:        ${rep}`,
      `Closer:           ${extra.closer || "—"}`,
      `Phone:            ${extra.phone || "—"}`,
      `Email:            ${extra.email || "—"}`,
      ``,
      `${extra.datetime || "[Date/Time]"} w/${extra.closer || "[Closer Name]"}`,
      ``,
      `Notes: ${lead.notes || "—"}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ].join("\n");
  };

  const copy = () => {
    navigator.clipboard
      .writeText(format())
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
    // Auto-feed booked lead into closer pipeline
    feedCloserPipeline({
      date: lead.date,
      handle: lead.handle,
      name: extra.name || lead.handle,
      setterName: rep,
      notes: lead.notes || "",
      kw: lead.kw || "",
    });
  };

  const FI = {
    background: C.s2,
    border: `1.5px solid ${C.border}`,
    borderRadius: 5,
    padding: "10px 13px",
    fontSize: 14,
    color: C.t1,
    fontFamily: "'Barlow',sans-serif",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.97)",
        zIndex: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          background: C.s1,
          border: `2px solid ${C.greenBorder}`,
          borderRadius: 10,
          maxWidth: 580,
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: `0 0 40px rgba(0,255,136,0.12)`,
          animation: "fadeIn 0.2s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 22,
                letterSpacing: "0.12em",
                color: C.green,
                textShadow: `0 0 16px ${C.greenGlow}`,
              }}
            >
              DROP TO CLOSER PIPELINE
            </div>
            <div
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 10,
                color: C.t3,
                letterSpacing: "0.12em",
                marginTop: 2,
              }}
            >
              Qualified Lead Format — {lead.handle}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: C.t3,
              fontSize: 22,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Pre-filled fields */}
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              background: C.s2,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 9,
                letterSpacing: "0.18em",
                color: C.t3,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Auto-filled from Pipeline
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 8,
              }}
            >
              {[
                ["Name", lead.name || "—"],
                ["Handle", lead.handle],
                ["Initial Contact", lead.date],
                ["KW", lead.kw || "—"],
                ["DM Setter", rep],
              ].map(([k, v]) => (
                <div key={k}>
                  <div
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 9,
                      color: C.t4,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      marginBottom: 3,
                    }}
                  >
                    {k}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Barlow',sans-serif",
                      fontSize: 14,
                      color: C.t2,
                      fontWeight: 500,
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg,${C.border},transparent)`,
            }}
          />

          {/* Fields setter fills in */}
          <div
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: C.t3,
              textTransform: "uppercase",
            }}
          >
            Complete Before Dropping ↓
          </div>

          {[
            ["name", "Full Name / Insta Name", ""],
            ["closer", "Closer Name", "JP Campbell"],
            ["datetime", "Date/Time of Call", "e.g. Wed 3/26 @ 2:00 PM ET"],
            ["phone", "Phone", ""],
            ["email", "Email", ""],
          ].map(([k, lbl, ph]) => (
            <div key={k}>
              <div
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  color: C.t3,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {lbl}
              </div>
              <input
                value={extra[k]}
                onChange={(e) =>
                  setExtra((p) => ({ ...p, [k]: e.target.value }))
                }
                placeholder={ph || `Enter ${lbl.toLowerCase()}...`}
                style={FI}
                onFocus={(e) => (e.target.style.borderColor = C.goldBorder)}
                onBlur={(e) => (e.target.style.borderColor = C.border)}
              />
            </div>
          ))}

          {/* Preview */}
          <div>
            <div
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.18em",
                color: C.t3,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Preview
            </div>
            <pre
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 12,
                lineHeight: 1.9,
                color: C.t2,
                background: C.bg,
                padding: 16,
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                whiteSpace: "pre-wrap",
                margin: 0,
              }}
            >
              {format()}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            gap: 10,
          }}
        >
          <button
            onClick={copy}
            style={{
              flex: 1,
              padding: "14px 0",
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 16,
              letterSpacing: "0.14em",
              background: copied
                ? `linear-gradient(135deg,${C.green},#00CC66)`
                : `linear-gradient(135deg,${C.green},#00AA55)`,
              color: "#000",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: `0 0 24px ${C.greenGlow}`,
            }}
          >
            {copied ? "COPIED ✓" : "COPY TO CLIPBOARD"}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "14px 20px",
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 14,
              letterSpacing: "0.12em",
              background: "transparent",
              border: `2px solid ${C.border}`,
              color: C.t3,
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
