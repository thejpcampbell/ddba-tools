// api/setter.js
// Vercel serverless function — handles shared setter data via Vercel KV
//
// SETUP (one-time):
//   1. vercel link          (in project root)
//   2. vercel env pull      (pulls KV env vars)
//   3. npm install @vercel/kv
//   4. In Vercel dashboard → Storage → Create KV database → link to project
//   That's it. KV_REST_API_URL and KV_REST_API_TOKEN are auto-set.

import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  // CORS — allow same origin + any vercel preview URLs
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    const { key } = req.query;
    if (!key) return res.status(400).json({ error: "key required" });

    try {
      const value = await kv.get(key);
      return res.status(200).json({ value });
    } catch (err) {
      console.error("KV GET error:", err);
      return res.status(500).json({ error: "KV read failed" });
    }
  }

  // ── POST ─────────────────────────────────────────────────────────────────
  if (req.method === "POST") {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: "key required" });

    try {
      if (value === null || value === undefined) {
        // null = delete (used for day reset)
        await kv.del(key);
      } else {
        // Pipeline data lives forever, EOD data expires after 7 days
        const isPipeline = key.includes(":pipeline");
        if (isPipeline) {
          await kv.set(key, value);
        } else {
          await kv.set(key, value, { ex: 60 * 60 * 24 * 7 }); // 7 days TTL
        }
      }
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("KV SET error:", err);
      return res.status(500).json({ error: "KV write failed" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
