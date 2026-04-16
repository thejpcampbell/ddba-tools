export const CATEGORIES = [
  "All",
  "Setter Ops",
  "Closer Ops",
  "Executive Ops",
];

export const STATUS = {
  live: {
    label: "LIVE",
    color: "#00FF41",
    bg: "rgba(0,255,65,0.08)",
    glow: "rgba(0,255,65,0.6)",
  },
  beta: {
    label: "BETA",
    color: "#00AAFF",
    bg: "rgba(0,170,255,0.08)",
    glow: "rgba(0,170,255,0.3)",
  },
  building: {
    label: "BUILDING",
    color: "#0088DD",
    bg: "rgba(255,140,0,0.08)",
    glow: "rgba(255,140,0,0.3)",
  },
  planned: {
    label: "PLANNED",
    color: "#444",
    bg: "rgba(60,60,60,0.15)",
    glow: "transparent",
  },
};

export const DEFAULT_TOOLS = [
  {
    id: "dm-assist",
    name: "Live DM Assist",
    tagline: "Real-time next-move guidance for active DM conversations",
    category: "Setter Ops",
    emoji: "🚀",
    status: "live",
    version: "v7.0",
    url: "__internal__dm-assist",
    note: "Paste the full thread or just the last message — get your next step, 3 copy-ready responses in Frank's voice, and warnings before you make a mistake.",
    internal: true,
  },
  {
    id: "setter-live",
    name: "Setter Live Dashboard",
    tagline: "Live EOD tracker + conversation pipeline for Liz & Chantal",
    category: "Setter Ops",
    emoji: "📊",
    status: "live",
    version: "v1.0",
    url: "__internal__setter-live",
    note: "Live metrics auto-pulled from pipeline. Liz view / Chantal view / JP command view. Push report to ClickUp in one tap.",
    internal: true,
  },
  {
    id: "closer-live",
    name: "Closer Live Dashboard",
    tagline: "JP's closer EOD tracker, pipeline, and KPI scoreboard",
    category: "Closer Ops",
    emoji: "💰",
    status: "live",
    version: "v1.0",
    url: "__internal__closer-live",
    note: "Close Rate, One-Call Close Rate, Show Rate — all live vs. targets. Setter-booked leads auto-feed in. Push EOD report to ClickUp in one tap.",
    internal: true,
  },
];

export const EMPTY_FORM = {
  name: "",
  tagline: "",
  category: "Setter Ops",
  emoji: "🔧",
  status: "live",
  version: "v1.0",
  url: "",
  note: "",
};

export const STORAGE_KEY = "ddba_hub_v2";

export const INPUT_STYLE = {
  width: "100%",
  background: "#030303",
  border: "1px solid #1a1a1a",
  borderRadius: 6,
  padding: "10px 14px",
  fontSize: 13,
  color: "#EEEEF2",
  fontFamily: "'DM Mono',monospace",
  outline: "none",
  boxSizing: "border-box",
  caretColor: "#00AAFF",
  transition: "border-color 0.2s",
};

export const INTERNAL_ROUTES = {
  "__internal__setter-live": "setter-live",
  "__internal__closer-live": "closer-live",
  "__internal__dm-assist": "dm-assist",
};
