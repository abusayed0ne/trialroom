let clientPromise;
async function getClient() {
  if (!clientPromise) {
    const { Client } = await import("@gradio/client");
    const SPACE = process.env.HF_SPACE || "yisol/IDM-VTON";
    const HF_TOKEN = process.env.HF_TOKEN || undefined;
    clientPromise = Client.connect(SPACE, { hf_token: HF_TOKEN });
  }
  return clientPromise;
}

function dataUrlToBlob(dataUrl) {
  const match = /^data:(.+?);base64,(.*)$/.exec(dataUrl || "");
  if (!match) throw new Error("Expected a base64 data URL for the image.");
  return new Blob([Buffer.from(match[2], "base64")], { type: match[1] });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { human, garment, description } = req.body;
    const humanBlob = dataUrlToBlob(human);
    const garmentBlob = dataUrlToBlob(garment);

    const client = await getClient();
    const result = await client.predict("/tryon", [
      { background: humanBlob, layers: [], composite: null },
      garmentBlob,
      description || "clothing",
      true,
      true,
      30,
      42,
    ]);

    const out = result?.data?.[0];
    const url = typeof out === "string" ? out : out?.url;
    if (!url) throw new Error("Space returned no image.");

    // Fetch image server-side and return as base64 data URL so the browser
    // never has to hit the HF space directly (avoids auth/CORS/expiry issues).
    const HF_TOKEN = process.env.HF_TOKEN || undefined;
    const imgRes = await fetch(url, HF_TOKEN ? { headers: { Authorization: `Bearer ${HF_TOKEN}` } } : {});
    if (!imgRes.ok) throw new Error(`Failed to fetch result image: ${imgRes.status}`);
    const imgBuffer = await imgRes.arrayBuffer();
    const contentType = imgRes.headers.get("content-type") || "image/webp";
    const base64 = Buffer.from(imgBuffer).toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;

    res.status(200).json({ image: dataUrl });
  } catch (err) {
    console.error("Try-on error:", err.message);
    res.status(502).json({ error: err.message || "Try-on failed." });
  }
};
