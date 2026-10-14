// Holt alle Daten von der BVV-Schnittstelle und schreibt data/bvv.json.
// Laeuft stuendlich in der GitHub Action (.github/workflows/update-data.yml), lokal: node scripts/fetch-data.mjs
//
// Die Schnittstelle prueft die Domain (Origin/Referer) gegen den API-Key. Ohne freigeschaltete Domain
// ersetzt sie Teamnamen durch "Fehlende Rechte"; das wird hier erkannt und nichts ueberschrieben.
//
// In der Action: eigener Key (Secret BVV_API_KEY), im BVV-Portal fuer die Domain github.com hinterlegt.
// Lokal ohne Secret: der Key der Seite, mit der Domain esv-volleyball.de.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { TILES } from "../js/config.js";
import { allQueries, queryKey } from "../js/queries.js";
import { fetchBlocks } from "../js/api.js";

const FILE = new URL("../data/bvv.json", import.meta.url);
const ACTION_KEY = process.env.BVV_API_KEY || "";
const ORIGIN = ACTION_KEY ? "https://github.com" : "https://esv-volleyball.de";
// Auch ohne inhaltliche Aenderung hoechstens so lange alt lassen, damit die Seite
// "frisch" erkennt (Grenze auf der Seite: 14 Tage) und es nicht stuendlich Commits gibt.
const REFRESH_AFTER_MS = 20 * 60 * 60 * 1000;

const queries = allQueries(TILES);
const contents = await fetchBlocks(queries, {
  key: ACTION_KEY || undefined,
  headers: { Origin: ORIGIN, Referer: ORIGIN + "/" },
});

if (contents.length !== queries.length) throw new Error("Antwort hat falsche Anzahl Bloecke");
contents.forEach((c, i) => {
  if (typeof c !== "string" || c.trim() === "") throw new Error("Leere Antwort fuer Block " + i);
  if (c.includes("Fehlende Rechte")) throw new Error("'Fehlende Rechte': ist die Domain " + new URL(ORIGIN).host + " fuer diesen Key im BVV-Portal hinterlegt?");
});

const blocks = Object.fromEntries(queries.map((q, i) => [queryKey(q), contents[i]]));

let old = null;
try {
  old = JSON.parse(await readFile(FILE, "utf8"));
} catch {}

const unchanged = old && JSON.stringify(old.blocks) === JSON.stringify(blocks);
const fresh = old && Date.now() - new Date(old.fetchedAt) < REFRESH_AFTER_MS;
if (unchanged && fresh) {
  console.log("Keine Aenderung, Datei bleibt unveraendert.");
  process.exit(0);
}

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
// Ein Block pro Zeile: uebersichtliche Git-Diffs
await writeFile(FILE, JSON.stringify({ fetchedAt: new Date().toISOString(), blocks }, null, 1) + "\n");
console.log(`${queries.length} Bloecke geschrieben (${unchanged ? "nur Zeitstempel" : "Daten geaendert"}).`);
