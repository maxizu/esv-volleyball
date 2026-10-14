// Einstellungen der Seite.
// API-Zugang, Mannschaften und Heimspiel-Symbol stehen in config/shared.json
// (gemeinsam mit dem Cron-Skript). Neue Saison: dort die IDs austauschen.

import { SHARED } from "./shared.js";

export const API = { ...SHARED.api, timeoutMs: 30000 };
export const HOME_MARKER = SHARED.homeMarker;
export const TILES = SHARED.tiles;

// Vorab geholte Daten (vom Cron-Skript auf dem Webserver regelmaessig aktualisiert).
// Ist die Datei aelter als maxAgeDays oder nicht nutzbar, ruft die Seite die API selbst.
export const SNAPSHOT = {
  url: "data/bvv.json",
  maxAgeDays: 14,
  // Info im Footer. Muss zum Cronjob auf dem Webserver passen (siehe README).
  scheduleText: "Mo\u2013Do alle 30 Min, Fr\u2013So alle 5 Min",
};

// Zeitraum fuer "Naechste Spiele" (Tage ab heute).
export const UPCOMING_DAYS = 10;

// Seite pro Spiel auf volleyball.bayern. Die Spiel-ID kommt aus der API (data-vapi-spielid);
// der Pfad davor (Kategorie/Bezirk) ist fuer die Anzeige egal, die Seite findet das Spiel ueber die ID.
export const GAME_URL = "https://volleyball.bayern/ergebnisse/erwachsene/oberbayern/spiel-";
