// Laedt die gemeinsame Konfiguration (API-Zugang, Mannschaften, Heimspiel-Symbol).
// Dieselbe Datei liest das Cron-Skript cron/update-data.php, damit beide dieselben Abfragen verwenden.

const res = await fetch(new URL("../config/shared.json", import.meta.url));
if (!res.ok) throw new Error("config/shared.json nicht ladbar: HTTP " + res.status);

export const SHARED = await res.json();
