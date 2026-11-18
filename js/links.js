// Macht Zeilen der Spielplaene in den Kacheln klickbar (Link zur Spielseite).
// Die API liefert nur die Spiel-ID (data-vapi-spielid), keinen Link. Die Spielseite
// braucht zusaetzlich die numerische Wettbewerbs-ID, die steht im "Quelle: BVV"-Link.

import { GAME_URL } from "./config.js";

/** Numerische Wettbewerbs-ID aus dem Quelle-Link eines Datenblocks (oder null). */
export function competitionId(root) {
  for (const a of root.querySelectorAll("a[href*='wettbewerbid']")) {
    const m = /wettbewerbid(?:%5D|\])=(\d+)/i.exec(a.getAttribute("href"));
    if (m) return m[1];
  }
  return null;
}

/** Link zur Spielseite oder null, wenn eine ID fehlt. */
export function gameUrl(wettbewerbId, spielId) {
  if (!wettbewerbId || !spielId) return null;
  return `${GAME_URL}wettbewerb-${wettbewerbId}/spiel-${spielId}`;
}

export function linkGames(root) {
  const wid = competitionId(root);
  root.querySelectorAll("tr.spiel[data-vapi-spielid]").forEach((row) => {
    const url = gameUrl(wid, row.getAttribute("data-vapi-spielid"));
    if (!url) return;
    const open = () => window.open(url, "_blank", "noopener");
    row.classList.add("linked");
    row.tabIndex = 0;
    row.setAttribute("role", "link");

    row.addEventListener("click", () => {
      // Markieren von Text soll nicht als Klick zaehlen
      if (String(window.getSelection()).length > 0) return;
      open();
    });
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter") open();
    });
  });
}
