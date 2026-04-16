import { useState, useEffect } from "react";
import { C } from "../../../shared/colors.js";
import { TODAY } from "../../../shared/dateConstants.js";
import { apiGet, apiSet } from "../../../shared/api.js";
import {
  STAGES,
  SM,
  CLICKUP_LIST_ID,
  TEST_N8N_WEBHOOK_URL,
  PROD_N8N_WEBHOOK_URL,
} from "../constants.js";
import SectionLabel from "./SectionLabel.jsx";
import FunnelBar from "./FunnelBar.jsx";
import { NbCard, NBI, NBTA } from "./NbCard.jsx";
import Tile from "./Tile.jsx";
import Tally from "./Tally.jsx";

// ── SETTER VIEW (EOD) ─────────────────────────────────────────────────────
export default function SetterView({ rep }) {
  const eodKey = `setter:${rep.toLowerCase()}:eod:${TODAY}`;
  const pipelineKey = `setter:${rep.toLowerCase()}:pipeline`;

  const [pipeline, setPipeline] = useState([]);
  const [overrides, setOverrides] = useState({
    inbound: null,
    qualified: null,
    disq: null,
    links: null,
    booked: null,
  });
  const [followups, setFollowups] = useState(0);
  const [nb, setNb] = useState({
    kw: "",
    kwBlocks: "",
    kwLinks: "",
    rt1: "",
    rt2: "",
    noReason: "",
    oneFix: "",
  });
  const [loaded, setLoaded] = useState(false);
  const [syncTime, setSyncTime] = useState(null);
  const [reportTxt, setReportTxt] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [cuStatus, setCuStatus] = useState(null); // null | "loading" | "done" | "error"

  // Load
  useEffect(() => {
    Promise.all([apiGet(eodKey), apiGet(pipelineKey)]).then(([eod, pipe]) => {
      if (eod) {
        setOverrides(
          eod.overrides || {
            inbound: null,
            qualified: null,
            disq: null,
            links: null,
            booked: null,
          },
        );
        setFollowups(eod.followups || 0);
        setNb(
          eod.nb || {
            kw: "",
            kwBlocks: "",
            kwLinks: "",
            rt1: "",
            rt2: "",
            noReason: "",
            oneFix: "",
          },
        );
      }
      if (pipe) setPipeline(pipe);
      setLoaded(true);
      setSyncTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    });
  }, [rep]);

  // Visibility sync
  useEffect(() => {
    const fn = () => {
      if (!document.hidden)
        apiGet(pipelineKey).then((p) => {
          if (p) {
            setPipeline(p);
            setSyncTime(
              new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            );
          }
        });
    };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [rep]);

  // Auto-save
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(
      () => apiSet(eodKey, { overrides, followups, nb }),
      700,
    );
    return () => clearTimeout(t);
  }, [nb, overrides, followups, loaded]);

  // Auto values
  const todayLeads = pipeline.filter((l) => l.date === TODAY);
  const auto = {
    inbound: todayLeads.length,
    qualified: todayLeads.filter((l) => l.stage !== "disq").length,
    disq: todayLeads.filter((l) => l.stage === "disq").length,
    links: todayLeads.filter((l) => l.stage === "link" || l.stage === "booked")
      .length,
    booked: todayLeads.filter((l) => l.stage === "booked").length,
  };
  const eff = (k) => (overrides[k] !== null ? overrides[k] : auto[k]);
  const ovr = (k, d) =>
    setOverrides((p) => ({
      ...p,
      [k]: Math.max(0, (p[k] !== null ? p[k] : auto[k]) + d),
    }));
  const rst = (k) => setOverrides((p) => ({ ...p, [k]: null }));

  const links = eff("links") || 0;
  const booked = eff("booked") || 0;
  const conv = links > 0 ? Math.round((booked / links) * 100) + "%" : "—";
  const rt1 = parseFloat(nb.rt1);
  const rtColor = isNaN(rt1)
    ? C.t4
    : rt1 <= 5
      ? C.green
      : rt1 <= 10
        ? C.gold
        : C.red;
  const rtLabel = isNaN(rt1)
    ? "—"
    : rt1 <= 5
      ? "ON TARGET ✓"
      : rt1 <= 10
        ? "WATCH IT ⚠"
        : "CRITICAL MISS ✗";

  // Biggest leak
  const fo = ["new", "opener", "pain", "link", "booked"];
  let leakTxt = "Add leads to identify drop-off",
    maxD = -1;
  for (let i = 0; i < fo.length - 1; i++) {
    const a = todayLeads.filter((l) => l.stage === fo[i]).length,
      b = todayLeads.filter((l) => l.stage === fo[i + 1]).length;
    if (a > 0 && a - b > maxD) {
      maxD = a - b;
      leakTxt = `${SM[fo[i]].label} → ${SM[fo[i + 1]].label}  (${a - b} drop${a - b !== 1 ? "s" : ""})`;
    }
  }

  const pushReport = () => {
    const g = (k) => (nb[k] || "—").trim() || "—";
    setReportTxt(
      [
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `DDBA // SETTER EOD REPORT`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `Date:       ${TODAY}`,
        `DM Setter:  ${rep}`,
        ``,
        `━━ KEYWORDS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `Active KWs:         ${g("kw")}`,
        `Most Blocks:        ${g("kwBlocks")}`,
        `Most Booking Links: ${g("kwLinks")}`,
        ``,
        `━━ VOLUME ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `Inbound DMs:        ${eff("inbound")}`,
        `Qualified:          ${eff("qualified")}`,
        `Disqualified:       ${eff("disq")}`,
        `Follow-ups Sent:    ${followups}`,
        ``,
        `━━ BOOKING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `Booking Links Sent: ${eff("links")}`,
        `Calls Booked:       ${eff("booked")}`,
        `Link → Book Rate:   ${conv}`,
        `#1 Reason Not Booked: ${g("noReason")}`,
        ``,
        `━━ RESPONSE TIMES ━━━━━━━━━━━━━━━━━━━━━━`,
        `Avg First Response: ${isNaN(rt1) ? "—" : rt1 + " min"} — ${rtLabel}`,
        `Avg Convo Response: ${g("rt2")} min`,
        ``,
        `━━ ONE FIX FOR TOMORROW ━━━━━━━━━━━━━━━━`,
        g("oneFix"),
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ].join("\n"),
    );
    setShowReport(true);
  };

  const createClickUpTask = async () => {
    setCuStatus("loading");
    try {
      const r = await fetch(`${PROD_N8N_WEBHOOK_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listId: CLICKUP_LIST_ID,
          name: `EOD Report — ${rep} — ${TODAY}`,
          description: reportTxt,
        }),
      });
      if (!r.ok) throw new Error();
      setCuStatus("done");
    } catch {
      setCuStatus("error");
    }
  };

  const resetDay = () => {
    setOverrides({
      inbound: null,
      qualified: null,
      disq: null,
      links: null,
      booked: null,
    });
    setFollowups(0);
    setNb({
      kw: "",
      kwBlocks: "",
      kwLinks: "",
      rt1: "",
      rt2: "",
      noReason: "",
      oneFix: "",
    });
    apiSet(eodKey, null);
  };

  if (!loaded)
    return (
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
        SYNCING...
      </div>
    );

  const G3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 };
  const G2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      {/* Sync bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 24,
          fontFamily: "'DM Mono',monospace",
          fontSize: 11,
          color: C.t3,
          letterSpacing: "0.1em",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: C.green,
            flexShrink: 0,
            animation: "liveDot 2s ease-in-out infinite",
          }}
        />
        <span style={{ color: C.t2 }}>LIVE</span>
        <span style={{ color: C.t4 }}>— SYNCED FROM PIPELINE</span>
        {syncTime && (
          <span style={{ marginLeft: "auto", color: C.t4 }}>
            Last sync: {syncTime}
          </span>
        )}
      </div>

      {/* Funnel */}
      <SectionLabel>Pipeline Funnel — Today</SectionLabel>
      <div style={{ marginBottom: 10 }}>
        <FunnelBar pipeline={pipeline} />
      </div>

      {/* Leak */}
      <div
        style={{
          marginBottom: 28,
          padding: "9px 16px",
          background: C.s1,
          border: `1px solid ${C.redBorder}`,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.16em",
            color: C.t3,
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          Biggest Leak:
        </span>
        <span
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 12,
            fontWeight: 700,
            color: C.red,
            textShadow: `0 0 10px ${C.redGlow}`,
          }}
        >
          {leakTxt}
        </span>
      </div>

      {/* Metrics */}
      <SectionLabel>Live Metrics — Auto-Pulled from Pipeline</SectionLabel>
      <div style={{ ...G3, marginBottom: 12 }}>
        <Tile
          label="Inbound DMs"
          value={eff("inbound")}
          color={C.gold}
          sub="TOTAL TODAY"
          isOverride={overrides.inbound !== null}
          onMinus={() => ovr("inbound", -1)}
          onPlus={() => ovr("inbound", 1)}
          onReset={() => rst("inbound")}
        />
        <Tile
          label="Qualified"
          value={eff("qualified")}
          color={C.green}
          sub="ACTIVE CONVOS"
          isOverride={overrides.qualified !== null}
          onMinus={() => ovr("qualified", -1)}
          onPlus={() => ovr("qualified", 1)}
          onReset={() => rst("qualified")}
        />
        <Tile
          label="Disqualified"
          value={eff("disq")}
          color={C.red}
          sub="MARKED DEAD"
          isOverride={overrides.disq !== null}
          onMinus={() => ovr("disq", -1)}
          onPlus={() => ovr("disq", 1)}
          onReset={() => rst("disq")}
        />
      </div>
      <div style={{ ...G3, marginBottom: 28 }}>
        <Tile
          label="Links Sent"
          value={eff("links")}
          color={C.purple}
          sub="BOOKING LINKS"
          isOverride={overrides.links !== null}
          onMinus={() => ovr("links", -1)}
          onPlus={() => ovr("links", 1)}
          onReset={() => rst("links")}
        />
        <Tile
          label="Calls Booked"
          value={eff("booked")}
          color={C.green}
          sub="PRIMARY OUTPUT"
          isOverride={overrides.booked !== null}
          onMinus={() => ovr("booked", -1)}
          onPlus={() => ovr("booked", 1)}
          onReset={() => rst("booked")}
        />
        <div
          style={{
            background: C.s1,
            border: `1.5px solid ${C.border}`,
            borderRadius: 8,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: C.t2,
            }}
          >
            Link → Book Rate
          </span>
          <span
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 60,
              fontWeight: 900,
              lineHeight: 1,
              color:
                links === 0
                  ? C.t4
                  : booked / links >= 0.5
                    ? C.green
                    : booked / links >= 0.25
                      ? C.gold
                      : C.red,
              textShadow:
                links === 0
                  ? "none"
                  : "0 0 18px currentColor,0 0 36px currentColor55",
            }}
          >
            {conv}
          </span>
          <span
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 10,
              color: C.t3,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            CALCULATED LIVE
          </span>
        </div>
      </div>

      {/* Notebook */}
      <SectionLabel>Manual Fields — Notebook</SectionLabel>
      <div style={{ ...G2, marginBottom: 12 }}>
        <NbCard label="Active Keywords Today">
          <input
            style={NBI}
            value={nb.kw}
            onChange={(e) => setNb((p) => ({ ...p, kw: e.target.value }))}
            placeholder="List all active KWs..."
          />
        </NbCard>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <NbCard label="KW → Most Blocks">
            <input
              style={NBI}
              value={nb.kwBlocks}
              onChange={(e) =>
                setNb((p) => ({ ...p, kwBlocks: e.target.value }))
              }
              placeholder="Which KW?"
            />
          </NbCard>
          <NbCard label="KW → Most Links">
            <input
              style={NBI}
              value={nb.kwLinks}
              onChange={(e) =>
                setNb((p) => ({ ...p, kwLinks: e.target.value }))
              }
              placeholder="Which KW?"
            />
          </NbCard>
        </div>
      </div>
      <div style={{ ...G3, marginBottom: 12 }}>
        <NbCard label="Follow-ups Sent">
          <Tally value={followups} onChange={setFollowups} color={C.gold} />
        </NbCard>
        <NbCard label="Avg First Response">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              marginTop: 2,
            }}
          >
            <input
              type="number"
              style={{
                ...NBI,
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 48,
                fontWeight: 900,
                width: 80,
                color: rtColor,
                textShadow: `0 0 12px ${rtColor}88`,
              }}
              value={nb.rt1}
              onChange={(e) => setNb((p) => ({ ...p, rt1: e.target.value }))}
              placeholder="0"
              min="0"
            />
            <span
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 15,
                color: C.t3,
              }}
            >
              MIN
            </span>
          </div>
          <span
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: rtColor,
              textTransform: "uppercase",
              textShadow: `0 0 8px ${rtColor}77`,
            }}
          >
            {rtLabel}
          </span>
        </NbCard>
        <NbCard label="Avg Convo Response">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              marginTop: 2,
            }}
          >
            <input
              type="number"
              style={{
                ...NBI,
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 48,
                fontWeight: 900,
                width: 80,
                color: C.t1,
              }}
              value={nb.rt2}
              onChange={(e) => setNb((p) => ({ ...p, rt2: e.target.value }))}
              placeholder="0"
              min="0"
            />
            <span
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 15,
                color: C.t3,
              }}
            >
              MIN
            </span>
          </div>
        </NbCard>
      </div>
      <div style={{ marginBottom: 12 }}>
        <NbCard label="#1 Reason Prospects Didn't Book Today">
          <input
            style={NBI}
            value={nb.noReason}
            onChange={(e) => setNb((p) => ({ ...p, noReason: e.target.value }))}
            placeholder="What was the actual pattern? Be specific."
          />
        </NbCard>
      </div>
      <div style={{ marginBottom: 28 }}>
        <NbCard label="⚡ One Fix for Tomorrow" gold>
          <textarea
            style={{ ...NBTA, fontSize: 15 }}
            value={nb.oneFix}
            onChange={(e) => setNb((p) => ({ ...p, oneFix: e.target.value }))}
            placeholder="What specifically did not work today — and what specifically changes tomorrow? Not a placeholder. Something real."
          />
        </NbCard>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={pushReport}
          style={{
            flex: 2,
            minWidth: 200,
            padding: "18px 0",
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: "0.18em",
            background: `linear-gradient(135deg,#33CCFF,${C.gold},#0077BB,${C.gold})`,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            boxShadow: `0 0 28px ${C.goldGlow},0 0 56px rgba(0,170,255,0.25)`,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = `0 0 48px ${C.goldGlow},0 0 90px rgba(255,215,0,0.4)`;
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = `0 0 28px ${C.goldGlow},0 0 56px rgba(0,170,255,0.25)`;
            e.target.style.transform = "none";
          }}
        >
          ⬆ PUSH REPORT
        </button>
        <button
          style={{
            flex: 1,
            minWidth: 110,
            padding: "18px 0",
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 15,
            letterSpacing: "0.14em",
            background: "transparent",
            border: `2px solid ${C.border}`,
            color: C.t2,
            borderRadius: 6,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = C.borderHi;
            e.target.style.color = C.t1;
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = C.border;
            e.target.style.color = C.t2;
          }}
        >
          SAVE DRAFT
        </button>
        <button
          onClick={() => {
            if (window.confirm("Reset today? Pipeline data not affected."))
              resetDay();
          }}
          style={{
            flex: 1,
            minWidth: 110,
            padding: "18px 0",
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 15,
            letterSpacing: "0.14em",
            background: "transparent",
            border: `2px solid ${C.redBorder}`,
            color: C.red,
            borderRadius: 6,
            cursor: "pointer",
            transition: "all 0.15s",
            textShadow: `0 0 8px ${C.redGlow}`,
          }}
          onMouseEnter={(e) => {
            e.target.style.background = C.redDim;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
          }}
        >
          RESET DAY
        </button>
      </div>

      {/* Report modal */}
      {showReport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.97)",
            zIndex: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              background: C.s1,
              border: `2px solid ${C.border}`,
              borderRadius: 10,
              maxWidth: 640,
              width: "100%",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              animation: "fadeIn 0.2s ease",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  color: C.gold,
                  textShadow: `0 0 16px ${C.goldGlow}`,
                }}
              >
                EOD REPORT — READY TO PUSH
              </span>
              <button
                onClick={() => {
                  setShowReport(false);
                  setCuStatus(null);
                }}
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
            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
              <pre
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 12,
                  lineHeight: 2,
                  color: C.t2,
                  whiteSpace: "pre-wrap",
                  background: C.bg,
                  padding: 18,
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  margin: 0,
                }}
              >
                {reportTxt}
              </pre>
            </div>
            <div
              style={{
                padding: "16px 24px",
                borderTop: `1px solid ${C.border}`,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <button
                onClick={createClickUpTask}
                disabled={cuStatus === "loading" || cuStatus === "done"}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 16,
                  letterSpacing: "0.14em",
                  background:
                    cuStatus === "done"
                      ? `linear-gradient(135deg,${C.green},#00AA55)`
                      : cuStatus === "error"
                        ? `linear-gradient(135deg,${C.red},#CC2222)`
                        : `linear-gradient(135deg,${C.green},#00AA55)`,
                  color: "#000",
                  border: "none",
                  borderRadius: 5,
                  cursor:
                    cuStatus === "loading" || cuStatus === "done"
                      ? "not-allowed"
                      : "pointer",
                  opacity: cuStatus === "loading" ? 0.6 : 1,
                  boxShadow: `0 0 24px ${C.greenGlow}`,
                  transition: "all 0.2s",
                }}
              >
                {cuStatus === "loading"
                  ? "CREATING TASK..."
                  : cuStatus === "done"
                    ? "TASK CREATED IN CLICKUP ✓"
                    : cuStatus === "error"
                      ? "CLICKUP FAILED — TRY AGAIN"
                      : "PUSH TO CLICKUP"}
              </button>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(reportTxt).catch(() => {})
                  }
                  style={{
                    flex: 1,
                    padding: "13px 0",
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 15,
                    letterSpacing: "0.14em",
                    background: `linear-gradient(135deg,${C.gold},#0077BB)`,
                    color: "#fff",
                    border: "none",
                    borderRadius: 5,
                    cursor: "pointer",
                    boxShadow: `0 0 20px ${C.goldGlow}`,
                  }}
                >
                  COPY TO CLIPBOARD
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(reportTxt).catch(() => {});
                    setShowReport(false);
                    setCuStatus(null);
                    resetDay();
                  }}
                  style={{
                    flex: 1,
                    padding: "13px 0",
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 15,
                    letterSpacing: "0.14em",
                    background: "transparent",
                    border: `2px solid ${C.redBorder}`,
                    color: C.red,
                    borderRadius: 5,
                    cursor: "pointer",
                    textShadow: `0 0 8px ${C.redGlow}`,
                  }}
                >
                  COPY + RESET DAY
                </button>
                <button
                  onClick={() => {
                    setShowReport(false);
                    setCuStatus(null);
                  }}
                  style={{
                    padding: "13px 16px",
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
        </div>
      )}
    </div>
  );
}
