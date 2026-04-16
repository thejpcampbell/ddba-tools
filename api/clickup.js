// api/clickup.js
// Vercel serverless function — proxies ClickUp API task creation server-side
// Requires CLICKUP_API_KEY set in Vercel environment variables

//This is not used, We are currently using n8n to create the task in ClickUp. This is here for reference if we want to switch back to using our own API route instead of n8n.

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.CLICKUP_API_KEY;
  if (!apiKey)
    return res.status(500).json({ error: "CLICKUP_API_KEY not configured" });

  const { listId, name, description } = req.body;
  if (!listId || !name)
    return res.status(400).json({ error: "listId and name are required" });

  try {
    const response = await fetch(
      `https://api.clickup.com/api/v2/list/${listId}/task`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
        body: JSON.stringify({ name, description: description || "" }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("ClickUp API error:", data);
      return res
        .status(response.status)
        .json({ error: data.err || "ClickUp API error" });
    }

    return res.status(200).json({ id: data.id, url: data.url });
  } catch (err) {
    console.error("ClickUp proxy error:", err);
    return res.status(500).json({ error: "Proxy request failed" });
  }
}
