import { useState, useEffect } from "react";
import { C } from "../../../shared/colors.js";
import { TODAY } from "../../../shared/dateConstants.js";
import { apiGet, apiSet, appendHistory } from "../../../shared/api.js";
import { Sparkline, buildRange } from "../../../shared/Charts.jsx";
import {
  SS_STAGES,
  OFFER_STAGES,
  CLOSE_STAGES,
  REVENUE_STAGES,
  EOD_KEY_FN,
  HIST_KEY,
  CLICKUP_LIST_ID,
  PROD_N8N_WEBHOOK_URL,
  TEST_N8N_WEBHOOK_URL,
} from "../constants.js";
import SL from "./SL.jsx";
import { NbCard, NBI, NBTA } from "./NbCard.jsx";
import KpiTile from "./KpiTile.jsx";
import CloserFunnel from "./CloserFunnel.jsx";
import JPView from "./JPView.jsx";

export default function CloserEOD({ pipeline, history, onHistoryUpdate }) {
  const eodKey = EOD_KEY_FN();
  const [overrides, setOverrides] = useState({
    scheduled: null,
    held: null,
    noshow: null,
    cancelled: null,
    ssTaken: null,
    offers: null,
    closes: null,
    oneCall: null,
    deposits: null,
  });
  const [nb, setNb] = useState({
    newCash: "",
    recurCash: "",
    topObjection: "",
    biggestWin: "",
    oneFix: "",
  });
  const [loaded, setLoaded] = useState(false);
  const [reportTxt, setReportTxt] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [cuStatus, setCuStatus] = useState(null); // null | "loading" | "done" | "error"
  const [reportDate, setReportDate] = useState(TODAY);

  const toInputDate = (d) => { const [m, dd, y] = d.split('/'); return `${y}-${m}-${dd}`; };
  const fromInputDate = (v) => { const [y, m, d] = v.split('-'); return `${m}/${d}/${y}`; };

  useEffect(() => {
    apiGet(eodKey).then((d) => {
      if (d) {
        setOverrides(
          d.overrides || {
            scheduled: null,
            held: null,
            noshow: null,
            cancelled: null,
            ssTaken: null,
            offers: null,
            closes: null,
            oneCall: null,
            deposits: null,
          },
        );
        setNb(
          d.nb || {
            newCash: "",
            recurCash: "",
            topObjection: "",
            biggestWin: "",
            oneFix: "",
          },
        );
      }
      setLoaded(true);
    });
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => apiSet(eodKey, { overrides, nb }), 700);
    return () => clearTimeout(t);
  }, [overrides, nb, loaded]);

  const tl = pipeline.filter((l) => l.date === TODAY);
  const auto = {
    scheduled: tl.length,
    held: tl.filter((l) => SS_STAGES.includes(l.stage)).length,
    noshow: tl.filter((l) => l.stage === "noshow").length,
    cancelled: tl.filter((l) => l.stage === "cancelled").length,
    ssTaken: tl.filter((l) => SS_STAGES.includes(l.stage)).length,
    offers: tl.filter((l) => OFFER_STAGES.includes(l.stage)).length,
    closes: tl.filter((l) => CLOSE_STAGES.includes(l.stage)).length,
    oneCall: tl.filter((l) => CLOSE_STAGES.includes(l.stage) && l.oneCallClose)
      .length,
    deposits: tl.filter((l) => l.stage === "deposit").length,
  };
  const eff = (k) => (overrides[k] !== null ? overrides[k] : auto[k]);
  const ovr = (k, d) =>
    setOverrides((p) => ({
      ...p,
      [k]: Math.max(0, (p[k] !== null ? p[k] : auto[k]) + d),
    }));
  const rst = (k) => setOverrides((p) => ({ ...p, [k]: null }));
  const autoRevenue = tl
    .filter((l) => REVENUE_STAGES.includes(l.stage) && l.cash)
    .reduce((s, l) => s + (parseFloat(l.cash) || 0), 0);
  const held = eff("held") || 0,
    sched = eff("scheduled") || 0,
    closes = eff("closes") || 0,
    oneCall = eff("oneCall") || 0;
  const showRate = sched > 0 ? Math.round((held / sched) * 100) : null;
  const closeRate = held > 0 ? Math.round((closes / held) * 100) : null;
  const oneCallRate = closes > 0 ? Math.round((oneCall / closes) * 100) : null;
  const kpiC = (v, t) =>
    v === null ? C.t4 : v >= t ? C.green : v >= t * 0.85 ? C.amber : C.red;
  const spark = (fn) =>
    buildRange(7).map((r) => ({
      date: r.date,
      value: pipeline.filter((l) => l.date === r.date && fn(l)).length,
    }));
  const sparkH = (k) =>
    (history || []).slice(-7).map((h) => ({ date: h.date, value: h[k] || 0 }));
  const resetDay = () => {
    setOverrides({
      scheduled: null,
      held: null,
      noshow: null,
      cancelled: null,
      ssTaken: null,
      offers: null,
      closes: null,
      oneCall: null,
      deposits: null,
    });
    setNb({
      newCash: "",
      recurCash: "",
      topObjection: "",
      biggestWin: "",
      oneFix: "",
    });
    apiSet(eodKey, null);
  };

  const pushReport = async () => {
    const g = (k) => (nb[k] || "—").trim() || "—";
    const fmt = (n) => (n !== null ? n + "%" : "—");
    const revenue =
      autoRevenue +
      (parseFloat(nb.newCash) || 0) +
      (parseFloat(nb.recurCash) || 0);
    await appendHistory(HIST_KEY, {
      date: TODAY,
      scheduled: sched,
      held,
      noshow: eff("noshow"),
      cancelled: eff("cancelled"),
      ssTaken: eff("ssTaken"),
      offers: eff("offers"),
      closes,
      oneCall,
      deposits: eff("deposits"),
      revenue,
      closeRate,
      showRate,
      oneCallRate,
    });
    if (onHistoryUpdate) onHistoryUpdate();
    setReportTxt(
      [
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `DDBA // CLOSER EOD REPORT`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `Date:           ${reportDate}`,
        `Closer:         JP Campbell`,
        ``,
        `━━ CALL ACTIVITY ━━━━━━━━━━━━━━━━━━━━━━━`,
        `Calls Scheduled:     ${sched}`,
        `Calls Held / SS:     ${held}`,
        `No-Shows:            ${eff("noshow")}`,
        `Cancelled:           ${eff("cancelled")}`,
        `Show Rate:           ${fmt(showRate)}  [target ≥75%]`,
        ``,
        `━━ PERFORMANCE ━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `Offers Made:         ${eff("offers")}`,
        `Deposits:            ${eff("deposits")}`,
        `Closes:              ${closes}`,
        `One-Call Closes:     ${oneCall}`,
        `Close Rate:          ${fmt(closeRate)}  [target ≥70%]`,
        `One-Call Close Rate: ${fmt(oneCallRate)}  [target ≥90%]`,
        ``,
        `━━ REVENUE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `Cash from Pipeline:  ${autoRevenue > 0 ? "$" + autoRevenue.toLocaleString() : "$0"}`,
        `New Cash:            ${g("newCash")}`,
        `Recurring Cash:      ${g("recurCash")}`,
        ``,
        `━━ INTEL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `Top Objection:       ${g("topObjection")}`,
        `Biggest Win:         ${g("biggestWin")}`,
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
      const r = await fetch(PROD_N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listId: CLICKUP_LIST_ID,
          name: `EOD Report — JP — ${reportDate}`,
          description: reportTxt,
        }),
      });
      if (!r.ok) throw new Error();
      setCuStatus("done");
    } catch {
      setCuStatus("error");
    }
  };

  if (!loaded)
    return (
      <div
        style={{
          padding: 60,
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
      <JPView />
      {/* Date bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 10,
          marginBottom: 20,
          fontFamily: "'DM Mono',monospace",
          fontSize: 11,
          letterSpacing: "0.1em",
        }}
      >
        <span style={{ color: C.t2, fontWeight: 700 }}>REPORT DATE</span>
        <input
          type="date"
          value={toInputDate(reportDate)}
          onChange={(e) => setReportDate(fromInputDate(e.target.value))}
          style={{
            background: C.goldDim,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 5,
            color: C.gold,
            fontFamily: "'DM Mono',monospace",
            fontSize: 13,
            fontWeight: 700,
            padding: "5px 10px",
            letterSpacing: "0.08em",
            cursor: "pointer",
            boxShadow: `0 0 10px rgba(0,170,255,0.2)`,
            outline: "none",
          }}
        />
      </div>
      <SL>Pipeline Funnel — Today</SL>
      <div style={{ marginBottom: 10 }}>
        <CloserFunnel pipeline={pipeline} />
      </div>
      {tl.filter((l) => l.stage === "verbal").length > 0 && (
        <div
          style={{
            marginBottom: 12,
            padding: "9px 16px",
            background: "rgba(255,184,0,0.06)",
            border: `1px solid ${C.amberBorder}`,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: C.amber,
              boxShadow: `0 0 8px ${C.amberGlow}`,
              flexShrink: 0,
              animation: "amberP 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 11,
              fontWeight: 700,
              color: C.amber,
              letterSpacing: "0.1em",
            }}
          >
            {tl.filter((l) => l.stage === "verbal").length} VERBAL YES — AGREED
            BUT NOT PAID. NOT A CLOSE.
          </span>
        </div>
      )}
      <div style={{ marginBottom: 24 }} />
      <SL>Call Activity — Auto-Pulled from Pipeline</SL>
      <div style={{ ...G3, marginBottom: 12 }}>
        <KpiTile
          label="Calls Booked"
          value={sched}
          color={C.gold}
          sub="Today's calendar"
          badge
          isOverride={overrides.scheduled !== null}
          onMinus={() => ovr("scheduled", -1)}
          onPlus={() => ovr("scheduled", 1)}
          onReset={() => rst("scheduled")}
          sparkData={spark(() => true)}
        />
        <KpiTile
          label="SS Taken"
          value={held}
          color={C.blue}
          sub="Call held"
          badge
          isOverride={overrides.held !== null}
          onMinus={() => ovr("held", -1)}
          onPlus={() => ovr("held", 1)}
          onReset={() => rst("held")}
          sparkData={spark((l) => SS_STAGES.includes(l.stage))}
        />
        <KpiTile
          label="No-Shows"
          value={eff("noshow")}
          color={C.red}
          sub="No notice"
          badge
          isOverride={overrides.noshow !== null}
          onMinus={() => ovr("noshow", -1)}
          onPlus={() => ovr("noshow", 1)}
          onReset={() => rst("noshow")}
          sparkData={spark((l) => l.stage === "noshow")}
        />
      </div>
      <div style={{ ...G3, marginBottom: 24 }}>
        <KpiTile
          label="Cancelled"
          value={eff("cancelled")}
          color={C.orange}
          sub="With notice"
          badge
          isOverride={overrides.cancelled !== null}
          onMinus={() => ovr("cancelled", -1)}
          onPlus={() => ovr("cancelled", 1)}
          onReset={() => rst("cancelled")}
          sparkData={spark((l) => l.stage === "cancelled")}
        />
        <KpiTile
          label="Offers Made"
          value={eff("offers")}
          color={"#44AAFF"}
          sub="Pitched today"
          badge
          isOverride={overrides.offers !== null}
          onMinus={() => ovr("offers", -1)}
          onPlus={() => ovr("offers", 1)}
          onReset={() => rst("offers")}
          sparkData={spark((l) => OFFER_STAGES.includes(l.stage))}
        />
        <KpiTile
          label="Deposits"
          value={eff("deposits")}
          color={C.purple}
          sub="Payment plan 1st"
          badge
          isOverride={overrides.deposits !== null}
          onMinus={() => ovr("deposits", -1)}
          onPlus={() => ovr("deposits", 1)}
          onReset={() => rst("deposits")}
          sparkData={spark((l) => l.stage === "deposit")}
        />
      </div>
      <SL>Performance KPIs — Live vs Targets</SL>
      <div style={{ ...G3, marginBottom: 12 }}>
        {[
          ["Show Rate", showRate, 75, "HELD/SCHED", "TARGET ≥75%", "showRate"],
          [
            "Close Rate",
            closeRate,
            70,
            "CLOSES/HELD",
            "TARGET ≥70%",
            "closeRate",
          ],
          [
            "1-Call Close",
            oneCallRate,
            90,
            "1-CALL/CLOSES",
            "TARGET ≥90%",
            "oneCallRate",
          ],
        ].map(([lbl, val, tgt, sub, hint, hk]) => (
          <div
            key={lbl}
            style={{
              background: C.s1,
              border: `1.5px solid ${C.border}`,
              borderRadius: 8,
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
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
              {lbl}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 56,
                  fontWeight: 900,
                  lineHeight: 1,
                  color: kpiC(val, tgt),
                  textShadow: `0 0 18px ${kpiC(val, tgt)},0 0 36px ${kpiC(val, tgt)}55`,
                }}
              >
                {val !== null ? val + "%" : "—"}
              </span>
              <Sparkline
                data={sparkH(hk)}
                color={kpiC(val, tgt)}
                width={56}
                height={24}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 10,
                  color: C.t3,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {sub}
              </span>
              <span
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 9,
                  color: C.t4,
                }}
              >
                {hint}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ ...G3, marginBottom: 24 }}>
        <KpiTile
          label="Closes"
          value={closes}
          color={C.green}
          sub="Full payment"
          badge
          isOverride={overrides.closes !== null}
          onMinus={() => ovr("closes", -1)}
          onPlus={() => ovr("closes", 1)}
          onReset={() => rst("closes")}
          sparkData={spark((l) => CLOSE_STAGES.includes(l.stage))}
        />
        <KpiTile
          label="One-Call Closes"
          value={oneCall}
          color={C.green}
          sub="Same-day close"
          badge
          isOverride={overrides.oneCall !== null}
          onMinus={() => ovr("oneCall", -1)}
          onPlus={() => ovr("oneCall", 1)}
          onReset={() => rst("oneCall")}
          sparkData={spark(
            (l) => CLOSE_STAGES.includes(l.stage) && l.oneCallClose,
          )}
        />
        <div
          style={{
            background: "rgba(0,255,136,0.04)",
            border: `1.5px solid ${C.greenBorder}`,
            borderRadius: 8,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
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
            Revenue (Pipeline)
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 44,
                fontWeight: 900,
                lineHeight: 1,
                color: autoRevenue > 0 ? C.green : C.t4,
                textShadow:
                  autoRevenue > 0
                    ? `0 0 20px ${C.green},0 0 40px rgba(0,255,136,0.4)`
                    : "none",
              }}
            >
              {autoRevenue > 0 ? "$" + autoRevenue.toLocaleString() : "$0"}
            </span>
            <Sparkline
              data={(history || [])
                .slice(-7)
                .map((h) => ({ date: h.date, value: h.revenue || 0 }))}
              color={C.green}
              width={56}
              height={24}
            />
          </div>
          <span
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 9,
              color: C.t4,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            FROM PIPELINE TODAY
          </span>
        </div>
      </div>
      <SL>Revenue Breakdown</SL>
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            background: "rgba(0,255,136,0.04)",
            border: `1.5px solid ${C.greenBorder}`,
            borderRadius: 8,
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: C.t3,
                marginBottom: 6,
              }}
            >
              Cash from Pipeline (auto)
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 40,
                fontWeight: 900,
                lineHeight: 1,
                color: autoRevenue > 0 ? C.green : C.t4,
              }}
            >
              {autoRevenue > 0 ? "$" + autoRevenue.toLocaleString() : "$0"}
            </div>
          </div>
          <div style={{ width: 1, height: 50, background: C.border }} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              flex: 1,
            }}
          >
            {[
              ["New Cash", "newCash"],
              ["Recurring Cash", "recurCash"],
            ].map(([lbl, k]) => (
              <div key={k}>
                <div
                  style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 9,
                    color: C.t3,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  {lbl}
                </div>
                <input
                  value={nb[k]}
                  onChange={(e) =>
                    setNb((p) => ({ ...p, [k]: e.target.value }))
                  }
                  placeholder="$0"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: C.t1,
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 26,
                    fontWeight: 900,
                    width: "100%",
                    outline: "none",
                    padding: 0,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <SL>Notebook — Manual Fields</SL>
      <div style={{ ...G2, marginBottom: 12 }}>
        <NbCard label="Top Objection Today" amber>
          <input
            style={NBI}
            value={nb.topObjection}
            onChange={(e) =>
              setNb((p) => ({ ...p, topObjection: e.target.value }))
            }
            placeholder="What came up most on calls today?"
          />
        </NbCard>
        <NbCard label="Biggest Win Today">
          <input
            style={NBI}
            value={nb.biggestWin}
            onChange={(e) =>
              setNb((p) => ({ ...p, biggestWin: e.target.value }))
            }
            placeholder="Best moment, breakthrough, or result..."
          />
        </NbCard>
      </div>
      <div style={{ marginBottom: 24 }}>
        <NbCard label="⚡ One Fix for Tomorrow" gold>
          <textarea
            style={{ ...NBTA, fontSize: 15 }}
            value={nb.oneFix}
            onChange={(e) => setNb((p) => ({ ...p, oneFix: e.target.value }))}
            placeholder="What specifically did not work today — and what specifically changes tomorrow? Not a placeholder. Something real."
          />
        </NbCard>
      </div>
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
            background: `linear-gradient(135deg,#33CCFF,#00AAFF,#0077CC,#00AAFF)`,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            boxShadow: `0 0 28px rgba(0,170,255,0.6),0 0 56px rgba(0,170,255,0.25)`,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = `0 0 48px rgba(0,170,255,0.8),0 0 90px rgba(0,170,255,0.4)`;
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = `0 0 28px rgba(0,170,255,0.6),0 0 56px rgba(0,170,255,0.25)`;
            e.target.style.transform = "none";
          }}
        >
          ⬆ PUSH EOD REPORT
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
                CLOSER EOD — READY TO PUSH
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
                    cuStatus === "error"
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
                    background: `linear-gradient(135deg,${C.gold},#CC8800)`,
                    color: "#000",
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
