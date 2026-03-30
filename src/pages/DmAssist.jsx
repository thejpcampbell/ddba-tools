import { useState, useEffect, useRef } from "react";

// ── SYSTEM PROMPT — COMPRESSED v7.0 + FEW-SHOT ───────────────────────────
const SYSTEM_PROMPT = `DDBA DM SETTER ASSIST v7.0 — JP Campbell, Sales Director

ROLE: Help setters move Marcus (stuck inventor, 28-45, physical product) from first DM to a booked strategy call. Qualify and invite only. No closing, no pricing, no program description.

SETTERS: Dominique Hill, Liz Springer. Voice: Frank DeLuca.
Booking: https://official.thefrankdeluca.com/strategy-session/application
Pre-call video: https://official.thefrankdeluca.com/call-confirmation

OUTPUT FORMAT (always):
## Layer 1 — Diagnosis
Script step (1-8). Missing senior data. Intent: Free/Low/Mid/High. Risk flags.
## Layer 2 — Recommended DM Response
Frank's voice. Paste-ready. NO DASHES. One question only. No paragraphs. Max 3 sentences.
## Layer 3 — Follow-Up Path
If X then say Y. Objection handles. Next move logic.
Shortcut: "response only" = Layer 2 only.

LAYER 2 QUALITY RULES — CHECK BEFORE OUTPUTTING:
1. No dashes anywhere. Use periods or line breaks.
2. One question only. Never stack two questions.
3. Maximum 3 sentences total.
4. Must acknowledge what they just said before asking anything.
5. Sounds like a real human text. Not a template. Not a script.
6. Never starts with "That's" or "Great" or "Love" or "Awesome."
7. No program description. No price. No urgency.

LAYER 2 EXAMPLES — MATCH THIS VOICE EXACTLY:

EXAMPLE A (S2 — prospect said they have a product idea for 2 years):
WRONG: "That's awesome! So what have you been doing to get it closer to market?"
RIGHT: "Two years is a long time to be sitting on something real. What have you actually been doing to move it forward?"

EXAMPLE B (S4 — prospect said their challenge is manufacturing):
WRONG: "I totally understand, manufacturing is tough! When you say manufacturing, what exactly do you mean by that?"
RIGHT: "Manufacturing is where most good products stall. When you say that's been the challenge, what exactly do you mean. Cost, finding the right partner, minimum orders?"

EXAMPLE C (S5 — prospect said they want to move now because they lost their job):
WRONG: "Oh yeah I know the pain. So what made you decide to do something about it now?"
RIGHT: "Losing the job and still choosing to build instead of just find another one. That says something. What made this the thing you went all in on?"

EXAMPLE D (S6 — prospect gave revenue goal of $10K/month):
WRONG: "That's a great goal! What does that actually change for you?"
RIGHT: "Ten thousand a month. What does that number actually change for you when it hits?"

EXAMPLE E (S8 — all senior data collected):
WRONG: "So would you be interested in jumping on a call to see how we can help you?"
RIGHT: "Would you be open to jumping on a Zoom with my team to see if there's a fit and we can actually help you get this moving?"

EXAMPLE F (prospect asked what you do):
WRONG: "We are a product development company that helps inventors bring their ideas to market through our proven system."
RIGHT: "We work with product inventors and founders to take ideas from concept to something that's actually in the market. Are you working on something already or still in the idea stage?"

ICP: Physical product, invention, hardware, DTC. Employed/self-employed, has capital. NOT: restaurant, SaaS, service, music, content.
Exit: "I appreciate you sharing this. However, this isn't something we are in the market of doing. In the event you have a product or invention you'd love to bring to market, I would love the opportunity to work with you in the future."

8-STEP SCRIPT:
S1 OPENER: "Hey {name}. Hope you are having a great day. [One genuine profile line.] So are you currently working on your invention or is this something you are looking to get started to bring your ideas to life?"
S2 AFFIRM: Repeat back what they said. "What have you been doing to get it closer to market?"
S3 INDUSTRY: "What industry does your invention fall into?" Acknowledge specifically. Never say "Great industry."
S4 CHALLENGE: "What has been your biggest challenge getting this to market so far?" EXACTLY TECHNIQUE: "When you say [their words], what exactly do you mean by that?" Their answer = most important data point.
S5 WHY NOW: Acknowledge challenge FIRST. Then: "So what made you decide to do something about this now?" If vague: "Are you thinking this year or more long-term?"
S6 GOALS: "Where do you want to take this revenue-wise?" Then: "What does that actually change for you?" Get the personal driver.
S7 WHAT ELSE: "So I know you mentioned [exact S4 words]. What else is standing between you and actually launching this?"
S8 INVITE: "Would you be open to jumping on a Zoom with my team to see if there's a fit and we can actually help you get this moving?" After yes: send booking link. Stay until complete.

TRIPLE LOCK post-booking: (1) Closer edification using exact S4 blocker. (2) Pre-call video link. (3) "My team's calendar fills fast and we don't typically reschedule. Do everything you can to be in a quiet place. Sound good?"

SENIOR DATA REQUIRED: product, industry, challenge, why now, goals, open to help.

HANDLES:
Price: "That's something my team walks through on the call. The people I work with are serious about building a real business. Is that where you're at?" NEVER give a price.
Burned before: "One of my clients worked with InventHelp for 5 years. More progress in 4 months here. The difference is execution systems, not paperwork. What specifically went wrong?"
Hostile: "Totally understand. What specifically feels off to you?" Stay grounded.

FOLLOW-UP: T1 (24hr): "Hey {name}, I get it. Life gets crazy. Did you get a chance to find a time that works?" T2 (48hr): "Just checking back. Still want to help if timing is right. What's going on?" T3 (72hr): "Are you serious about moving on this now or more next-year? Either's fine." After T3: move on, 30-day reminder.

SHOW-UP: Post-booking: "Got you on the calendar for {day} at {time} EST. We don't typically reschedule. Any reason you couldn't make it?" Night before/morning of/2hr before: confirm each time.

VOICE: Direct, grounded, calm authority. Sounds like a real person texting. Short. Human. No filler.
BANNED WORDS IN LAYER 2: "That's awesome" / "That's great" / "Love that" / "Amazing" / "Totally" / "Oh yeah" / "Did you see my message" / any dash character.

EMOTIONAL SEQUENCING: Acknowledge before advancing. Mirror their specific words back. Then one question.

AUDIT GRADE: Pass / Needs Coaching / Critical Miss
GREEN: Correct opener, staged questions, pain extracted, Exactly Technique, vision anchored, service-framed invite.
YELLOW: Stacked questions, skipped Exactly, explained DDBA.
RED: Price discussion, booked without senior data, argued, closing language.

COMMANDS: RESPONSE / AUDIT / LEAD / COACH / PIPELINE / AD RESPONSE`;

// ── COLORS ────────────────────────────────────────────────────────────────
const C = {
  primary:   "#00AAFF",
  primaryDim:"rgba(0,170,255,0.12)",
  primaryBorder:"rgba(0,170,255,0.35)",
  green:     "#00FF88",
  greenDim:  "rgba(0,255,136,0.10)",
  greenBorder:"rgba(0,255,136,0.35)",
  red:       "#FF4444",
  redDim:    "rgba(255,68,68,0.10)",
  redBorder: "rgba(255,68,68,0.35)",
  amber:     "#FFB800",
  amberDim:  "rgba(255,184,0,0.10)",
  amberBorder:"rgba(255,184,0,0.35)",
  t1: "#EEEEF2", t2: "#AAAAB8", t3: "#70708A", t4: "#44445A",
  bg: "#111114", s1: "#161619", s2: "#1C1C20", s3: "#242428",
  border: "#2A2A32", borderHi: "#3E3E4E",
};

// Layer color map
const LAYER_COLORS = {
  1: { bg:"rgba(0,255,136,0.04)",  border:"rgba(0,255,136,0.2)",  label:"#00FF88", tag:"LAYER 1 · DIAGNOSIS"        },
  2: { bg:"rgba(0,170,255,0.05)",  border:"rgba(0,170,255,0.25)", label:"#00AAFF", tag:"LAYER 2 · DM RESPONSE"      },
  3: { bg:"rgba(255,68,68,0.04)",  border:"rgba(255,68,68,0.2)",  label:"#FF7777", tag:"LAYER 3 · FOLLOW-UP PATH"   },
};

// ── HELPERS ───────────────────────────────────────────────────────────────
function parseLayerContent(text) {
  const l1 = text.match(/##\s*Layer 1[^#\n]*([\s\S]*?)(?=##\s*Layer 2|$)/i);
  const l2 = text.match(/##\s*Layer 2[^#\n]*([\s\S]*?)(?=##\s*Layer 3|$)/i);
  const l3 = text.match(/##\s*Layer 3[^#\n]*([\s\S]*?)$/i);
  if (l1 || l2 || l3) {
    return {
      structured: true,
      layer1: l1 ? l1[1].trim() : null,
      layer2: l2 ? l2[1].trim() : null,
      layer3: l3 ? l3[1].trim() : null,
    };
  }
  return { structured: false, raw: text };
}

function stripMarkdown(text) {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/#{1,6}\s/g, "").trim();
}

// ── GLOBAL STYLES ─────────────────────────────────────────────────────────
function useStyles() {
  useEffect(() => {
    if (document.getElementById("dm-assist-styles")) return;
    const s = document.createElement("style");
    s.id = "dm-assist-styles";
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
      @keyframes goldDot{0%,100%{box-shadow:0 0 5px 2px rgba(0,170,255,0.9),0 0 12px rgba(0,170,255,0.5)}50%{box-shadow:0 0 9px 4px rgba(0,170,255,1),0 0 22px rgba(0,170,255,0.7)}}
      @keyframes scanline{0%{top:-2px}100%{top:100%}}
      @keyframes dmFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes thinking{0%,80%,100%{opacity:0.2;transform:scale(0.8)}40%{opacity:1;transform:scale(1)}}
      .dm-msg{animation:dmFadeIn 0.2s ease}
      .dm-dot span{width:6px;height:6px;background:#00AAFF;border-radius:50%;display:inline-block;animation:thinking 1.2s ease-in-out infinite}
      .dm-dot span:nth-child(2){animation-delay:0.2s}
      .dm-dot span:nth-child(3){animation-delay:0.4s}
      textarea.dm-input{resize:none;outline:none;scrollbar-width:thin}
      textarea.dm-input::-webkit-scrollbar{width:3px}
      textarea.dm-input::-webkit-scrollbar-thumb{background:#2A2A32;border-radius:2px}
    `;
    document.head.appendChild(s);
  }, []);
}

// ── LAYER BLOCK ───────────────────────────────────────────────────────────
function LayerBlock({ num, content }) {
  const [copied, setCopied] = useState(false);
  const lc = LAYER_COLORS[num];
  const copy = () => {
    navigator.clipboard.writeText(stripMarkdown(content)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };
  return (
    <div style={{ background:lc.bg, border:`1px solid ${lc.border}`, borderRadius:8, overflow:"hidden", marginBottom:8 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 14px", borderBottom:`1px solid ${lc.border}` }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.14em", color:lc.label }}>{lc.tag}</span>
        {num === 2 && (
          <button onClick={copy}
            style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.1em", padding:"3px 10px", borderRadius:3, cursor:"pointer", background:copied?"rgba(0,255,136,0.15)":"transparent", border:`1px solid ${copied?C.greenBorder:C.border}`, color:copied?C.green:C.t3, transition:"all 0.15s" }}>
            {copied ? "COPIED ✓" : "COPY"}
          </button>
        )}
      </div>
      <div style={{ padding:"14px", fontFamily:"'Barlow',sans-serif", fontSize:14, lineHeight:1.75, color:C.t1, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
        {stripMarkdown(content)}
      </div>
    </div>
  );
}

// ── COMMAND CHIPS ─────────────────────────────────────────────────────────
const COMMANDS = ["RESPONSE","AUDIT","LEAD","COACH","PIPELINE","AD RESPONSE"];

// ── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function DmAssist({ onNavigate }) {
  useStyles();
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [imageData,   setImageData]   = useState(null);
  const [imagePreview,setImagePreview]= useState(null);
  const bottomRef  = useRef(null);
  const fileRef    = useRef(null);
  const textareaRef= useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(",")[1];
      setImageData({ base64, mediaType: file.type });
      setImagePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageData(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const send = async (overrideInput) => {
    const text = overrideInput ?? input;
    if (!text.trim() && !imageData) return;
    if (loading) return;

    const content = [];
    if (imageData) content.push({ type:"image", source:{ type:"base64", media_type:imageData.mediaType, data:imageData.base64 } });
    if (text.trim()) content.push({ type:"text", text:text.trim() });

    const userMsg = { role:"user", content };
    const next    = [...messages, userMsg];
    setMessages(next);
    setInput("");
    clearImage();
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          model:      "claude-haiku-4-5-20251001",
          max_tokens: 1500,
          system:     SYSTEM_PROMPT,
          messages:   next,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages(m => [...m, { role:"assistant", content:`API error: ${data.error || res.status}` }]);
        return;
      }
      const reply = data.content?.filter(b => b.type==="text").map(b => b.text).join("\n") || JSON.stringify(data);
      setMessages(m => [...m, { role:"assistant", content:reply }]);
    } catch (err) {
      setMessages(m => [...m, { role:"assistant", content:`Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const FI = { background:C.s2, fontFamily:"'Barlow',sans-serif", fontSize:13, color:C.t1 };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.t1, display:"flex", flexDirection:"column" }}>
      {/* BG grid */}
      <div style={{ position:"fixed", inset:0, backgroundImage:`linear-gradient(rgba(0,170,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,170,255,0.025) 1px,transparent 1px)`, backgroundSize:"60px 60px", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", top:-200, left:"50%", transform:"translateX(-50%)", width:800, height:500, background:`radial-gradient(ellipse,rgba(0,170,255,0.07) 0%,transparent 65%)`, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,rgba(0,170,255,0.1) 20%,rgba(0,204,255,0.07) 50%,rgba(0,170,255,0.1) 80%,transparent)`, animation:"scanline 7s linear infinite", pointerEvents:"none", zIndex:1 }} />

      <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", height:"100vh" }}>

        {/* HEADER */}
        <div style={{ background:"rgba(17,17,20,0.95)", borderBottom:`2px solid rgba(0,170,255,0.15)`, padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, backdropFilter:"blur(20px)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:C.primary, animation:"goldDot 2s ease-in-out infinite", flexShrink:0 }} />
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:"0.1em", color:C.primary, textShadow:`0 0 14px rgba(0,170,255,0.8)` }}>LIVE DM ASSIST</span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:C.t4, letterSpacing:"0.1em" }}>v7.0 · Frank's Voice · DDBA Division 2</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={() => { setMessages([]); clearImage(); setInput(""); }}
              style={{ fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:700, letterSpacing:"0.12em", padding:"7px 14px", background:"transparent", border:`1px solid ${C.border}`, color:C.t3, borderRadius:4, cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.target.style.borderColor=C.borderHi;e.target.style.color=C.t1;}}
              onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.t3;}}>
              NEW SESSION
            </button>
            <button onClick={() => onNavigate("hub")}
              style={{ fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:"0.12em", padding:"7px 14px", background:"transparent", border:`1px solid ${C.border}`, color:C.t3, borderRadius:4, cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.target.style.color=C.primary;e.target.style.borderColor=C.primaryBorder;}}
              onMouseLeave={e=>{e.target.style.color=C.t3;e.target.style.borderColor=C.border;}}>
              Hub →
            </button>
          </div>
        </div>

        {/* MESSAGES AREA */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", maxWidth:860, width:"100%", margin:"0 auto", boxSizing:"border-box" }}>

          {/* Welcome state */}
          {messages.length === 0 && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"50vh", textAlign:"center", gap:24 }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:48, letterSpacing:"0.06em", color:C.primary, textShadow:`0 0 28px rgba(0,170,255,0.5)`, lineHeight:1 }}>DM SETTER ASSIST</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:C.t3, letterSpacing:"0.16em", textTransform:"uppercase" }}>ACTIVE · DDBA Division 2 · v7.0</div>
              <div style={{ fontFamily:"'Barlow',sans-serif", fontSize:14, color:C.t2, maxWidth:400, lineHeight:1.7 }}>
                Drop a screenshot, paste a DM transcript, or type a command. Three-layer output. Layer 2 is paste-ready.
              </div>
              {/* Command chips */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginTop:8 }}>
                {COMMANDS.map(cmd => (
                  <button key={cmd} onClick={() => { setInput(cmd + ": "); textareaRef.current?.focus(); }}
                    style={{ fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.1em", padding:"6px 14px", background:C.primaryDim, border:`1px solid ${C.primaryBorder}`, color:C.primary, borderRadius:4, cursor:"pointer", transition:"all 0.15s" }}
                    onMouseEnter={e=>{e.target.style.background="rgba(0,170,255,0.2)";}}
                    onMouseLeave={e=>{e.target.style.background=C.primaryDim;}}>
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => {
            if (msg.role === "user") {
              return (
                <div key={i} className="dm-msg" style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
                  <div style={{ background:C.s2, border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 16px", maxWidth:"75%", fontFamily:"'Barlow',sans-serif", fontSize:14, lineHeight:1.7, color:C.t1, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                    {Array.isArray(msg.content)
                      ? msg.content.map((b, bi) => {
                          if (b.type === "text") return <span key={bi}>{b.text}</span>;
                          if (b.type === "image") return <img key={bi} src={`data:${b.source.media_type};base64,${b.source.data}`} alt="Screenshot" style={{ maxWidth:"100%", maxHeight:260, borderRadius:6, display:"block", marginTop:8 }} />;
                          return null;
                        })
                      : msg.content
                    }
                  </div>
                </div>
              );
            }

            // Assistant message
            const parsed = parseLayerContent(typeof msg.content === "string" ? msg.content : "");
            return (
              <div key={i} className="dm-msg" style={{ marginBottom:20 }}>
                {parsed.structured ? (
                  <>
                    {parsed.layer1 && <LayerBlock num={1} content={parsed.layer1} />}
                    {parsed.layer2 && <LayerBlock num={2} content={parsed.layer2} />}
                    {parsed.layer3 && <LayerBlock num={3} content={parsed.layer3} />}
                  </>
                ) : (
                  <div style={{ background:C.s1, border:`1px solid ${C.border}`, borderRadius:8, padding:"14px 16px", fontFamily:"'Barlow',sans-serif", fontSize:14, lineHeight:1.75, color:C.t1, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                    {parsed.raw}
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking */}
          {loading && (
            <div className="dm-msg" style={{ marginBottom:16 }}>
              <div className="dm-dot" style={{ background:C.s1, border:`1px solid ${C.border}`, borderRadius:8, padding:"16px", display:"inline-flex", gap:6, alignItems:"center" }}>
                <span/><span/><span/>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT AREA */}
        <div style={{ background:"rgba(17,17,20,0.97)", borderTop:`1px solid ${C.border}`, padding:"12px 28px 18px", flexShrink:0, backdropFilter:"blur(20px)" }}>
          <div style={{ maxWidth:860, margin:"0 auto" }}>
            {/* Image preview */}
            {imagePreview && (
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, padding:"8px 10px", background:C.s2, border:`1px solid ${C.border}`, borderRadius:6, width:"fit-content" }}>
                <img src={imagePreview} alt="Preview" style={{ width:44, height:44, objectFit:"cover", borderRadius:4 }} />
                <button onClick={clearImage} style={{ background:"none", border:"none", color:C.t3, fontSize:18, cursor:"pointer", lineHeight:1, padding:"0 4px" }}>×</button>
              </div>
            )}

            {/* Input row */}
            <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
              {/* Image attach */}
              <button onClick={() => fileRef.current?.click()}
                style={{ width:40, height:40, borderRadius:6, background:"transparent", border:`1px solid ${C.border}`, color:C.t3, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}
                onMouseEnter={e=>{e.target.style.borderColor=C.primaryBorder;e.target.style.color=C.primary;}}
                onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.t3;}}>
                📎
              </button>
              <input type="file" ref={fileRef} onChange={handleImage} accept="image/*" style={{ display:"none" }} />

              {/* Text input */}
              <textarea
                ref={textareaRef}
                className="dm-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Drop a DM transcript, paste a convo, or type a command..."
                rows={1}
                style={{ flex:1, background:C.s2, border:`1px solid ${C.border}`, borderRadius:6, padding:"10px 14px", color:C.t1, fontFamily:"'Barlow',sans-serif", fontSize:14, lineHeight:1.6, minHeight:40, maxHeight:160, overflowY:"auto", transition:"border-color 0.15s" }}
                onFocus={e=>e.target.style.borderColor=C.primaryBorder}
                onBlur={e=>e.target.style.borderColor=C.border}
              />

              {/* Send */}
              <button onClick={() => send()}
                disabled={loading || (!input.trim() && !imageData)}
                style={{ width:40, height:40, borderRadius:6, background:loading||(!input.trim()&&!imageData)?"#1C1C20":`linear-gradient(135deg,#33CCFF,${C.primary},#0077CC)`, border:"none", color:loading||(!input.trim()&&!imageData)?C.t4:"#fff", cursor:loading||(!input.trim()&&!imageData)?"not-allowed":"pointer", fontSize:18, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s", boxShadow:!loading&&(input.trim()||imageData)?`0 0 16px rgba(0,170,255,0.4)`:"none" }}>
                {loading ? "·" : "↑"}
              </button>
            </div>

            {/* Command shortcuts row */}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
              {COMMANDS.map(cmd => (
                <button key={cmd} onClick={() => { setInput(cmd + ": "); textareaRef.current?.focus(); }}
                  style={{ fontFamily:"'DM Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:"0.1em", padding:"3px 8px", background:"transparent", border:`1px solid ${C.border}`, color:C.t4, borderRadius:3, cursor:"pointer", transition:"all 0.1s" }}
                  onMouseEnter={e=>{e.target.style.borderColor=C.primaryBorder;e.target.style.color=C.primary;e.target.style.background=C.primaryDim;}}
                  onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.t4;e.target.style.background="transparent";}}>
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
