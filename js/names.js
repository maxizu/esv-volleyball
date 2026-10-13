// Vereinheitlicht Teamnamen nach dem Laden (z. B. damit Zeilen nicht umbrechen).
// Alles hinter dem Namen (z. B. das Heimspiel-Haus) bleibt erhalten.

const RULES = [
  {
    // SG ESV Ingolstadt / TSV Kösching, in jeder Schreibweise
    pattern: /(SG\s+)?ESV\s+Ingolstadt\s*[/-]\s*(TSV\s+)?K\u00f6sching/i,
    replacement: "ESV Ingolstadt",
  },
];

export function normalizeNames(root) {
  root.querySelectorAll("td").forEach((td) => {
    if (td.children.length > 0) return;
    for (const { pattern, replacement } of RULES) {
      if (pattern.test(td.textContent)) {
        td.textContent = td.textContent.replace(pattern, replacement);
      }
    }
  });
}
