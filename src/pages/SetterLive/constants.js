import { C } from "../../shared/colors.js";

export const REPS = ["Liz", "Chantal"];

export const STAGES = [
  { key: "looksAvatar", label: "Looks Avatar", color: C.t3 },
  { key: "meaningfulConvo", label: "Meaningful Convo", color: C.blue },
  { key: "callBooked", label: "Call Booked", color: C.green },
  { key: "followUp", label: "Follow Up", color: C.orange },
  { key: "goodDemo", label: "Good Demo", color: C.purple },
  { key: "closed", label: "Closed", color: C.green },
];
export const SM = {};
STAGES.forEach((s) => (SM[s.key] = s));

export const CLICKUP_LIST_ID = "901325255135";
export const TEST_N8N_WEBHOOK_URL =
  "https://thefrankdeluca.app.n8n.cloud/webhook-test/create-clickup-task";
export const PROD_N8N_WEBHOOK_URL =
  "https://thefrankdeluca.app.n8n.cloud/webhook/create-clickup-task";

export const PIPELINE_CLICKUP_LIST_ID = "901322900025";
export const PIPELINE_TEST_N8N_WEBHOOK_URL =
  "https://thefrankdeluca.app.n8n.cloud/webhook-test/create-pipeline-lead";
export const PIPELINE_CREATE_WEBHOOK =
  "https://thefrankdeluca.app.n8n.cloud/webhook/create-pipeline-lead";
export const PIPELINE_TEST_UPDATE_WEBHOOK =
  "https://thefrankdeluca.app.n8n.cloud/webhook-test/update-pipeline-lead";
export const PIPELINE_UPDATE_WEBHOOK =
  "https://thefrankdeluca.app.n8n.cloud/webhook/update-pipeline-lead";
