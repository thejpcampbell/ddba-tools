import { TODAY } from "../../shared/dateConstants.js";

const CLOSER_KEY = "jp";
export const PIPE_KEY = `closer:${CLOSER_KEY}:pipeline`;
export const HIST_KEY = `closer:${CLOSER_KEY}:eod:history`;
export const EOD_KEY_FN = () => `closer:${CLOSER_KEY}:eod:${TODAY}`;
export const SETTER_KEYS = [
  { key: "setter:liz:pipeline", rep: "Liz" },
  { key: "setter:chantal:pipeline", rep: "Chantal" },
];

export const STAGES = [
  {
    key: "booked",
    label: "Booked",
    color: "#00AAFF",
    glow: "rgba(0,170,255,0.8)",
    dim: "rgba(0,170,255,0.12)",
    border: "rgba(0,170,255,0.35)",
    trap: false,
  },
  {
    key: "ssTaken",
    label: "SS Taken",
    color: "#00CCFF",
    glow: "rgba(0,204,255,0.8)",
    dim: "rgba(0,204,255,0.10)",
    border: "rgba(0,204,255,0.35)",
    trap: false,
  },
  {
    key: "noshow",
    label: "No-Show",
    color: "#FF4444",
    glow: "rgba(255,68,68,0.8)",
    dim: "rgba(255,68,68,0.10)",
    border: "rgba(255,68,68,0.35)",
    trap: true,
  },
  {
    key: "cancelled",
    label: "Cancelled",
    color: "#FF9944",
    glow: "rgba(255,153,68,0.8)",
    dim: "rgba(255,153,68,0.10)",
    border: "rgba(255,153,68,0.35)",
    trap: false,
  },
  {
    key: "offer",
    label: "Offer Made",
    color: "#00CCFF",
    glow: "rgba(0,204,255,0.8)",
    dim: "rgba(0,204,255,0.10)",
    border: "rgba(0,204,255,0.35)",
    trap: false,
  },
  {
    key: "verbal",
    label: "Verbal Yes",
    color: "#FFB800",
    glow: "rgba(255,184,0,0.8)",
    dim: "rgba(255,184,0,0.12)",
    border: "rgba(255,184,0,0.35)",
    trap: true,
  },
  {
    key: "deposit",
    label: "Deposit",
    color: "#AA88FF",
    glow: "rgba(170,136,255,0.8)",
    dim: "rgba(170,136,255,0.10)",
    border: "rgba(170,136,255,0.35)",
    trap: false,
  },
  {
    key: "closed",
    label: "Closed",
    color: "#00FF88",
    glow: "rgba(0,255,136,0.8)",
    dim: "rgba(0,255,136,0.10)",
    border: "rgba(0,255,136,0.35)",
    trap: false,
  },
  {
    key: "reoffer",
    label: "Re-offer Sched.",
    color: "#00DDCC",
    glow: "rgba(0,221,204,0.8)",
    dim: "rgba(0,221,204,0.10)",
    border: "rgba(0,221,204,0.35)",
    trap: false,
  },
  {
    key: "handedoff",
    label: "Handed Off",
    color: "#00FF88",
    glow: "rgba(0,255,136,0.8)",
    dim: "rgba(0,255,136,0.10)",
    border: "rgba(0,255,136,0.35)",
    trap: false,
  },
];
export const SM = {};
STAGES.forEach((s) => (SM[s.key] = s));

// Setter pipeline stages (for unified view)
export const SETTER_STAGES = [
  {
    key: "new",
    label: "New DM",
    color: "#909090",
    glow: "rgba(144,144,144,0.6)",
    dim: "rgba(144,144,144,0.08)",
    border: "rgba(144,144,144,0.25)",
    trap: false,
  },
  {
    key: "opener",
    label: "Opener Sent",
    color: "#44AAFF",
    glow: "rgba(68,170,255,0.6)",
    dim: "rgba(68,170,255,0.08)",
    border: "rgba(68,170,255,0.25)",
    trap: false,
  },
  {
    key: "pain",
    label: "Pain",
    color: "#FF9944",
    glow: "rgba(255,153,68,0.6)",
    dim: "rgba(255,153,68,0.08)",
    border: "rgba(255,153,68,0.25)",
    trap: false,
  },
  {
    key: "link",
    label: "Link Sent",
    color: "#CC99FF",
    glow: "rgba(204,153,255,0.6)",
    dim: "rgba(204,153,255,0.08)",
    border: "rgba(204,153,255,0.25)",
    trap: false,
  },
  {
    key: "booked",
    label: "Booked",
    color: "#FFD700",
    glow: "rgba(255,215,0,0.6)",
    dim: "rgba(255,215,0,0.08)",
    border: "rgba(255,215,0,0.25)",
    trap: false,
  },
  {
    key: "disq",
    label: "Disq'd",
    color: "#FF4444",
    glow: "rgba(255,68,68,0.6)",
    dim: "rgba(255,68,68,0.08)",
    border: "rgba(255,68,68,0.25)",
    trap: false,
  },
];
SETTER_STAGES.forEach((s) => {
  if (!SM[s.key]) SM[s.key] = s;
});

export const SS_STAGES = [
  "ssTaken",
  "offer",
  "verbal",
  "deposit",
  "closed",
  "reoffer",
  "handedoff",
];
export const OFFER_STAGES = [
  "offer",
  "verbal",
  "deposit",
  "closed",
  "reoffer",
  "handedoff",
];
export const CLOSE_STAGES = ["closed", "handedoff"];
export const REVENUE_STAGES = ["closed", "handedoff", "deposit"];
export const PROGRAMS = [
  "DDBA Academy",
  "DDBA Accelerator",
  "Tier 1",
  "Tier 2",
  "Tier 3",
  "Tier 4",
  "Custom",
];
export const PAYMENT_TYPES = [
  "Stripe",
  "Credit Card",
  "Bank Transfer",
  "Cash",
  "Zelle",
  "Other",
];

export const CLICKUP_LIST_ID = "901325254518";
export const PROD_N8N_WEBHOOK_URL =
  "https://thefrankdeluca.app.n8n.cloud/webhook/create-clickup-task-closer";
export const TEST_N8N_WEBHOOK_URL =
  "https://thefrankdeluca.app.n8n.cloud/webhook-test/create-clickup-task-closer";
