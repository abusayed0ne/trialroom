const PROXY = process.env.REACT_APP_PROXY_URL || "http://localhost:3001";

export async function tryOnAPI(personFile, garmentFile, garmentLabel) {
  const human   = await toBase64(personFile);
  const garment = await toBase64(garmentFile);

  let res;
  try {
    res = await fetch(`${PROXY}/tryon`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ human, garment, description: garmentLabel }),
    });
  } catch {
    throw new Error(
      `Could not reach the proxy server at ${PROXY}. Make sure it is running — start the app with "npm run dev" (runs proxy + web together).`
    );
  }

  const data = await res.json();
  if (!res.ok || !data.image) {
    throw new Error(data.error || "Try-on failed. Please try again.");
  }

  return data.image;
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.readAsDataURL(file);
  });
}
