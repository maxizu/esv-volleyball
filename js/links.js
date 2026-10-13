// Macht Zeilen der Spielplaene in den Kacheln klickbar (Link zur Spielseite).
// Die API liefert nur die Spiel-ID (data-vapi-spielid), keinen Link.

import { GAME_URL } from "./config.js";

function open(id) {
  window.open(GAME_URL + id, "_blank", "noopener");
}

export function linkGames(root) {
  root.querySelectorAll("tr.spiel[data-vapi-spielid]").forEach((row) => {
    const id = row.getAttribute("data-vapi-spielid");
    row.classList.add("linked");
    row.tabIndex = 0;
    row.setAttribute("role", "link");

    row.addEventListener("click", () => {
      // Markieren von Text soll nicht als Klick zaehlen
      if (String(window.getSelection()).length > 0) return;
      open(id);
    });
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter") open(id);
    });
  });
}
