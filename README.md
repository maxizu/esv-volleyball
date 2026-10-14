# ESV Ingolstadt Volleyball

Statische Vereinsseite für https://esv-volleyball.de mit Spielplänen und Tabellen aller Mannschaften.

## Aufbau

```
index.html          Nur Markup (Navigation, Container, Footer)
css/
  base.css          Reset, Layout, Navigation, Logos
  tiles.css         Kacheln (Raster, Farben je Gruppe)
  data.css          Darstellung der BVV-Daten, Skeleton-Loading
  footer.css        Footer
js/
  config.js         API-Zugang und ALLE Mannschaften (hier pflegen)
  main.js           Ablauf: Kacheln bauen, Daten holen, einsetzen
  render.js         Baut die Kacheln aus der Konfiguration
  api.js            Ein gebündelter Request an die BVV-Schnittstelle
  data.js           Datenquelle: erst data/bvv.json, nur bei Bedarf die API
  queries.js        Die Abfragen (von Seite und Skript gemeinsam genutzt)
  names.js          Teamnamen vereinheitlichen, Ergebnisse ohne Satzklammer
files/public/       Logo, Favicon, Instagram-Icon
data/bvv.json       Vorab geholte BVV-Daten (wird von der Action überschrieben)
scripts/fetch-data.mjs          Holt die Daten und schreibt data/bvv.json
.github/workflows/update-data.yml   Stündlicher Lauf
```

Kein Build-Schritt, kein Backend. Die JS-Dateien sind ES-Module, die Seite muss daher über
HTTP laufen (nicht per Doppelklick als `file://`).

## Lokal ansehen

```sh
python3 -m http.server 8000
```

Dann http://localhost:8000 öffnen.

## Daten (BVV-Ergebnisschnittstelle)

Spielpläne und Tabellen kommen von der Schnittstelle des Bayerischen Volleyball-Verbands
([Doku](https://volleyball.bayern/service/vereinshilfen/tools-fuer-deine-vereinshomepage)).
`js/api.js` holt alle Blöcke in einem Request. Es wird nichts im Browser gespeichert
(kein Cache, keine Cookies).

Mannschaften stehen in `js/config.js`:

```js
{
  title: "Herren 1",
  group: "herren",            // herren | damen | mixed | jugend (Farbe)
  competitions: [
    { name: "Bezirksklasse 1 Männer", wettbewerb: "WETTBEWERB-ID", team: "TEAM-ID", tabelle: true },
    { name: "Kreispokal OBB-Nord Männer", wettbewerb: "...", team: "...", tabelle: false },
  ],
},
```

- Pro Wettbewerb entstehen Spielplan und (bei `tabelle: true`) Tabelle. Pokale haben keine Tabelle.
- Die Reihenfolge in `TILES` ist die Reihenfolge auf der Seite (zwei Kacheln pro Zeile).
- Wettbewerbs- und Team-IDs stehen im BVV-Portal unter Vereinsverwaltung, Vereinshomepage, Hallenergebnisse.
- Neue Saison: IDs in `js/config.js` austauschen.

Teamnamen werden in `js/names.js` vereinheitlicht (Damen 1: "ESV Ingolstadt").

## Wie die Daten auf die Seite kommen

1. **Stündlich** läuft die GitHub Action `Daten aktualisieren`. Sie holt alle Daten in einem Request,
   schreibt `data/bvv.json` und pusht nur, wenn sich etwas geändert hat (sonst höchstens einmal am Tag
   den Zeitstempel). Der Push löst den Webhook zum Webserver aus, der den neuen Stand ausrollt.
2. **Die Seite** lädt `data/bvv.json` und ruft die BVV-Schnittstelle nicht selbst auf.
3. **Fallback:** Ist die Datei fehlend, unvollständig oder älter als 14 Tage (`SNAPSHOT.maxAgeDays`
   in `js/config.js`), ruft die Seite die API selbst. Im Footer steht dann "Live-Daten",
   sonst "Stand: <Datum>".

Die Action nutzt einen **eigenen API-Key**, getrennt vom Key der Seite:

- Im BVV-Portal einen zweiten Key anlegen und dort die Domain `github.com` hinterlegen.
- In GitHub als Secret `BVV_API_KEY` speichern (Settings, Secrets and variables, Actions).
- Ist das Secret nicht gesetzt, nimmt das Skript den Key der Seite und meldet sich als `esv-volleyball.de`.

Die Action schlägt fehl (und GitHub meldet das), wenn die API "Fehlende Rechte"
liefert. Dann bleibt die alte Datei liegen.

Lokal ausführen: `node scripts/fetch-data.mjs` (Node 20+). Manuell in GitHub starten: Actions, Daten aktualisieren, Run workflow.

**Nach Änderungen an `js/config.js`** (andere Mannschaften, neue Saison, anderes Heimspiel-Symbol) passt die Datei
nicht mehr zu den Abfragen. Die Seite fällt dann auf die API zurück, bis die Action neu gelaufen ist.
Deshalb nach solchen Änderungen die Action einmal manuell starten.

## API-Key und Domain

Der API-Key steht im HTML und ist damit öffentlich sichtbar. Das ist so vorgesehen.
Geschützt wird über die Domain: Der Abteilungsleiter muss jede Domain im BVV-Portal hinterlegen
(Vereinsverwaltung, Vereinshomepage, API-Key), mindestens:

- `esv-volleyball.de`
- `www.esv-volleyball.de`
- jede Test- oder Preview-Domain

Auf nicht freigeschalteten Domains (auch `localhost`) zeigen die Tabellen statt der Teamnamen "Fehlende Rechte".

## Hinweise

- Die Antwortzeit der Schnittstelle liegt bei ca. 5 Sekunden. Aus `data/bvv.json` lädt die Seite sofort, nur der API-Fallback braucht so lange (bis dahin Skeleton).
