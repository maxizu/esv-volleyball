// Abfragen an die BVV-Schnittstelle. cron/update-data.php baut dieselben Abfragen
// (gleiche Reihenfolge der Felder spielt keine Rolle, entscheidend ist der Schluessel unten).

import { HOME_MARKER } from "./config.js";

/** Abfragen fuer einen Wettbewerb: Spielplan und (falls vorhanden) Tabelle. */
export function buildQueries(c) {
  const base = { w: c.wettbewerb, teams: [c.team] };
  const queries = [{ ...base, type: "spiele", teamfilter: [c.team], heimspielkennzeichen: HOME_MARKER }];
  if (c.tabelle) queries.push({ ...base, type: "tabelle" });
  return queries;
}

/**
 * Schluessel, unter dem eine Antwort in data/bvv.json liegt.
 * Format: "<typ>|<wettbewerb>|<team>". Muss mit cron/update-data.php uebereinstimmen.
 */
export const queryKey = (q) => `${q.type}|${q.w}|${q.teams.join(",")}`;
