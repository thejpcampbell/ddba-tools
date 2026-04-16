import { useState, useEffect } from "react";
import { C } from "../../../shared/colors.js";
import { apiGet } from "../../../shared/api.js";
import { BarChart, LineChart, ChartCard, buildRange } from "../../../shared/Charts.jsx";

// ── SETTER GRAPHS ─────────────────────────────────────────────────────────
export default function SetterGraphs({ rep }) {
  const pipelineKey = `setter:${rep.toLowerCase()}:pipeline`;
  const histKey = `setter:${rep.toLowerCase()}:eod:history`;
  const [pipeline, setPipeline] = useState([]);
  const [history, setHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([apiGet(pipelineKey), apiGet(histKey)]).then(([p, h]) => {
      if (p) setPipeline(p);
      if (h) setHistory(h);
      setLoaded(true);
    });
  }, [rep]);

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
        LOADING GRAPHS...
      </div>
    );

  const br = (fn) =>
    buildRange(30).map((r) => ({
      date: r.date,
      value: pipeline.filter((l) => l.date === r.date && fn(l)).length,
    }));

  const inboundD = br(() => true);
  const qualD = br((l) => l.stage !== "disq");
  const disqD = br((l) => l.stage === "disq");
  const linkD = br((l) => l.stage === "link" || l.stage === "booked");
  const bookedD = br((l) => l.stage === "booked");

  // Rate graphs from pipeline
  const linkBookD = buildRange(30).map((r) => {
    const links = pipeline.filter(
      (l) => l.date === r.date && (l.stage === "link" || l.stage === "booked"),
    ).length;
    const booked = pipeline.filter(
      (l) => l.date === r.date && l.stage === "booked",
    ).length;
    return {
      date: r.date,
      value: links > 0 ? Math.round((booked / links) * 100) : 0,
    };
  });
  const qualRateD = buildRange(30).map((r) => {
    const inb = pipeline.filter((l) => l.date === r.date).length;
    const qual = pipeline.filter(
      (l) => l.date === r.date && l.stage !== "disq",
    ).length;
    return {
      date: r.date,
      value: inb > 0 ? Math.round((qual / inb) * 100) : 0,
    };
  });

  const G2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };
  const G3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div
        style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: C.t3,
          marginBottom: 20,
        }}
      >
        {rep.toUpperCase()} — HISTORICAL PERFORMANCE
      </div>

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
          Volume Metrics — Pipeline Data
        </span>
        <div
          style={{
            flex: 1,
            height: 1,
            background: `linear-gradient(90deg,${C.border},transparent)`,
          }}
        />
      </div>
      <div style={{ ...G2, marginBottom: 14 }}>
        <ChartCard>
          <BarChart
            data={inboundD}
            color={C.blue}
            barH={120}
            label="Inbound DMs / Day"
          />
        </ChartCard>
        <ChartCard>
          <BarChart
            data={qualD}
            color={C.green}
            barH={120}
            label="Qualified / Day"
          />
        </ChartCard>
      </div>
      <div style={{ ...G3, marginBottom: 14 }}>
        <ChartCard>
          <BarChart
            data={linkD}
            color={C.purple}
            barH={110}
            label="Links Sent / Day"
          />
        </ChartCard>
        <ChartCard>
          <BarChart
            data={bookedD}
            color={C.gold}
            barH={110}
            label="Calls Booked / Day"
          />
        </ChartCard>
        <ChartCard>
          <BarChart
            data={disqD}
            color={C.red}
            barH={110}
            label="Disqualified / Day"
          />
        </ChartCard>
      </div>

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
          Conversion Rates — Calculated from Pipeline
        </span>
        <div
          style={{
            flex: 1,
            height: 1,
            background: `linear-gradient(90deg,${C.border},transparent)`,
          }}
        />
      </div>
      <div style={{ ...G2, marginBottom: 14 }}>
        <ChartCard>
          <LineChart
            data={linkBookD}
            color={C.gold}
            chartH={130}
            label="Link → Book Rate %"
            format={(v) => v + "%"}
          />
          <div
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 9,
              color: C.t4,
              letterSpacing: "0.1em",
              marginTop: 6,
            }}
          >
            TARGET: EVERY LINK BECOMES A CALL
          </div>
        </ChartCard>
        <ChartCard>
          <LineChart
            data={qualRateD}
            color={C.green}
            chartH={130}
            label="Inbound → Qualified Rate %"
            format={(v) => v + "%"}
          />
          <div
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 9,
              color: C.t4,
              letterSpacing: "0.1em",
              marginTop: 6,
            }}
          >
            % OF INBOUND DMS THAT QUALIFY
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
