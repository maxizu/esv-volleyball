import { TILES, SNAPSHOT } from "./config.js";
import { renderTiles } from "./render.js";
import { loadContents } from "./data.js";
import { normalizeNames, trimResults } from "./names.js";
import { linkGames } from "./links.js";
import { collectUpcoming, renderUpcoming, renderUpcomingFailure } from "./upcoming.js";

const { blocks } = renderTiles(document.getElementById("tiles"), TILES);
const upcomingEl = document.getElementById("upcoming-list");

function showStamp({ source, fetchedAt, reason }) {
  const el = document.getElementById("data-stamp");
  if (!el) return;
  const fmt = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" });
  if (source === "snapshot") {
    el.textContent = `Daten zuletzt aktualisiert: ${fmt.format(fetchedAt)} Uhr`;
    const hint = document.createElement("span");
    hint.className = "data-hint";
    hint.textContent = `Aktualisierung: ${SNAPSHOT.scheduleText}`;
    el.append(hint);
  } else {
    const why =
      reason === "stale"
        ? `gespeicherte Daten \u00e4lter als ${SNAPSHOT.maxAgeDays} Tage`
        : "gespeicherte Daten nicht verf\u00fcgbar";
    el.textContent = `Daten live abgerufen: ${fmt.format(fetchedAt)} Uhr (${why})`;
  }
}

function showFailure() {
  for (const { node } of blocks) {
    if (node.classList.contains("vapiclass")) continue;
    node.classList.add("vapi-failed");
    node.textContent = "Daten konnten nicht geladen werden.";
  }
  renderUpcomingFailure(upcomingEl);
}

try {
  const result = await loadContents(blocks.map((b) => b.query));
  const { contents } = result;
  blocks.forEach(({ node }, i) => {
    if (contents[i] == null) return;
    node.innerHTML = contents[i];
    node.classList.add("vapiclass"); // Klasse, auf die vapi.css und data.css zielen
    normalizeNames(node);
    trimResults(node);
    linkGames(node);
  });
  renderUpcoming(upcomingEl, collectUpcoming(blocks));
  showStamp(result);
} catch (err) {
  console.error("Abruf der BVV-Daten fehlgeschlagen:", err);
  showFailure();
}
