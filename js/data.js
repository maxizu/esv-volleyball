// Liefert die Datenbloecke: bevorzugt aus der vorab geholten Datei (data/bvv.json),
// nur wenn die fehlt, zu alt oder unvollstaendig ist, direkt von der BVV-Schnittstelle.

import { SNAPSHOT } from "./config.js";
import { fetchBlocks } from "./api.js";
import { queryKey } from "./queries.js";

const DAY = 24 * 60 * 60 * 1000;

async function fromSnapshot(queries) {
  const res = await fetch(SNAPSHOT.url, { cache: "no-cache" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const snap = await res.json();

  const fetchedAt = new Date(snap.fetchedAt);
  if (!(Date.now() - fetchedAt <= SNAPSHOT.maxAgeDays * DAY)) {
    throw new Error(`Daten aelter als ${SNAPSHOT.maxAgeDays} Tage`);
  }
  const contents = queries.map((q) => snap.blocks?.[queryKey(q)]);
  if (contents.some((c) => c == null)) throw new Error("Datei unvollstaendig (Konfiguration geaendert?)");
  return { contents, source: "snapshot", fetchedAt };
}

/** @returns {Promise<{contents: string[], source: "snapshot"|"api", fetchedAt: Date}>} */
export async function loadContents(queries) {
  try {
    return await fromSnapshot(queries);
  } catch (err) {
    console.info("Vorab geholte Daten nicht nutzbar, rufe die API:", err.message);
  }
  return { contents: await fetchBlocks(queries), source: "api", fetchedAt: new Date() };
}
