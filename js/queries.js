// Abfragen an die BVV-Schnittstelle. Reines JS ohne Browser-Zugriff,
// wird von der Seite UND vom GitHub-Action-Skript benutzt (gleiche Abfragen = gleiche Schluessel).

import { HOME_MARKER } from "./config.js";

/** Abfragen fuer einen Wettbewerb: Spielplan und (falls vorhanden) Tabelle. */
export function buildQueries(c) {
  const base = { w: c.wettbewerb, teams: [c.team] };
  const queries = [{ ...base, type: "spiele", teamfilter: [c.team], heimspielkennzeichen: HOME_MARKER }];
  if (c.tabelle) queries.push({ ...base, type: "tabelle" });
  return queries;
}

/** Alle Abfragen aller Kacheln. */
export function allQueries(tiles) {
  return tiles.flatMap((t) => t.competitions.flatMap(buildQueries));
}

/** Schluessel, unter dem eine Antwort in data/bvv.json liegt. */
export const queryKey = (q) => JSON.stringify(q);
