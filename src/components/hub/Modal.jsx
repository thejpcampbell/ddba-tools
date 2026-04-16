import { STATUS, CATEGORIES, INPUT_STYLE } from "./constants";

const FIELDS = [
  ["name",    "Tool Name",                                  "DM Audit Engine"],
  ["tagline", "Tagline",                                    "Score setter conversations..."],
  ["url",     "URL (or __internal__pagename for internal)", "https://claude.ai/public/artifacts/..."],
  ["note",    "Short Note",                                 "Paste a transcript → scored audit"],
  ["version", "Version",                                    "v1.0"],
  ["emoji",   "Emoji",                                      "🎯"],
];

export default function Modal({ form, setForm, onSave, onClose, isEdit }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 24, backdropFilter: "blur(8px)" }}>
      <div style={{ borderRadius: 16, padding: "1.5px", background: "linear-gradient(135deg, #00AAFF, #0066AA, #00AAFF, #005599)", width: "100%", maxWidth: 500, boxShadow: "0 0 80px rgba(0,170,255,0.2), 0 0 160px rgba(0,170,255,0.08)" }}>
        <div style={{ background: "linear-gradient(160deg, #0c0900, #070600)", borderRadius: 14, padding: "32px" }}>
          <div style={{ fontSize: 28, fontFamily: "'Bebas Neue','Anton',sans-serif", letterSpacing: "0.12em", marginBottom: 4, background: "linear-gradient(135deg, #33CCFF, #00AAFF, #0088DD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", filter: "drop-shadow(0 0 12px rgba(0,170,255,0.4))" }}>
            {isEdit ? "EDIT TOOL" : "ADD NEW TOOL"}
          </div>
          <div style={{ height: 1, background: "linear-gradient(90deg, #00AAFF, rgba(0,170,255,0.3), transparent)", marginBottom: 28, boxShadow: "0 0 8px rgba(0,170,255,0.4)" }} />

          {FIELDS.map(([key, label, ph]) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'DM Mono',monospace" }}>{label}</div>
              <input
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={ph}
                style={INPUT_STYLE}
                onFocus={e => (e.target.style.borderColor = "rgba(0,170,255,0.5)")}
                onBlur={e  => (e.target.style.borderColor = "#1a1a1a")}
              />
            </div>
          ))}

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'DM Mono',monospace" }}>Category</div>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              style={{ ...INPUT_STYLE, appearance: "none" }}
            >
              {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 10, fontFamily: "'DM Mono',monospace" }}>Status</div>
            <div style={{ display: "flex", gap: 6 }}>
              {Object.entries(STATUS).map(([key, val]) => (
                <button key={key} onClick={() => setForm(f => ({ ...f, status: key }))}
                  style={{
                    flex: 1, padding: "8px 0", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                    borderRadius: 5, cursor: "pointer", fontFamily: "'DM Mono',monospace",
                    border: form.status === key ? `1px solid ${val.color}66` : "1px solid #1a1a1a",
                    background: form.status === key ? val.bg : "transparent",
                    color: form.status === key ? val.color : "#333",
                    boxShadow: form.status === key ? `0 0 10px ${val.glow}` : "none",
                    transition: "all 0.15s",
                  }}>
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onSave}
              style={{ flex: 1, padding: "14px 0", background: "linear-gradient(135deg, #00AAFF, #0077BB, #00AAFF)", color: "#fff", fontSize: 14, fontWeight: 700, letterSpacing: "0.16em", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'Bebas Neue','Anton',sans-serif", boxShadow: "0 0 24px rgba(0,170,255,0.5)" }}>
              {isEdit ? "SAVE CHANGES" : "ADD TOOL"}
            </button>
            <button onClick={onClose}
              style={{ padding: "14px 20px", background: "transparent", color: "#444", fontSize: 11, border: "1px solid #1a1a1a", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
