# ESV Ingolstadt Volleyball

Statische Vereinsseite für https://esv-volleyball.de mit Spielplänen und Tabellen aller Mannschaften.

## Aufbau

```
index.html            Nur Markup (Navigation, Container, Footer)
css/                  base · tiles · data · upcoming · footer
js/
  shared.js           Lädt config/shared.json
  config.js           Einstellungen der Seite (Zeitraum, Fallback-Grenze, Footer-Text)
  main.js             Ablauf: Kacheln bauen, Daten holen, einsetzen
  render.js           Baut die Kacheln aus der Konfiguration
  queries.js          Die Abfragen und der Schlüssel pro Block
  data.js             Datenquelle: erst data/bvv.json, nur bei Bedarf die API
  api.js              Ein gebündelter Request an die BVV-Schnittstelle (Fallback)
  names.js, links.js, upcoming.js   Namen, klickbare Zeilen, "Nächste Spiele"
config/shared.json    API-Zugang und ALLE Mannschaften (hier pflegen)
cron/update-data.php  Holt die Daten und schreibt data/bvv.json (Cronjob)
data/bvv.sample.json  Beispieldaten (Testdaten), im Repo
data/bvv.json         Echte Daten, vom Cronjob erzeugt, NICHT im Repo
files/public/         Logo, Favicon, Instagram-Icon, Link-Vorschaubild
```

Kein Build-Schritt. Die JS-Dateien sind ES-Module, die Seite muss daher über
HTTP laufen (nicht per Doppelklick als `file://`).

## Lokal ansehen

```sh
cp data/bvv.sample.json data/bvv.json   # Testdaten (alternativ: php cron/update-data.php)
python3 -m http.server 8000
```

Dann http://localhost:8000 öffnen. Ohne `data/bvv.json` holt die Seite die Daten live von der API
(dann sind Teamnamen in Tabellen auf `localhost` "Fehlende Rechte", siehe unten).

## Wie die Daten auf die Seite kommen

Spielpläne und Tabellen kommen von der Schnittstelle des Bayerischen Volleyball-Verbands
([Doku](https://volleyball.bayern/service/vereinshilfen/tools-fuer-deine-vereinshomepage)).

1. **Cronjob auf dem Webserver** führt `cron/update-data.php` aus. Es holt alle Daten in einem Request
   und schreibt `data/bvv.json` (atomar; bei einem Fehler bleibt die alte Datei liegen).
2. **Die Seite** lädt `data/bvv.json` und ruft die BVV-Schnittstelle nicht selbst auf.
3. **Fallback:** Ist die Datei fehlend, unvollständig oder älter als 14 Tage (`SNAPSHOT.maxAgeDays`
   in `js/config.js`), ruft die Seite die API selbst. Im Footer steht dann "Daten live abgerufen",
   sonst "Daten zuletzt aktualisiert".

Es wird nichts im Browser gespeichert (kein Cache, keine Cookies).

### Cronjob einrichten (Plesk)

Geplante Aufgaben, Typ **PHP-Skript ausführen**, PHP-Version 8.3, Skriptpfad z. B. `httpdocs/cron/update-data.php`
(relativ zum Ordner, in dem das Repo liegt; das Skript findet `config/` und `data/` selbst).
Benachrichtigung: "Nur Fehler". Zwei Aufgaben (Zeitzone = Systemzeit des Servers):

| Wann | Cron-Stil |
|---|---|
| Mo–Do alle 30 Minuten | `*/30 * * * 1-4` |
| Fr–So alle 5 Minuten | `*/5 * * * 5,6,0` |

Der Text im Footer ("Aktualisierung: ...") steht in `js/config.js` (`SNAPSHOT.scheduleText`) und muss zu
diesen Zeiten passen.

Nach dem ersten Ausrollen die Aufgabe einmal manuell starten ("Jetzt ausführen"), sonst fehlt `data/bvv.json`,
bis der Cronjob das erste Mal läuft (die Seite holt die Daten in der Zwischenzeit live).
`data/bvv.json` steht in `.gitignore`. Das Ausrollen darf diese Datei nicht löschen (kein `git clean -x`).

Das Skript läuft nur per CLI (Aufruf über den Browser gibt 403), und zwei Läufe überschneiden sich nicht.

### Mannschaften pflegen

Alles steht in `config/shared.json` (Seite und Cronjob lesen dieselbe Datei):

```json
{
  "title": "Herren 1",
  "group": "herren",
  "competitions": [
    { "name": "Bezirksklasse 1 Männer", "wettbewerb": "WETTBEWERB-ID", "team": "TEAM-ID", "tabelle": true },
    { "name": "Kreispokal OBB-Nord Männer", "wettbewerb": "...", "team": "...", "tabelle": false }
  ]
}
```

- `group`: herren, damen, mixed oder jugend (Farbe der Kachel).
- Pro Wettbewerb entstehen Spielplan und (bei `tabelle: true`) Tabelle. Pokale haben keine Tabelle.
- Die Reihenfolge ist die Reihenfolge auf der Seite (zwei Kacheln pro Zeile).
- Wettbewerbs- und Team-IDs stehen im BVV-Portal unter Vereinsverwaltung, Vereinshomepage, Hallenergebnisse.
- Neue Saison: IDs austauschen, danach den Cronjob einmal manuell ausführen.
- Teamnamen werden in `js/names.js` vereinheitlicht (Damen 1: "ESV Ingolstadt").

## API-Key und Domain

Der API-Key steht in `config/shared.json` und ist damit öffentlich sichtbar. Das ist so vorgesehen.
Geschützt wird über die Domain: Der Abteilungsleiter muss jede Domain im BVV-Portal hinterlegen
(Vereinsverwaltung, Vereinshomepage, API-Key), mindestens:

- `esv-volleyball.de`
- `www.esv-volleyball.de`
- jede Test- oder Preview-Domain

Auf nicht freigeschalteten Domains (auch `localhost`) zeigen die Tabellen statt der Teamnamen "Fehlende Rechte".
Das Cron-Skript meldet sich gegenüber der Schnittstelle als `https://esv-volleyball.de` (Konstante `ORIGIN`
im Skript), weil es vom Server aus abruft.

## Hinweise

- Die Antwortzeit der Schnittstelle liegt bei ca. 5 Sekunden. Aus `data/bvv.json` lädt die Seite sofort, nur der API-Fallback braucht so lange (bis dahin Skeleton).
