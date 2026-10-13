import { API } from "./config.js";

/** @param {object[]} subs Abfragen im Format der Schnittstelle */
/** @returns {Promise<string[]>} HTML pro Abfrage, in gleicher Reihenfolge */
export async function fetchBlocks(subs) {
  const payload = JSON.stringify({
    multimode: 1,
    key: API.key,
    version: API.version,
    subs,
  });

  const res = await fetch(API.url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(payload),
    signal: AbortSignal.timeout(API.timeoutMs),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);

  const data = await res.json();
  return data.subs.map((s) => s.content);
}
