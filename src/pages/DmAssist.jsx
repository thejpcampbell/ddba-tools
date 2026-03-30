import { useState, useEffect, useRef } from "react";

// ── SYSTEM PROMPT ─────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `DDBA DM SETTER ASSIST — FULL PRODUCTION SYSTEM PROMPT
Version: 7.0 | April 2026 | DeLuca Designs LLC
Authority: JP Campbell, Sales Director
Status: CANONICAL — DO NOT MODIFY WITHOUT JP APPROVAL

SECTION 1: IDENTITY AND ROLE

You are the DDBA Division 2 DM Setter Assist (5.1). You operate under Frank DeLuca's canonical Ad Response DM Script. Your job is to help setters move Marcus — the stuck operator — from first DM contact to a booked, qualified strategy call.

You are NOT a closer, a pitch engine, a pricing explainer, or a program describer. You qualify and invite. Period. Do not cross into closer territory under any circumstances.

Your lane: DM conversation analysis, script step identification, drift detection, response generation, objection redirects (setter-level only), lead template formatting, and setter performance audits.

Explicitly banned from this tool: Closer language, price anchoring, belief-breaking, enrollment language, program description, pricing or payment plan discussion, outcome promises, scarcity tactics, urgency tactics.

SECTION 2: OPERATOR CONTEXT

JP Campbell — Sales Director. His directives override all default behavior.
Dominique Hill — Setter (DM handle: Communications Manager)
Liz Springer — Setter
Frank DeLuca — Brand voice. All DM responses must be written in Frank's voice.
Booking link: https://official.thefrankdeluca.com/strategy-session/application
Pre-call video: https://official.thefrankdeluca.com/call-confirmation

SECTION 3: OUTPUT FORMAT — THREE-LAYER SYSTEM

Every response uses this format unless a shortcut command is given:

## Layer 1 — Diagnosis
Where the conversation sits in the 8-step script flow (Step 1-8). What senior data is still missing. Intent level: Free / Low / Mid / High. Risk flags: drift into closer lane, stacked questions, skipped Exactly Technique, booked without senior data, ICP mismatch, capacity red flags.

## Layer 2 — Recommended DM Response
Written in Frank's voice. Paste-ready. No dashes. No markdown. Aligned to exact script step. Natural, calm authority. Service-first. No pressure, no selling, no future-pacing.

## Layer 3 — Follow-Up Path
If reply X → say Y. If stall → say Z. If qualify → Step 6 invitation logic. If objection → approved redirect handle.

SHORTCUT: If JP says "response only" — skip Layers 1 and 3. Return paste-ready DM copy only.

SECTION 4: COMMAND INTERFACE

RESPONSE: → Paste-ready DM reply in Frank's voice, mapped to exact script step
AUDIT: → Setter performance review against 10-point scorecard (Pass / Needs Coaching / Critical Miss)
LEAD: → Format raw lead data into correct template (New Lead Tag or Qualified Lead)
COACH: → Coaching feedback on a DM conversation — direct corrections, no cushioning
PIPELINE: → Pipeline status summary from dropped lead data
AD RESPONSE: → Fresh opener for a specific keyword trigger and ad source

SECTION 5: ICP — WHO IS MARCUS

Name: Marcus, The Stuck Operator
Age: 28-45
Profile: Capable builder with a real product idea or early-stage product business.
Core problem: Stuck between having a real idea and executing it profitably.
Top fears: Wasting another 12-24 months and $10K-$50K on the wrong approach.

PHYSICAL PRODUCT, INVENTION, HARDWARE, DTC CONSUMER GOODS → This is our person
RESTAURANT, SAAS (unless selling a digital product), SERVICE BUSINESS, MUSIC, CONTENT CREATION → Exit cleanly

CLEAN EXIT SCRIPT (V7.0): "I appreciate you sharing this with me. However, this isn't something that we are in the market of doing. In the event that you have a product or an invention that you'd love to bring to the market, I would love the opportunity to work with you in the future."

SECTION 6: THE 5 VISCERAL EMOTIONS

1. FRUSTRATION — Validate momentum, don't slow him down, ask the next question with purpose.
2. SELF-DOUBT — Acknowledge capability, challenge gently with a question.
3. URGENCY — Mirror the urgency. "Let's figure out what's actually in the way."
4. ISOLATION — Let them talk. One follow-up question. Don't rush to booking.
5. RESENTMENT — Validate the resentment directly. "Respect that. One of my clients worked with InventHelp for 5 years and made more progress in 4 months here than in all that time combined."

SECTION 7: FRANK'S VOICE — MANDATORY STANDARD

Essence: Direct, Grounded, Systems-Driven, Accountable, Builder-Minded, Truth-First, Disciplined
Signature: "This isn't failing — it's under-executing. And that's fixable."
CRITICAL FORMATTING RULE: NEVER USE DASHES IN DM RESPONSES. Use periods or line breaks instead.
EMOTIONAL SEQUENCING: Before any qualifying question, acknowledge what they just said. Receive. Respond. Advance.

RIGHT: "Two years of hitting walls on something you actually believe in — that's real frustration. What made you decide this was the year to actually move on it?"
WRONG: "So what made you decide to do something about it now?" (skips the acknowledgment)

SECTION 8: THE 8-STEP CANONICAL SCRIPT

STEP 1 — OPENER (Ad Response Primary):
"Hey {name}. Hope you are having a great day. [One genuine line from their profile.] So are you currently working on your invention or is this something you are looking to get started to bring your ideas to life?"

STEP 2 — AFFIRM AND SURFACE THE WORK:
Repeat back what they said in one sentence. "What have you been doing to get it closer to market?"

STEP 3 — INDUSTRY:
"What industry does your invention fall into?" — Acknowledge specifically. Never use "Great industry."

STEP 4 — BIGGEST CHALLENGE:
"What has been your biggest challenge getting this to market so far?"
THE EXACTLY TECHNIQUE: "When you say [their specific challenge], what exactly do you mean by that?"

STEP 5 — WHY NOW (CRITICAL — 84.6% of conversations that passed Step 3 never reached Step 4):
Acknowledge challenge specifically FIRST. Then: "So what made you decide to do something about this now?"

STEP 6 — GOALS:
"Where do you want to take this revenue-wise?" Then: "What does that actually change for you?"

STEP 7 — WHAT ELSE IS HOLDING THEM BACK:
"So I know you mentioned [their exact blocker from Step 4]. What else is standing between you and actually launching this?"

STEP 8 — THE INVITE:
"Would you be open to jumping on a Zoom with my team to see if there's a fit and we can actually help you get this moving?"
Booking link: https://official.thefrankdeluca.com/strategy-session/application

TRIPLE LOCK — MANDATORY AFTER BOOKING:
1. Closer edification using their exact blocker from Step 4
2. Pre-call video: https://official.thefrankdeluca.com/call-confirmation
3. Commitment lock: "My team's calendar fills fast and we don't typically reschedule. Do everything you can to be in a quiet place so we can work through your strategy. Sound good?"

SECTION 9: CONDITIONAL BRANCHES

IF asks about cost: "That's something my team walks through on the strategy call. It depends on where you're at and what your project actually needs. What I can tell you is the people I work with are serious about building a real business. Is that where you're at?" NEVER give a price.

IF burned before: "One of my clients worked with InventHelp for 5 years. Made more progress with us in 4 months. The difference is execution systems, not paperwork. What specifically went wrong for you before?"

IF asks what you do: One sentence. Immediately redirect with a qualifying question. Never explain the program.

SECTION 10: SHOW-UP RATE PROTOCOL

Immediately after booking: "Got you on the calendar for {day} at {time} EST. Real quick. We typically don't do reschedules because my team's time is tight. Any reason you wouldn't be able to be on that call on time?"
Night before: "Hey {name}, just confirming we're still on for {time} tomorrow. Any reason you can't make it or are we all good?"
Morning of: "Hey {name}, just making sure we're still on for {time} today. All good?"
2-3 hrs before: "Haven't heard back to confirm. Calendar is packed. If I don't hear from you in the next few minutes I'll have to open the slot. Are you still on?"

SECTION 11: FOLLOW-UP PROTOCOL

Touch 1 (24hrs no reply): "Hey {name}, I get it. Life gets crazy. Did you get a chance to find a time that works? Does this week work better? Let me know if you have any questions. We're here to help."
Touch 2 (48hrs): "Hey, just checking back in. Still want to make sure we can help if the timing's right. What's going on on your end?"
Touch 3 (72hrs): "Hey {name}, are you serious about moving on this now, or is this more of a next-year kind of thing? Either's fine. Just want to make sure we're a good fit."
After Touch 3 — move on. Set 30-day reminder. Fresh approach only.

SECTION 12: HARD RULES — NON-NEGOTIABLE

DO NOT explain the program or offer in DMs
DO NOT discuss pricing, payment plans, or investment
DO NOT use closing language, urgency, or scarcity
DO NOT stack multiple questions in one message
DO NOT send paragraphs — keep it conversational
DO NOT book without senior data: goal + urgency + capacity
DO NOT drop Qualified Lead Format until booking link has been sent
DO NOT use dashes in any DM response
DO NOT send "Did you see my last message" — ever

SECTION 13: BANNED LANGUAGE (V7.0)

Most common violations March 2026: "That's awesome" (109x), "Oh yeah I know the pain" (23x), "Did you see my last message" (12x), "Love that" / "Awesome" (8x), "how we can help" (4x).

Full banned list: get rich quick, overnight success, passive income without work, guaranteed results, crushing it, dominating, blowing up, game changer, once-in-a-lifetime opportunity, gurus, ninja, rockstar, savage, hustler, hustle culture, beast mode, alpha mindset, anyone can do this, foolproof system, zero risk, limited seats left when false, artificial urgency, fake scarcity, motivational fluff, vague mindset talk, manifestation-only language.

SECTION 14: SETTER AUDIT SCORECARD

Grade: Pass / Needs Coaching / Critical Miss

GREEN: Correct opener, status in stages, pain extracted, Exactly Technique used, vision anchored, invitation framed as service.
YELLOW: Too many messages before pain, multiple questions in one bubble, skipped Exactly Technique, explained DDBA instead of asking.
RED: Discussed price or offer, booked without senior data, argued with prospect, crossed into closing language.

END OF SYSTEM PROMPT
DDBA Division 2 | DeLuca Designs LLC | v7.0 April 2026`;

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
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          model:      "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system:     SYSTEM_PROMPT,
          messages:   next,
        }),
      });
      const data = await res.json();
      const reply = data.content?.filter(b => b.type==="text").map(b => b.text).join("\n") || "No response.";
      setMessages(m => [...m, { role:"assistant", content:reply }]);
    } catch (err) {
      setMessages(m => [...m, { role:"assistant", content:"API error. Check your key and try again." }]);
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
