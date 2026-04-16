import { useState, useEffect, useCallback } from "react";
import { C } from "../../../shared/colors.js";
import { TODAY } from "../../../shared/dateConstants.js";
import { apiGet } from "../../../shared/api.js";
import { REPS, STAGES } from "../../SetterLive/constants.js";

// ── JP COMMAND VIEW ───────────────────────────────────────────────────────
export default function JPView() {
  const [eods, setEods] = useState({ Liz: {}, Chantal: {} });
  const [pipes, setPipes] = useState({ Liz: [], Chantal: [] });

  const refresh = useCallback(() => {
    Promise.all(
      REPS.flatMap((r) => [
        apiGet(`setter:${r.toLowerCase()}:eod:${TODAY}`),
        apiGet(`setter:${r.toLowerCase()}:pipeline`),
      ]),
    ).then(([le, lp, ce, cp]) => {
      setEods({ Liz: le || {}, Chantal: ce || {} });
      setPipes({ Liz: lp || [], Chantal: cp || [] });
    });
  }, []);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 30000);
    return () => clearInterval(iv);
  }, []);

  const getEff = (rep, k) => {
    const o = (eods[rep]?.overrides || {})[k];
    const p = (pipes[rep] || []).filter((l) => l.date === TODAY);
    const a = {
      inbound: p.length,
      qualified: p.filter((l) => l.stage !== "disq").length,
      disq: p.filter((l) => l.stage === "disq").length,
      links: p.filter((l) => l.stage === "link" || l.stage === "booked").length,
      booked: p.filter((l) => l.stage === "booked").length,
    };
    return o !== null && o !== undefined ? o : a[k] || 0;
  };

  const MX = [
    { key: "inbound", label: "Inbound", color: C.gold },
    { key: "qualified", label: "Qual'd", color: C.green },
    { key: "links", label: "Links", color: C.purple },
    { key: "booked", label: "Booked", color: C.green },
    { key: "disq", label: "Disq'd", color: C.red },
  ];

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 28,
          fontFamily: "'DM Mono',monospace",
          fontSize: 11,
          letterSpacing: "0.1em",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: C.green,
            animation: "liveDot 2s ease-in-out infinite",
            flexShrink: 0,
          }}
        />
        <span style={{ color: C.t2 }}>JP COMMAND VIEW</span>
        <span style={{ color: C.t4 }}>— AUTO-REFRESHES EVERY 30s</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        {REPS.map((rep) => {
          const lk = getEff(rep, "links"),
            bk = getEff(rep, "booked");
          const cr = lk > 0 ? Math.round((bk / lk) * 100) + "%" : "—";
          const cc =
            lk === 0
              ? C.t4
              : bk / lk >= 0.5
                ? C.green
                : bk / lk >= 0.25
                  ? C.gold
                  : C.red;
          return (
            <div key={rep}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: C.green,
                    animation: "liveDot 2s ease-in-out infinite",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 30,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    color: C.gold,
                    textShadow: `0 0 14px ${C.goldGlow},0 0 28px rgba(255,215,0,0.35)`,
                  }}
                >
                  {rep.toUpperCase()}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                {MX.map((m) => (
                  <div
                    key={m.key}
                    style={{
                      background: C.s1,
                      border: `1.5px solid ${C.border}`,
                      borderRadius: 7,
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.16em",
                        color: C.t3,
                        textTransform: "uppercase",
                        marginBottom: 5,
                      }}
                    >
                      {m.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 38,
                        fontWeight: 900,
                        lineHeight: 1,
                        color: m.color,
                        textShadow: `0 0 12px ${m.color}88`,
                      }}
                    >
                      {getEff(rep, m.key)}
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    background: C.s1,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 7,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      color: C.t3,
                      textTransform: "uppercase",
                      marginBottom: 5,
                    }}
                  >
                    Link→Book
                  </div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue',sans-serif",
                      fontSize: 38,
                      fontWeight: 900,
                      lineHeight: 1,
                      color: cc,
                      textShadow: lk > 0 ? `0 0 12px ${cc}88` : "none",
                    }}
                  >
                    {cr}
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: C.s1,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 7,
                  overflow: "hidden",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex" }}>
                  {STAGES.map((s) => {
                    const n = (pipes[rep] || []).filter(
                      (l) => l.date === TODAY && l.stage === s.key,
                    ).length;
                    return (
                      <div
                        key={s.key}
                        style={{
                          flex: 1,
                          padding: "10px 8px",
                          borderRight: `1px solid ${C.border}`,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'DM Mono',monospace",
                            fontSize: 8,
                            color: C.t3,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            marginBottom: 4,
                          }}
                        >
                          {s.label}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: 26,
                            fontWeight: 900,
                            color: s.color,
                            textShadow: `0 0 8px ${s.color}66`,
                          }}
                        >
                          {n}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {eods[rep]?.nb?.oneFix && (
                <div
                  style={{
                    background: "rgba(255,215,0,0.04)",
                    border: `1px solid ${C.goldBorder}`,
                    borderRadius: 7,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 9,
                      color: C.gold,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      marginBottom: 6,
                      textShadow: `0 0 8px ${C.goldGlow}`,
                    }}
                  >
                    ⚡ One Fix for Tomorrow
                  </div>
                  <div
                    style={{
                      fontFamily: "'Barlow',sans-serif",
                      fontSize: 13,
                      color: C.t2,
                      lineHeight: 1.6,
                    }}
                  >
                    {eods[rep].nb.oneFix}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
