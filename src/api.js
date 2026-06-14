export async function tryOnAPI(personFile, garmentFile, garmentLabel) {
  const human   = await toBase64(personFile);
  const garment = await toBase64(garmentFile);

  let res;
  try {
    res = await fetch("/api/tryon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ human, garment, description: garmentLabel }),
    });
  } catch {
    throw new Error(
      "Could not reach the try-on server. Make sure the app is running with \"npm run dev\"."
    );
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned ${res.status} with no JSON body. Please try again.`);
  }
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
