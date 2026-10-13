// Baut die Kacheln aus der Konfiguration und liefert die Datenbloecke zurueck.

import { HOME_MARKER } from "./config.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/** Ein Datenblock (Skeleton, bis die Daten da sind) mit seiner Abfrage. */
function block(query, tile, competition) {
  const node = el("div", "vapi");
  return { node, query, tile, competition };
}

/**
 * @returns {{blocks: {node: HTMLElement, query: object, tile: object, competition: object}[]}}
 */
export function renderTiles(container, tiles) {
  const blocks = [];

  for (const tile of tiles) {
    const section = el("section", "tile " + tile.group);
    const h2 = el("h2", null, tile.title);
    if (tile.subtitle) h2.append(el("small", null, tile.subtitle));
    section.append(h2);

    for (const c of tile.competitions) {
      section.append(el("h3", null, c.name));

      const base = { w: c.wettbewerb, teams: [c.team] };
      const queries = [
        { ...base, type: "spiele", teamfilter: [c.team], heimspielkennzeichen: HOME_MARKER },
      ];
      if (c.tabelle) queries.push({ ...base, type: "tabelle" });

      for (const q of queries) {
        const b = block(q, tile, c);
        blocks.push(b);
        section.append(b.node);
      }
    }
    container.append(section);
  }
  return { blocks };
}
