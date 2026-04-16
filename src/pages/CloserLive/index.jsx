import { useState, useEffect, useCallback } from "react";
import { C } from "../../shared/colors.js";
import { TODAY_D } from "../../shared/dateConstants.js";
import { apiGet } from "../../shared/api.js";
import { PIPE_KEY, HIST_KEY, SETTER_KEYS } from "./constants.js";
import CloserEOD from "./components/CloserEOD.jsx";
import CloserPipeline from "./components/CloserPipeline.jsx";
import CloserGraphs from "./components/CloserGraphs.jsx";

function useStyles() {
  useEffect(() => {
    if (document.getElementById("cl-styles")) return;
    const s = document.createElement("style");
    s.id = "cl-styles";
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
@keyframes liveDot{0%,100%{box-shadow:0 0 5px 2px rgba(0,255,136,0.9),0 0 12px rgba(0,255,136,0.5)}50%{box-shadow:0 0 9px 4px rgba(0,255,136,1),0 0 22px rgba(0,255,136,0.7)}}
@keyframes goldDot{0%,100%{box-shadow:0 0 5px 2px rgba(0,170,255,0.9),0 0 12px rgba(0,170,255,0.5)}50%{box-shadow:0 0 9px 4px rgba(0,170,255,1),0 0 22px rgba(0,170,255,0.7)}}
@keyframes amberP{0%,100%{box-shadow:0 0 8px rgba(255,184,0,0.5)}50%{box-shadow:0 0 16px rgba(255,184,0,0.9)}}
@keyframes scanline{0%{top:-2px}100%{top:100%}}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
input[type=number]{-moz-appearance:textfield}`;
    document.head.appendChild(s);
  }, []);
}

export default function CloserLive({ onNavigate }) {
  useStyles();
  const [tab, setPipeline2] = useState("eod");
  const setTab = setPipeline2;
  const [pipeline, setPipeline] = useState([]);
  const [setterLeads, setSetterLeads] = useState([]);
  const [history, setHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const loadAll = useCallback(() => {
    Promise.all([
      apiGet(PIPE_KEY),
      apiGet(HIST_KEY),
      ...SETTER_KEYS.map((s) =>
        apiGet(s.key).then((d) => ({ data: d, rep: s.rep })),
      ),
    ]).then(([p, h, ...setterResults]) => {
      if (p) setPipeline(p);
      if (h) setHistory(h);
      // Merge setter leads with rep label
      const merged = setterResults.flatMap((r) =>
        (r.data || []).map((l) => ({ ...l, _rep: r.rep, _source: "setter" })),
      );
      setSetterLeads(merged);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    loadAll();
    const fn = () => {
      if (!document.hidden) loadAll();
    };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [loadAll]);

  const refreshHistory = useCallback(() => {
    apiGet(HIST_KEY).then((h) => {
      if (h) setHistory(h);
    });
  }, []);

  const TABS = [
    { key: "eod", label: "EOD Tracker" },
    { key: "pipeline", label: "Pipeline" },
    { key: "graphs", label: "📈 Graphs" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#111114", color: C.t1 }}>
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
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: C.gold,
                animation: "goldDot 2s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 20,
                letterSpacing: "0.1em",
                color: C.gold,
                textShadow: `0 0 14px ${C.goldGlow}`,
              }}
            >
              JP // CLOSER LIVE
            </span>
            <span
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 10,
                color: C.t4,
                letterSpacing: "0.1em",
              }}
            >
              {TODAY_D}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: "7px 14px",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  borderRadius: 4,
                  cursor: "pointer",
                  border:
                    tab === t.key
                      ? `1px solid ${C.goldBorder}`
                      : `1px solid ${C.border}`,
                  background: tab === t.key ? C.goldDim : "transparent",
                  color: tab === t.key ? C.gold : C.t3,
                  boxShadow:
                    tab === t.key ? `0 0 10px rgba(255,215,0,0.2)` : "none",
                  transition: "all 0.15s",
                }}
              >
                {t.label}
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
        {!loaded ? (
          <div
            style={{
              padding: 80,
              textAlign: "center",
              fontFamily: "'DM Mono',monospace",
              fontSize: 12,
              color: C.t4,
              letterSpacing: "0.16em",
            }}
          >
            LOADING...
          </div>
        ) : tab === "eod" ? (
          <CloserEOD
            pipeline={pipeline}
            history={history}
            onHistoryUpdate={refreshHistory}
          />
        ) : tab === "pipeline" ? (
          <CloserPipeline
            pipeline={pipeline}
            setGlobalPipeline={setPipeline}
            setterLeads={setterLeads}
          />
        ) : (
          <CloserGraphs pipeline={pipeline} history={history} />
        )}
      </div>
    </div>
  );
}
