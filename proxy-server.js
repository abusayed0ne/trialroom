const http = require("http");
const fs = require("fs");
const path = require("path");

// Load .env without dotenv
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)/);
      if (match) process.env[match[1].trim()] = match[2].trim();
    });
}

// The free Hugging Face Space that runs IDM-VTON.
const SPACE = process.env.HF_SPACE || "yisol/IDM-VTON";
// Optional — only needed to lift anonymous rate limits on the free Space.
const HF_TOKEN = process.env.HF_TOKEN || undefined;
const PORT = 3001;

const CORS = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// `@gradio/client` is ESM-only, so connect lazily via dynamic import and
// reuse the same connection across requests.
let clientPromise;
async function getClient() {
  if (!clientPromise) {
    const { Client } = await import("@gradio/client");
    clientPromise = Client.connect(SPACE, { hf_token: HF_TOKEN });
  }
  return clientPromise;
}

// "data:image/png;base64,AAAA" -> Blob the Gradio client can upload.
function dataUrlToBlob(dataUrl) {
  const match = /^data:(.+?);base64,(.*)$/.exec(dataUrl || "");
  if (!match) throw new Error("Expected a base64 data URL for the image.");
  return new Blob([Buffer.from(match[2], "base64")], { type: match[1] });
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  if (req.method !== "POST" || req.url !== "/tryon") {
    res.writeHead(404, { "Content-Type": "application/json", ...CORS });
    res.end(JSON.stringify({ error: "Not found. POST /tryon" }));
    return;
  }

  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      const { human, garment, description } = JSON.parse(body);
      const humanBlob = dataUrlToBlob(human);
      const garmentBlob = dataUrlToBlob(garment);

      const client = await getClient();
      const result = await client.predict("/tryon", [
        { background: humanBlob, layers: [], composite: null }, // human image
        garmentBlob,                  // garment image
        description || "clothing",    // garment description
        true,                         // auto-mask (skip manual masking)
        true,                         // auto-crop
        30,                           // denoise steps (20-40)
        42,                           // seed
      ]);

      // Returns [result_image, masked_image]; take the result.
      const out = result?.data?.[0];
      const url = typeof out === "string" ? out : out?.url;
      if (!url) throw new Error("Space returned no image.");

      res.writeHead(200, { "Content-Type": "application/json", ...CORS });
      res.end(JSON.stringify({ image: url }));
    } catch (err) {
      console.error("Try-on error:", err.message);
      res.writeHead(502, { "Content-Type": "application/json", ...CORS });
      res.end(JSON.stringify({ error: err.message || "Try-on failed." }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Proxy running at http://localhost:${PORT}`);
  console.log(`Space: ${SPACE}  |  HF token: ${HF_TOKEN ? "loaded" : "none (anonymous)"}`);
});
