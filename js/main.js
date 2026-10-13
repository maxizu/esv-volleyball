import { TILES } from "./config.js";
import { renderTiles } from "./render.js";
import { fetchBlocks } from "./api.js";
import { normalizeNames } from "./names.js";

const { blocks } = renderTiles(document.getElementById("tiles"), TILES);

function showFailure() {
  for (const { node } of blocks) {
    if (node.classList.contains("vapiclass")) continue;
    node.classList.add("vapi-failed");
    node.textContent = "Daten konnten nicht geladen werden.";
  }
}

try {
  const contents = await fetchBlocks(blocks.map((b) => b.query));
  blocks.forEach(({ node }, i) => {
    if (contents[i] == null) return;
    node.innerHTML = contents[i];
    node.classList.add("vapiclass"); // Klasse, auf die vapi.css und data.css zielen
    normalizeNames(node);
  });
} catch (err) {
  console.error("Abruf der BVV-Daten fehlgeschlagen:", err);
  showFailure();
}
