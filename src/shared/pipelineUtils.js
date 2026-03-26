// shared/pipelineUtils.js
// Shared utilities used by both SetterLive and CloserLive

const CLOSER_PIPE_KEY = "closer:jp:pipeline";

async function apiGet(key) {
  try {
    const r = await fetch(`/api/setter?key=${encodeURIComponent(key)}`);
    if (!r.ok) throw new Error();
    return (await r.json()).value ?? null;
  } catch {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }
}

async function apiSet(key, value) {
  try {
    await fetch("/api/setter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
  } catch {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
}

const TODAY = new Date().toLocaleDateString("en-US", {
  month: "2-digit", day: "2-digit", year: "numeric",
});

/**
 * Called by SetterLive when a setter copies the Qualified Lead Format.
 * Writes the booked lead into JP's Closer pipeline as stage = "booked".
 * Deduplicates by handle + date — safe to call on double-copy.
 */
export async function feedCloserPipeline(lead) {
  const current = (await apiGet(CLOSER_PIPE_KEY)) || [];
  const exists = current.some(
    l => l.handle === lead.handle && l.date === lead.date
  );
  if (exists) return;
  const next = [
    ...current,
    {
      id:           Date.now(),
      date:         lead.date || TODAY,
      name:         lead.name || "",
      handle:       lead.handle || "",
      closer:       "JP Campbell",
      program:      "",
      cash:         "",
      paymentMethod:"",
      callTime:     "",
      objection:    "",
      oneCallClose: false,
      setterName:   lead.setterName || "",
      notes:        lead.notes || "",
      stage:        "booked",
    },
  ];
  await apiSet(CLOSER_PIPE_KEY, next);
}
