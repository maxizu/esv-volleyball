// "Naechste Spiele": liest die bereits geladenen Spielplaene aus (kein zusaetzlicher Request)
// und listet alle Spiele der naechsten Tage.

import { UPCOMING_DAYS, HOME_MARKER } from "./config.js";

const DAY = 24 * 60 * 60 * 1000;

/** "17.10." -> Date. Das Jahr fehlt in den Daten: es wird das Jahr gewaehlt, das am naechsten an heute liegt. */
function parseDate(text, time, today) {
  const m = /^(\d{1,2})\.(\d{1,2})\./.exec(text.trim());
  if (!m) return null;
  const t = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  const [h, min] = t ? [Number(t[1]), Number(t[2])] : [0, 0];
  let date = new Date(today.getFullYear(), Number(m[2]) - 1, Number(m[1]), h, min);
  date.hasTime = Boolean(t);
  if (date - today > 183 * DAY) date.setFullYear(date.getFullYear() - 1);
  else if (today - date > 183 * DAY) date.setFullYear(date.getFullYear() + 1);
  return date;
}

function cleanName(td) {
  return td.textContent.replace(HOME_MARKER.trim(), "").trim();
}

/** Sammelt Spiele aus allen Spielplan-Bloecken. */
export function collectUpcoming(blocks, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const until = new Date(today.getTime() + (UPCOMING_DAYS + 1) * DAY); // einschliesslich letztem Tag
  const seen = new Set();
  const games = [];

  for (const { node, query, tile, competition } of blocks) {
    if (query.type !== "spiele") continue;
    node.querySelectorAll("tr.spiel").forEach((row) => {
      const cell = (cls) => row.querySelector("td." + cls);
      const date = parseDate(cell("datum")?.textContent ?? "", cell("zeit")?.textContent ?? "", today);
      if (!date || date < today || date >= until) return;

      const id = tile.title + "|" + row.getAttribute("data-vapi-spielid");
      if (seen.has(id)) return;
      seen.add(id);

      const a = cell("teama");
      const b = cell("teamb");
      games.push({
        date,
        tile,
        competition: competition.name,
        teamA: cleanName(a),
        teamB: cleanName(b),
        ownA: a.classList.contains("teammarker"),
        ownB: b.classList.contains("teammarker"),
        // Die API markiert immer den Gastgeber (Team A); wir zeigen das Haus nur bei eigenen Heimspielen.
        home: a.classList.contains("heimspiel") && a.classList.contains("teammarker"),
      });
    });
  }
  return games.sort((x, y) => x.date - y.date);
}

const dateFmt = { format: (d) => new Intl.DateTimeFormat("de-DE", { weekday: "short" }).format(d).replace(".", "") + " " + new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit" }).format(d) };
const timeFmt = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" });

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text) n.textContent = text;
  return n;
}

function teamSpan(name, own) {
  return el("span", own ? "own" : "", name);
}

export function renderUpcoming(container, games) {
  container.classList.remove("loading");
  container.replaceChildren();

  if (games.length === 0) {
    container.append(el("p", "upcoming-empty", `Keine Spiele in den n\u00e4chsten ${UPCOMING_DAYS} Tagen.`));
    return;
  }

  for (const g of games) {
    const item = el("li", "match " + g.tile.group);
    item.title = g.competition;

    const when = el("span", "when");
    when.append(el("strong", null, dateFmt.format(g.date)), " " + (g.date.hasTime ? timeFmt.format(g.date) : "--:--"));

    const teams = el("span", "teams");
    teams.append(teamSpan(g.teamA, g.ownA));
    if (g.home) teams.append(el("span", "home", " \u{1F3E0}"));
    teams.append(el("span", "vs", " \u2013 "), teamSpan(g.teamB, g.ownB));

    item.append(when, el("span", "label", g.tile.title), teams);
    container.append(item);
  }
}

export function renderUpcomingFailure(container) {
  container.classList.remove("loading");
  container.replaceChildren(el("p", "upcoming-empty", "Spiele konnten nicht geladen werden."));
}
