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
  names.js          Vereinheitlicht Teamnamen (z. B. Damen 1)
files/public/       Logo, Favicon, Instagram-Icon
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

## API-Key und Domain

Der API-Key steht im HTML und ist damit öffentlich sichtbar. Das ist so vorgesehen.
Geschützt wird über die Domain: Der Abteilungsleiter muss jede Domain im BVV-Portal hinterlegen
(Vereinsverwaltung, Vereinshomepage, API-Key), mindestens:

- `esv-volleyball.de`
- `www.esv-volleyball.de`
- jede Test- oder Preview-Domain

Auf nicht freigeschalteten Domains (auch `localhost`) zeigen die Tabellen statt der Teamnamen "Fehlende Rechte".

## Hinweise

- Die Antwortzeit der Schnittstelle liegt bei ca. 5 Sekunden, bis dahin zeigt die Seite ein Skeleton.
