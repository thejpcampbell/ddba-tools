import { useState } from "react";

const SETTERS = ["Liz", "Dominique", "Zy", "JP"];

const SYSTEM_PROMPT = `You are the DDBA DM Audit Engine — a precision scoring system built directly from the DDBA Division 2 DM Setter Playbook v6.0, authored by JP Campbell and approved by Frank DeLuca.

The prospect is Marcus: The Stuck Operator. Age 28–45. Physical product inventor, hardware founder, DTC product creator. Core pain: stuck between having a real idea and executing it profitably. He does NOT have a knowledge problem. He has a SYSTEMS problem.

ICP — THIS IS OUR PERSON: Physical product, invention, hardware, DTC. Employed/self-employed. Motivated to move now. Tried InventHelp, YouTube, freelancers.
NOT A FIT: Restaurant, SaaS, service business, content creation. Unemployed with no income path. No prior effort.

Key principle: "If he feels seen before he feels sold, you will get the call. If he feels screened before he feels heard, you will get a ghost."

FRANK'S TONE: Direct and grounded. Curious. Human — responds to what was just said. Service-first. Calm confidence. Conversational.
NOT: Hype-driven. Robotic. Desperate. Generic filler ("That's awesome!" "Amazing!" "Love that!" — these kill trust instantly). Salesy.

EMOTIONAL SEQUENCING — THE MOST IMPORTANT HABIT:
Before ANY qualifying question, acknowledge what they just said. NEVER skip this.
Frank named it: RECEIVE then RESPOND then ADVANCE. Never skip RESPOND.

WRONG: PROSPECT: "I've been a nurse 7 years on night shift. I'm done with it." SETTER: "What problem does your product solve?" RESULT: "I think this might be a scam."
RIGHT: PROSPECT: "I've been a nurse 7 years on night shift. I'm done with it." SETTER: "Seven years on nights is a long time. What finally made you decide to do something about it?" RESULT: Trust builds. Call gets booked.

FRANK'S APPROVED PHRASES:
- "Just ping me here when you're done so I can confirm on my end." — post-booking
- "Good. Ideas are the starting point. What's the idea?" — response to "I just have an idea"
- "That makes a lot of sense." — universal bridge before advancing
- "You're definitely not alone in that." — after they share a challenge
- "What made you decide to do something about this now?" — urgency surface
- "Revenue doesn't come from ideas. It comes from execution, systems, and ownership." — credibility drop

BANNED PHRASES — FLAG EVERY INSTANCE:
- "I'll hang here for 5 while you fill that out."
- "Did you see my last message?"
- "That's awesome man!" / "That's great!" / "Amazing!" / "Love that!" / "Absolutely!"
- "Oh yeah, I know the pain."
- "That is a great industry and is continuing to grow."
- "Is this a scheduling issue or a priority issue?"
- "Would you be open to get on a Zoom call to see how we can help?"

BANNED CATEGORIES: Income claims, hype language, guru culture, false promises, fake scarcity, generic filler.

THE 7-STEP CANONICAL SCRIPT (LINEAR — no skipping):
OPENING: Option A (Ad Response): "Hey {name}. Hope you're having a great day." + genuine profile observation if something stands out + "So are you currently working on an invention or is this something you're looking to get started on to bring your idea to life?"
Option B (Late Response): "Hey, just got your message {name}. So you're thinking about launching a product. Are you working on something already or still in the idea stage?"
Option C (New Follower): Trust-first. No booking link. Let it breathe.

STEP 01 — AFFIRM AND SURFACE THE WORK: Repeat back what they said before asking anything. If personal, respond to it first.
SETTER: "{Acknowledge what they said specifically.} That's real commitment. What have you been doing to get it closer to market?"
SETTER: "Love to see the work you've already put into it."

STEP 02 — INDUSTRY: "What industry does your invention fall into?" + tailor the acknowledgment specifically.

STEP 03 — BIGGEST CHALLENGE: "What has been your biggest challenge getting this to market so far?" + "You're definitely not alone in that."
CRITICAL: Their EXACT words from this step MUST be mirrored back in Steps 06 and 07.

STEP 04 — WHY NOW: "So what made you decide to do something about this now?" If vague, dig in: "When you say eventually, are you thinking this year or more of a longer-term thing?"

STEP 05 — GOALS: "Where do you want to take this revenue-wise?" If they give a number: "What does that actually change for you?"

STEP 06 — WHAT ELSE IS HOLDING THEM BACK: "So I know you mentioned {their EXACT blocker from Step 3}. What else is standing between you and actually launching this?" — Use their EXACT words.

STEP 07 — THE INVITE AND TRIPLE LOCK:
SETTER: "Would you be open to jumping on a Zoom with my team to see if there's a fit and we can actually help you get this moving?"
After booking — TRIPLE LOCK (all three required):
LOCK 1 (Edification): "{Closer's name} works directly with inventors at this exact stage, especially around {mirror their EXACT blocker from Step 3}."
LOCK 2 (Pre-call video): "I have a short video to help prepare you for the call. Would you have time to go through it before then?"
LOCK 3 (No-reschedule frame): "One thing. My team's calendar fills fast and we don't typically reschedule. Do everything you can to be in a quiet place so we can actually work through your strategy. Sound good?"

OBJECTION RESPONSES:
"What do you do?": "I work with product inventors and founders to take their idea from concept to a product that's actually in the market generating revenue. Not theory. Built execution systems." Then redirect to timeline.
"I don't have a product yet": "That's actually where most of the people I work with start. Have you thought about what industry you'd want to go after?"
"I just have an idea": "Good. Ideas are the starting point. What's the idea?"
"How much does it cost?": "That's something my team walks through on the strategy call..." — DO NOT give price in DMs.
"I've been burned before": "One of my clients worked with InventHelp for 5 years and made more progress in 4 months with us than in all that time combined. The difference is execution systems, not paperwork. What specifically went wrong for you before?"
Scam pushback: "Totally understand. There's a lot of noise out there and you have every reason to be careful. What specifically feels off to you?" — Hold frame.

CREDIBILITY DROPS (match to situation, one drop then move on):
Corporate/hates job: "I was a mechanical and software engineer. Worked at Caterpillar and top aerospace firms. Hit the ceiling of what a salary can do. So I walked away and built product businesses that actually generate wealth."
Burned by InventHelp: "One of my clients worked with InventHelp for 5 years. Made more progress with us in 4 months than in those 5 years combined."
Doubts it's real: "I don't teach motivation. I build execution systems. Products they can hold in their hand, businesses with actual cash flow."
Sitting on idea for years: "The worst version of this story is the one where you're still sitting on the idea in five more years. You already know it's real. The question is whether this is the year you actually move."

CLIENT RESULTS:
Arthur — InventHelp 5 years, more progress in 4 months with DDBA. Use for: burned before.
Michael — Cried when he opened his production-ready prototype. Use for: emotionally invested.
Jack — Scaled from $2K–$5K months to $25K+ months. Use for: has a revenue goal.

SCORING:
1. Opening and Pattern Interrupt (0–10): Specific to them? Human or scripted?
2. Receive-Respond-Advance (0–20): Acknowledged EVERY message before advancing? Every skip is a violation.
3. Discovery Execution (0–20): All 6 steps? Mirrored blocker in Step 6?
4. Language and Voice (0–15): Banned phrases? Frank's voice maintained?
5. Objection Handling (0–15): Canonical responses used? Frame held?
6. CTA and Triple Lock (0–20): All three Triple Lock elements? Confirmation sequence started?

SCORING STANDARD — BE RUTHLESS:
85–100: Elite. 70–84: Solid. 55–69: Developing. 40–54: Needs work. Below 40: Failing.
Average conversation scores 50–65. Every callout must cite a specific moment and rule.

RETURN ONLY VALID JSON — NO MARKDOWN FENCES:
{
  "overall_score": integer 0-100,
  "grade": "S" or "A" or "B" or "C" or "D" or "F",
  "verdict": "one punchy sentence",
  "categories": [
    { "name": "Opening and Pattern Interrupt", "score": 0-10, "max": 10, "comment": "specific" },
    { "name": "Receive-Respond-Advance", "score": 0-20, "max": 20, "comment": "name every skip" },
    { "name": "Discovery Execution", "score": 0-20, "max": 20, "comment": "which steps ran/skipped" },
    { "name": "Language and Voice", "score": 0-15, "max": 15, "comment": "specific phrases flagged" },
    { "name": "Objection Handling", "score": 0-15, "max": 15, "comment": "canonical response used or missed" },
    { "name": "CTA and Triple Lock", "score": 0-20, "max": 20, "comment": "all three locks checked" }
  ],
  "callouts": [
    {
      "speaker": "SETTER or LEAD",
      "message": "exact message truncated at 140 chars",
      "type": "WIN or FLAG or NOTE",
      "critique": "1-2 sentences citing exact rule from playbook"
    }
  ],
  "wins": ["reinforcement tied to specific playbook rule"],
  "fixes": ["actionable fix with step number or rule citation"],
  "summary": "3-4 sentence executive summary written as JP would deliver it in Monday DM review"
}`;

const gradeConfig = {
  S: { color: "#F0A500", bg: "rgba(240,165,0,0.12)", label: "Elite" },
  A: { color: "#34D399", bg: "rgba(52,211,153,0.1)", label: "Strong" },
  B: { color: "#60A5FA", bg: "rgba(96,165,250,0.1)", label: "Solid" },
  C: { color: "#FBBF24", bg: "rgba(251,191,36,0.1)", label: "Developing" },
  D: { color: "#F97316", bg: "rgba(249,115,22,0.1)", label: "Needs Work" },
  F: { color: "#F87171", bg: "rgba(248,113,113,0.1)", label: "Failing" },
};

const typeConfig = {
  WIN:  { color: "#34D399", bg: "rgba(52,211,153,0.07)",  border: "rgba(52,211,153,0.25)" },
  FLAG: { color: "#F87171", bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.25)" },
  NOTE: { color: "#94A3B8", bg: "rgba(148,163,184,0.05)", border: "rgba(148,163,184,0.2)" },
};

function ScoreBar({ score, max }) {
  const pct = (score / max) * 100;
  const color = pct >= 80 ? "#34D399" : pct >= 60 ? "#FBBF24" : "#F87171";
  return (
    <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginTop: 5 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.6s ease" }} />
    </div>
  );
}

export default function DMAudit() {
  const [transcript, setTranscript] = useState("");
  const [setter, setSetter]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [results, setResults]       = useState(null);
  const [error, setError]           = useState(null);
  const [activeTab, setActiveTab]   = useState("callouts");

  const runAudit = async () => {
    if (!transcript.trim()) return;
    setLoading(true); setError(null); setResults(null);
    try {
      // Calls our Vercel proxy — not Anthropic directly
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `${setter ? `Setter: ${setter}\n\n` : ""}Audit this DM conversation:\n\n${transcript.trim()}` }]
        })
      });
      const data  = await res.json();
      const raw   = data.content?.find(b => b.type === "text")?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      setResults(JSON.parse(clean));
      setActiveTab("callouts");
    } catch {
      setError("Audit failed — check transcript format and try again.");
    } finally {
      setLoading(false);
    }
  };

  const g = results ? (gradeConfig[results.grade] || gradeConfig.C) : null;

  const base = {
    minHeight: "100vh",
    background: "#09090B",
    color: "#E4E4E7",
    fontFamily: "'DM Mono','Courier New',monospace",
    fontSize: 13,
  };

  return (
    <div style={base}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, background: "#F0A500", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#000" }}>D</div>
          <div>
            <div style={{ fontSize: 9, color: "#52525B", letterSpacing: "0.14em", textTransform: "uppercase" }}>DDBA Division 2 · Playbook v6.0</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#F4F4F5", letterSpacing: "0.04em" }}>DM Audit Engine</div>
          </div>
        </div>
        {results && (
          <button onClick={() => { setResults(null); setTranscript(""); setSetter(""); setError(null); }}
            style={{ fontSize: 11, color: "#71717A", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", padding: "5px 12px", borderRadius: 5, cursor: "pointer", letterSpacing: "0.06em", fontFamily: "inherit" }}>
            ← NEW AUDIT
          </button>
        )}
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 24px" }}>
        {!results ? (
          <div>
            {/* Setter */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 9, color: "#52525B", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>Setter</div>
              <div style={{ display: "flex", gap: 6 }}>
                {SETTERS.map(s => (
                  <button key={s} onClick={() => setSetter(setter === s ? "" : s)}
                    style={{ padding: "5px 14px", fontSize: 11, borderRadius: 5, cursor: "pointer", border: setter === s ? "1px solid rgba(240,165,0,0.6)" : "1px solid rgba(255,255,255,0.09)", background: setter === s ? "rgba(240,165,0,0.1)" : "transparent", color: setter === s ? "#F0A500" : "#71717A", fontFamily: "inherit", transition: "all 0.15s", letterSpacing: "0.04em" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Transcript */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: "#52525B", letterSpacing: "0.14em", textTransform: "uppercase" }}>DM Transcript</div>
                <div style={{ fontSize: 10, color: "#3F3F46" }}>Format: SETTER: [msg] · LEAD: [msg]</div>
              </div>
              <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
                placeholder={"SETTER: Hey Marcus. Hope you're having a great day.\n\nLEAD: START\n\nSETTER: So are you currently working on an invention or is this something you're looking to get started on?\n\nLEAD: Yeah I've had this idea for 2 years, just don't know where to start\n\n..."}
                style={{ width: "100%", height: 240, background: "#111113", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 16, fontSize: 12, color: "#D4D4D8", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.75, boxSizing: "border-box", caretColor: "#F0A500" }}
                onFocus={e => e.target.style.borderColor = "rgba(240,165,0,0.35)"}
                onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
              {["7-Step Script", "Receive→Respond→Advance", "Triple Lock", "Language Bank", "Banned Phrases", "ICP Criteria"].map(tag => (
                <span key={tag} style={{ fontSize: 9, color: "#3F3F46", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "3px 8px", letterSpacing: "0.06em" }}>{tag}</span>
              ))}
            </div>

            <button onClick={runAudit} disabled={!transcript.trim() || loading}
              style={{ width: "100%", padding: "13px 0", background: !transcript.trim() || loading ? "#1C1C1E" : "#F0A500", color: !transcript.trim() || loading ? "#3F3F46" : "#000", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", border: "none", borderRadius: 8, cursor: !transcript.trim() || loading ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background 0.15s" }}>
              {loading ? "ANALYZING AGAINST PLAYBOOK v6.0..." : "RUN AUDIT →"}
            </button>

            {error && <div style={{ marginTop: 14, textAlign: "center", fontSize: 11, color: "#F87171" }}>{error}</div>}

            {loading && (
              <div style={{ marginTop: 32, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#52525B", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Scoring against Playbook v6.0</div>
                {["Checking Receive→Respond→Advance on every exchange", "Scoring all 7 steps of the canonical script", "Scanning for banned phrases and retired lines", "Evaluating Triple Lock and confirmation protocol"].map((step, i) => (
                  <div key={i} style={{ fontSize: 11, color: "#3F3F46", padding: "5px 0", animation: `fade 0.5s ease ${i*0.35}s both` }}>{step}...</div>
                ))}
                <style>{`@keyframes fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Hero */}
            <div style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "22px 26px", marginBottom: 14, display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ minWidth: 76, textAlign: "center", background: g.bg, border: `1px solid ${g.color}33`, borderRadius: 10, padding: "14px 0" }}>
                <div style={{ fontSize: 40, fontWeight: 700, color: g.color, lineHeight: 1 }}>{results.grade}</div>
                <div style={{ fontSize: 9, color: g.color, opacity: 0.7, letterSpacing: "0.12em", marginTop: 5, textTransform: "uppercase" }}>{g.label}</div>
              </div>
              <div style={{ textAlign: "center", minWidth: 58 }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: "#F4F4F5" }}>{results.overall_score}</div>
                <div style={{ fontSize: 9, color: "#52525B", letterSpacing: "0.1em" }}>/ 100</div>
              </div>
              <div style={{ width: 1, height: 52, background: "rgba(255,255,255,0.07)" }} />
              <div style={{ flex: 1 }}>
                {setter && <div style={{ fontSize: 9, color: "#F0A500", letterSpacing: "0.14em", marginBottom: 5, textTransform: "uppercase" }}>{setter}</div>}
                <div style={{ fontSize: 14, color: "#F4F4F5", fontWeight: 500, marginBottom: 7, lineHeight: 1.4 }}>{results.verdict}</div>
                <div style={{ fontSize: 11, color: "#71717A", lineHeight: 1.6 }}>{results.summary}</div>
              </div>
            </div>

            {/* Categories */}
            <div style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "18px 22px", marginBottom: 14 }}>
              <div style={{ fontSize: 9, color: "#52525B", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>Category Breakdown — Playbook v6.0</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px" }}>
                {results.categories?.map(cat => (
                  <div key={cat.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#A1A1AA" }}>{cat.name}</span>
                      <span style={{ fontSize: 11, color: "#71717A" }}>{cat.score}<span style={{ color: "#3F3F46" }}>/{cat.max}</span></span>
                    </div>
                    <ScoreBar score={cat.score} max={cat.max} />
                    {cat.comment && <div style={{ fontSize: 10, color: "#52525B", marginTop: 4, lineHeight: 1.5 }}>{cat.comment}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
              {[["callouts","Message Callouts"],["wins","Wins & Fixes"]].map(([id,label]) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  style={{ padding: "7px 16px", fontSize: 11, borderRadius: 6, cursor: "pointer", border: activeTab===id ? "1px solid rgba(240,165,0,0.4)" : "1px solid rgba(255,255,255,0.08)", background: activeTab===id ? "rgba(240,165,0,0.08)" : "transparent", color: activeTab===id ? "#F0A500" : "#71717A", fontFamily: "inherit", letterSpacing: "0.04em", transition: "all 0.15s" }}>
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "callouts" && (
              <div style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {results.callouts?.map((c, i) => {
                    const t = typeConfig[c.type] || typeConfig.NOTE;
                    return (
                      <div key={i} style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: t.color, background: `${t.color}18`, padding: "2px 7px", borderRadius: 3 }}>{c.type}</span>
                          <span style={{ fontSize: 10, color: "#52525B", letterSpacing: "0.08em" }}>{c.speaker}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#71717A", fontStyle: "italic", marginBottom: 7, lineHeight: 1.5 }}>"{c.message}"</div>
                        <div style={{ fontSize: 12, color: "#D4D4D8", lineHeight: 1.6 }}>{c.critique}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "wins" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "#111113", border: "1px solid rgba(52,211,153,0.15)", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ fontSize: 9, color: "#34D399", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>What Worked</div>
                  {results.wins?.map((w, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                      <span style={{ color: "#34D399", fontSize: 12, marginTop: 1, flexShrink: 0 }}>+</span>
                      <span style={{ fontSize: 11, color: "#A1A1AA", lineHeight: 1.6 }}>{w}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#111113", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ fontSize: 9, color: "#F87171", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Fix These</div>
                  {results.fixes?.map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                      <span style={{ color: "#F87171", fontSize: 12, marginTop: 1, flexShrink: 0 }}>→</span>
                      <span style={{ fontSize: 11, color: "#A1A1AA", lineHeight: 1.6 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setResults(null)}
              style={{ marginTop: 14, width: "100%", padding: "11px 0", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#52525B", fontSize: 11, letterSpacing: "0.08em", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={e => { e.target.style.borderColor="rgba(255,255,255,0.2)"; e.target.style.color="#A1A1AA"; }}
              onMouseLeave={e => { e.target.style.borderColor="rgba(255,255,255,0.08)"; e.target.style.color="#52525B"; }}>
              ← BACK TO INPUT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
