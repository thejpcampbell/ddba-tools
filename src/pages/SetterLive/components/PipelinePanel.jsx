import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { C } from "../../../shared/colors.js";
import { TODAY } from "../../../shared/dateConstants.js";
import { apiGet, apiSet } from "../../../shared/api.js";
import {
  STAGES,
  SM,
  PIPELINE_CLICKUP_LIST_ID,
  PIPELINE_CREATE_WEBHOOK,
  PIPELINE_TEST_N8N_WEBHOOK_URL,
  PIPELINE_UPDATE_WEBHOOK,
  PIPELINE_TEST_UPDATE_WEBHOOK,
} from "../constants.js";
import QualifiedLeadModal from "./QualifiedLeadModal.jsx";

const strToDate = (str) => {
  if (!str) return null;
  const [m, d, y] = str.split("/");
  if (!m || !d || !y) return null;
  return new Date(Number(y), Number(m) - 1, Number(d));
};
const dateToStr = (date) => {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const EMPTY_FORM = (rep) => ({
  date: TODAY,
  bookedDate: "",
  stage: "new",
  name: "",
  handle: "",
  ad: "",
  kw: "",
  quality: "",
  setter: rep,
  closer: "JP Campbell",
  showed: "",
  closed: "",
  revenue: "",
  notes: "",
  clickupId: "",
});

// ── PIPELINE PANEL ────────────────────────────────────────────────────────
export default function PipelinePanel({ rep }) {
  const pipelineKey = `setter:${rep.toLowerCase()}:pipeline`;
  const [leads, setLeads] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM(rep));
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState(null);
  const [errHandle, setErrHandle] = useState(false);
  const [closer, setCloser] = useState(null); // lead to drop to closer

  // Use a ref to always have current leads in async callbacks — fixes stale closure bug
  const leadsRef = useRef([]);
  useEffect(() => {
    leadsRef.current = leads;
  }, [leads]);

  useEffect(() => {
    apiGet(pipelineKey).then((p) => {
      if (p) {
        setLeads(p);
        leadsRef.current = p;
      }
    });
  }, [rep]);

  const persist = (next) => {
    apiSet(pipelineKey, next);
  };

  const syncToClickUp = async (isNew, lead) => {
    try {
      if (isNew) {
        const res = await fetch(PIPELINE_CREATE_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listId: PIPELINE_CLICKUP_LIST_ID, lead }),
        });
        if (res.ok) {
          const { taskId } = await res.json();
          if (taskId) {
            setLeads((prev) => {
              const next = prev.map((l) =>
                l.id === lead.id ? { ...l, clickupId: taskId } : l,
              );
              leadsRef.current = next;
              persist(next);
              return next;
            });
          }
        }
      } else {
        if (!lead.clickupId) return;
        await fetch(PIPELINE_UPDATE_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: lead.clickupId, lead }),
        });
      }
    } catch {
      // Silently fail — Upstash is source of truth
    }
  };

  const save = () => {
    if (!form.handle.trim()) {
      setErrHandle(true);
      return;
    }
    setErrHandle(false);

    const current = leadsRef.current;
    const isNew = editId === null;
    const newId = isNew ? Date.now() : editId;
    const existingClickupId = isNew
      ? ""
      : current.find((l) => l.id === editId)?.clickupId || "";

    const next = isNew
      ? [...current, { ...form, id: newId, clickupId: "" }]
      : current.map((l) => (l.id === editId ? { ...l, ...form } : l));

    setLeads(next);
    leadsRef.current = next;
    persist(next);
    setShowAdd(false);
    setEditId(null);
    setForm(EMPTY_FORM(rep));

    syncToClickUp(isNew, { ...form, id: newId, clickupId: existingClickupId });
  };

  const del = (id) => {
    if (!window.confirm("Remove this conversation?")) return;
    const next = leadsRef.current.filter((l) => l.id !== id);
    setLeads(next);
    leadsRef.current = next;
    persist(next);
  };

  const startEdit = (l) => {
    setForm({ ...EMPTY_FORM(rep), ...l });
    setEditId(l.id);
    setErrHandle(false);
    setShowAdd(true);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM(rep));
    setEditId(null);
    setErrHandle(false);
    setShowAdd(true);
  };

  const visible = leads
    .filter((l) => !filter || l.stage === filter)
    .sort((a, b) => b.id - a.id);

  const pill = (key) => {
    const s = SM[key] || SM["looksAvatar"];
    return (
      <span
        style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "3px 9px",
          borderRadius: 3,
          background: `${s.color}16`,
          color: s.color,
          border: `1px solid ${s.color}44`,
          whiteSpace: "nowrap",
          textShadow: `0 0 6px ${s.color}88`,
        }}
      >
        {s.label}
      </span>
    );
  };

  const qualityColor = (q) => {
    const n = parseInt(q);
    if (!n) return C.t4;
    if (n <= 2) return C.red;
    if (n === 3) return C.orange;
    return C.green;
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

  const LBL = (text, required) => (
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
      {text}
      {required && <span style={{ color: C.red }}> *</span>}
    </div>
  );

  const TABLE_COLS = [
    "Date",
    "Booked Date",
    "Name",
    "Handle",
    "Stage",
    "Quality",
    "Setter",
    "Closer",
    "Showed",
    "Closed",
    "Revenue",
    "Actions",
  ];

  return (
    <div style={{ padding: "0 24px 28px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <button
          onClick={openAdd}
          style={{
            padding: "10px 22px",
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 15,
            letterSpacing: "0.14em",
            background: `linear-gradient(135deg,${C.gold},#0077BB)`,
            color: "#fff",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            boxShadow: `0 0 16px ${C.goldGlow}`,
          }}
        >
          + ADD CONVERSATION
        </button>
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginLeft: "auto",
          }}
        >
          {[null, ...STAGES.map((s) => s.key)].map((k) => {
            const s = k ? SM[k] : null,
              active = filter === k;
            return (
              <button
                key={k || "all"}
                onClick={() => setFilter(k)}
                style={{
                  padding: "6px 13px",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  borderRadius: 4,
                  cursor: "pointer",
                  background: active
                    ? k
                      ? `${s.color}14`
                      : C.goldDim
                    : "transparent",
                  color: active ? (k ? s.color : C.gold) : C.t3,
                  border: `1px solid ${active ? (k ? s.color + "44" : C.goldBorder) : C.border}`,
                  boxShadow: active
                    ? `0 0 8px ${k ? s.color + "66" : C.goldGlow}`
                    : "none",
                  transition: "all 0.1s",
                }}
              >
                {k ? s.label : "ALL"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          overflowX: "auto",
          background: C.s1,
          border: `1.5px solid ${C.border}`,
          borderRadius: 8,
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 1200 }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {TABLE_COLS.map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 14px",
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: C.t3,
                    textAlign: "left",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((l) => (
              <tr
                key={l.id}
                style={{
                  borderBottom: `1px solid ${C.s3}`,
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.s2)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {/* Date */}
                <td
                  style={{
                    padding: "11px 14px",
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 12,
                    color: C.t3,
                    whiteSpace: "nowrap",
                  }}
                >
                  {l.date || "—"}
                </td>
                {/* Booked Date */}
                <td
                  style={{
                    padding: "11px 14px",
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 12,
                    color: C.t3,
                    whiteSpace: "nowrap",
                  }}
                >
                  {l.bookedDate || "—"}
                </td>
                {/* Name */}
                <td
                  style={{
                    padding: "11px 14px",
                    fontFamily: "'Barlow',sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    color: C.t2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {l.name || "—"}
                </td>
                {/* Handle */}
                <td
                  style={{
                    padding: "11px 14px",
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 15,
                    letterSpacing: "0.08em",
                    color: C.t1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {l.handle}
                </td>
                {/* Stage */}
                <td style={{ padding: "11px 14px" }}>{pill(l.stage)}</td>
                {/* Quality */}
                <td style={{ padding: "11px 14px" }}>
                  {l.quality ? (
                    <span
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 13,
                        fontWeight: 700,
                        color: qualityColor(l.quality),
                        textShadow: `0 0 6px ${qualityColor(l.quality)}88`,
                      }}
                    >
                      {l.quality}/5
                    </span>
                  ) : (
                    <span style={{ color: C.t4, fontSize: 12 }}>—</span>
                  )}
                </td>
                {/* Setter */}
                <td
                  style={{
                    padding: "11px 14px",
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 11,
                    color: C.blue,
                    whiteSpace: "nowrap",
                  }}
                >
                  {l.setter || rep}
                </td>
                {/* Closer */}
                <td
                  style={{
                    padding: "11px 14px",
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 11,
                    color: C.t3,
                    whiteSpace: "nowrap",
                  }}
                >
                  {l.closer || "—"}
                </td>
                {/* Showed */}
                <td style={{ padding: "11px 14px" }}>
                  {l.showed ? (
                    <span
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color:
                          l.showed === "showed"
                            ? C.green
                            : l.showed === "no-show" || l.showed === "cancelled"
                              ? C.red
                              : C.orange,
                      }}
                    >
                      {l.showed}
                    </span>
                  ) : (
                    <span style={{ color: C.t4, fontSize: 12 }}>—</span>
                  )}
                </td>
                {/* Closed */}
                <td style={{ padding: "11px 14px" }}>
                  {l.closed ? (
                    <span
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 11,
                        fontWeight: 700,
                        color: l.closed === "Yes" ? C.green : C.red,
                        textShadow: `0 0 6px ${l.closed === "Yes" ? C.greenGlow : C.redGlow}`,
                      }}
                    >
                      {l.closed}
                    </span>
                  ) : (
                    <span style={{ color: C.t4, fontSize: 12 }}>—</span>
                  )}
                </td>
                {/* Revenue */}
                <td
                  style={{
                    padding: "11px 14px",
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 12,
                    color: l.revenue ? C.gold : C.t4,
                    whiteSpace: "nowrap",
                    fontWeight: l.revenue ? 700 : 400,
                  }}
                >
                  {l.revenue || "—"}
                </td>
                {/* Actions */}
                <td
                  style={{
                    padding: "11px 14px",
                    whiteSpace: "nowrap",
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={() => startEdit(l)}
                    style={{
                      background: "none",
                      border: `1px solid ${C.border}`,
                      borderRadius: 4,
                      padding: "4px 10px",
                      color: C.t3,
                      cursor: "pointer",
                      fontSize: 11,
                      fontFamily: "'DM Mono',monospace",
                      letterSpacing: "0.08em",
                      transition: "all 0.1s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = C.gold;
                      e.target.style.color = C.gold;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = C.border;
                      e.target.style.color = C.t3;
                    }}
                  >
                    EDIT
                  </button>

                  {/* DROP TO CLOSER — only shows on booked leads */}
                  {l.stage === "booked" && (
                    <button
                      onClick={() => setCloser(l)}
                      style={{
                        background: C.greenDim,
                        border: `1px solid ${C.greenBorder}`,
                        borderRadius: 4,
                        padding: "4px 11px",
                        color: C.green,
                        cursor: "pointer",
                        fontSize: 11,
                        fontFamily: "'DM Mono',monospace",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textShadow: `0 0 8px ${C.greenGlow}`,
                        boxShadow: `0 0 8px ${C.greenDim}`,
                        transition: "all 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(0,255,136,0.18)";
                        e.target.style.boxShadow = `0 0 16px ${C.greenGlow}`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = C.greenDim;
                        e.target.style.boxShadow = `0 0 8px ${C.greenDim}`;
                      }}
                    >
                      DROP →
                    </button>
                  )}

                  <button
                    onClick={() => del(l.id)}
                    style={{
                      background: "none",
                      border: `1px solid ${C.redBorder}`,
                      borderRadius: 4,
                      padding: "4px 10px",
                      color: C.red,
                      cursor: "pointer",
                      fontSize: 11,
                      fontFamily: "'DM Mono',monospace",
                      transition: "all 0.1s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = C.redDim;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "none";
                    }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={TABLE_COLS.length}
                  style={{
                    padding: "48px 14px",
                    textAlign: "center",
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 12,
                    color: C.t4,
                    letterSpacing: "0.14em",
                  }}
                >
                  NO CONVERSATIONS — HIT + ADD TO LOG YOUR FIRST INBOUND DM
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD/EDIT MODAL */}
      {showAdd && (
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
              maxWidth: 560,
              width: "100%",
              maxHeight: "92vh",
              overflowY: "auto",
              animation: "fadeIn 0.2s ease",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: `1px solid ${C.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 22,
                  letterSpacing: "0.12em",
                  color: C.gold,
                  textShadow: `0 0 14px ${C.goldGlow}`,
                }}
              >
                {editId !== null ? "EDIT CONVERSATION" : "NEW CONVERSATION"}
              </span>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setEditId(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: C.t3,
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Dark theme overrides for react-datepicker */}
            <style>{`
              .dp-dark .react-datepicker {
                background: ${C.s2};
                border: 1.5px solid ${C.border};
                border-radius: 8px;
                font-family: 'Barlow', sans-serif;
                color: ${C.t1};
              }
              .dp-dark .react-datepicker__header {
                background: ${C.s3};
                border-bottom: 1px solid ${C.border};
                border-radius: 8px 8px 0 0;
              }
              .dp-dark .react-datepicker__current-month,
              .dp-dark .react-datepicker__day-name {
                color: ${C.t2};
                font-family: 'DM Mono', monospace;
                font-size: 11px;
                letter-spacing: 0.1em;
              }
              .dp-dark .react-datepicker__day {
                color: ${C.t2};
                border-radius: 4px;
              }
              .dp-dark .react-datepicker__day:hover {
                background: ${C.goldDim};
                color: ${C.gold};
              }
              .dp-dark .react-datepicker__day--selected {
                background: ${C.gold};
                color: #000;
                font-weight: 700;
              }
              .dp-dark .react-datepicker__day--today {
                border: 1px solid ${C.goldBorder};
                color: ${C.gold};
              }
              .dp-dark .react-datepicker__day--outside-month {
                color: ${C.t4};
              }
              .dp-dark .react-datepicker__navigation-icon::before {
                border-color: ${C.t3};
              }
              .dp-dark .react-datepicker__triangle {
                display: none;
              }
              .dp-dark .react-datepicker-popper {
                z-index: 600;
              }
            `}</style>

            {/* Fields */}
            <div
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Row: Initial Contact Date + Call Booked Date */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  {LBL("Initial Contact Date")}
                  <DatePicker
                    selected={strToDate(form.date)}
                    onChange={(date) =>
                      setForm((p) => ({ ...p, date: dateToStr(date) }))
                    }
                    dateFormat="MM/dd/yyyy"
                    placeholderText="MM/DD/YYYY"
                    calendarClassName="dp-dark"
                    customInput={
                      <input
                        style={FI}
                        onFocus={(e) =>
                          (e.target.style.borderColor = C.goldBorder)
                        }
                        onBlur={(e) => (e.target.style.borderColor = C.border)}
                      />
                    }
                  />
                </div>
                <div>
                  {LBL("Call Booked Date")}
                  <DatePicker
                    selected={strToDate(form.bookedDate)}
                    onChange={(date) =>
                      setForm((p) => ({ ...p, bookedDate: dateToStr(date) }))
                    }
                    dateFormat="MM/dd/yyyy"
                    placeholderText="MM/DD/YYYY"
                    calendarClassName="dp-dark"
                    customInput={
                      <input
                        style={FI}
                        onFocus={(e) =>
                          (e.target.style.borderColor = C.goldBorder)
                        }
                        onBlur={(e) => (e.target.style.borderColor = C.border)}
                      />
                    }
                  />
                </div>
              </div>

              {/* Row: Name + Instagram Handle */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  {LBL("Name")}
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Full name"
                    style={FI}
                    onFocus={(e) => (e.target.style.borderColor = C.goldBorder)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  />
                </div>
                <div>
                  {LBL("Instagram Handle", true)}
                  <input
                    value={form.handle}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, handle: e.target.value }));
                      setErrHandle(false);
                    }}
                    placeholder="@username"
                    style={{
                      ...FI,
                      borderColor: errHandle ? C.redBorder : C.border,
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = errHandle
                        ? C.redBorder
                        : C.goldBorder)
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = errHandle
                        ? C.redBorder
                        : C.border)
                    }
                  />
                  {errHandle && (
                    <div
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 11,
                        color: C.red,
                        marginTop: 5,
                        textShadow: `0 0 8px ${C.redGlow}`,
                      }}
                    >
                      Handle is required.
                    </div>
                  )}
                </div>
              </div>

              {/* Row: Ad + Keyword */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  {LBL("Ad")}
                  <input
                    value={form.ad}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, ad: e.target.value }))
                    }
                    placeholder="Which ad?"
                    style={FI}
                    onFocus={(e) => (e.target.style.borderColor = C.goldBorder)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  />
                </div>
                <div>
                  {LBL("Keyword")}
                  <input
                    value={form.kw}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, kw: e.target.value }))
                    }
                    placeholder="Triggered keyword"
                    style={FI}
                    onFocus={(e) => (e.target.style.borderColor = C.goldBorder)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  />
                </div>
              </div>

              {/* Quality */}
              <div>
                {LBL("Quality")}
                <select
                  value={form.quality}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, quality: e.target.value }))
                  }
                  style={FI}
                  onFocus={(e) => (e.target.style.borderColor = C.goldBorder)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                >
                  <option value="">— Select quality —</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} —{" "}
                      {n === 1
                        ? "Very Bad"
                        : n === 2
                          ? "Bad"
                          : n === 3
                            ? "Okay"
                            : n === 4
                              ? "Good"
                              : "Perfect"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stage */}
              <div>
                {LBL("Stage")}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                  }}
                >
                  {STAGES.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setForm((p) => ({ ...p, stage: s.key }))}
                      style={{
                        padding: "11px 8px",
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        borderRadius: 5,
                        cursor: "pointer",
                        textAlign: "center",
                        background:
                          form.stage === s.key ? `${s.color}16` : "transparent",
                        color: form.stage === s.key ? s.color : C.t3,
                        border: `2px solid ${form.stage === s.key ? s.color : C.border}`,
                        transition: "all 0.12s",
                        boxShadow:
                          form.stage === s.key
                            ? `0 0 12px ${s.color}66`
                            : "none",
                        textShadow:
                          form.stage === s.key
                            ? `0 0 8px ${s.color}88`
                            : "none",
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* DM Setter (read-only) */}
              <div>
                {LBL("DM Setter")}
                <div
                  style={{
                    ...FI,
                    color: C.blue,
                    fontWeight: 600,
                    cursor: "default",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: C.blue,
                      boxShadow: `0 0 6px ${C.blue}`,
                      flexShrink: 0,
                    }}
                  />
                  {form.setter || rep}
                </div>
              </div>

              {/* Row: Closer + Showed */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  {LBL("Closer")}
                  <select
                    value={form.closer}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, closer: e.target.value }))
                    }
                    style={FI}
                    onFocus={(e) => (e.target.style.borderColor = C.goldBorder)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  >
                    <option value="JP Campbell">JP Campbell</option>
                  </select>
                </div>
                <div>
                  {LBL("Showed")}
                  <select
                    value={form.showed}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, showed: e.target.value }))
                    }
                    style={FI}
                    onFocus={(e) => (e.target.style.borderColor = C.goldBorder)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  >
                    <option value="">— Select —</option>
                    <option value="showed">Showed</option>
                    <option value="no-show">No-Show</option>
                    <option value="reschedule">Reschedule</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="follow-up">Follow-Up</option>
                    <option value="not qualified">Not Qualified</option>
                  </select>
                </div>
              </div>

              {/* Row: Closed + Revenue Contracted */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  {LBL("Closed")}
                  <select
                    value={form.closed}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, closed: e.target.value }))
                    }
                    style={FI}
                    onFocus={(e) => (e.target.style.borderColor = C.goldBorder)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  >
                    <option value="">— Select —</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  {LBL("Revenue Contracted")}
                  <input
                    value={form.revenue}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, revenue: e.target.value }))
                    }
                    placeholder="e.g. $3,500"
                    style={FI}
                    onFocus={(e) => (e.target.style.borderColor = C.goldBorder)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                {LBL("Notes")}
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="Objections, vibe, follow-up context..."
                  style={{
                    ...FI,
                    minHeight: 72,
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = C.goldBorder)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                />
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
                onClick={save}
                style={{
                  flex: 1,
                  padding: "14px 0",
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 16,
                  letterSpacing: "0.14em",
                  background: `linear-gradient(135deg,${C.gold},#0077BB)`,
                  color: "#fff",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                  boxShadow: `0 0 20px ${C.goldGlow}`,
                }}
              >
                SAVE
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setEditId(null);
                }}
                style={{
                  padding: "14px 18px",
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
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUALIFIED LEAD FORMAT MODAL */}
      {closer && (
        <QualifiedLeadModal
          lead={closer}
          rep={rep}
          onClose={() => setCloser(null)}
        />
      )}
    </div>
  );
}
