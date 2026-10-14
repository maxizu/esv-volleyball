import { API } from "./config.js";

/** @param {object[]} subs Abfragen im Format der Schnittstelle */
/** @param {{headers?: object, key?: string}} [options] Nur im Node-Skript: Zusatz-Header (Browser setzen Origin/Referer selbst) und anderer API-Key */
/** @returns {Promise<string[]>} HTML pro Abfrage, in gleicher Reihenfolge */
export async function fetchBlocks(subs, { headers = {}, key = API.key } = {}) {
  const payload = JSON.stringify({
    multimode: 1,
    key,
    version: API.version,
    subs,
  });

  const res = await fetch(API.url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers },
    body: "data=" + encodeURIComponent(payload),
    signal: AbortSignal.timeout(API.timeoutMs),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);

  const data = await res.json();
  return data.subs.map((s) => s.content);
}
