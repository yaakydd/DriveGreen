// ensure spinner shows at least minMs (returns response JSON)
export default async function fetchWithMinDelay(url, options = {}, minMs = 700) {
  const start = Date.now();
  const res = await fetch(url, options);
  const json = await res.json();
  const elapsed = Date.now() - start;
  if (elapsed < minMs) {
    await new Promise((r) => setTimeout(r, minMs - elapsed));
  }
  if (!res.ok) {
    const err = json?.detail || json?.error || json || "Request failed";
    throw new Error(err);
  }
  return json;
}
