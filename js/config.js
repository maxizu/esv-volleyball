// Zentrale Konfiguration: API und alle Mannschaften.
// Neue Saison: nur die IDs unten austauschen.

export const API = {
  url: "https://api.volleyball-bayern.de/jsi/data.json.php",
  key: "a2082634-7373-4ac3-844b-3cfc2d68cab3",
  version: "2.4.0",
  timeoutMs: 30000,
};

// Wird bei Heimspielen hinter den Teamnamen gesetzt.
export const HOME_MARKER = "  \u{1F3E0}";

// group = Farbe der Kachel: herren | damen | mixed | jugend
// tabelle: false bei Pokalen (die API liefert dort keine Tabelle)
export const TILES = [
  {
    title: "Herren 1",
    group: "herren",
    competitions: [
      { name: "Bezirksklasse 1 Männer", wettbewerb: "4b09745a-8a2a-4323-bfbd-f6bb600eb2d6", team: "1676f1ba-b97a-4583-8c77-56898979a1f6", tabelle: true },
      { name: "Kreispokal OBB-Nord Männer", wettbewerb: "5bf9b56a-b508-4c1d-b4ec-e8b7cc3e1617", team: "60799450-149e-4f74-8098-ca17fe66c354", tabelle: false },
    ],
  },
  {
    title: "Damen 1",
    subtitle: "SG ESV Ingolstadt / TSV Kösching",
    group: "damen",
    competitions: [
      { name: "Bezirksklasse 1 Frauen", wettbewerb: "d14a83b4-3109-4be5-835b-e56282234a5b", team: "8ef5d0c8-a5ac-486b-ac9e-a262f38de1c4", tabelle: true },
      { name: "Kreispokal OBB-Nord Frauen", wettbewerb: "554ebdfe-d89c-4961-976f-8cf5aa03c136", team: "e095241b-c96e-45b2-9255-e2fb2e1b701c", tabelle: false },
    ],
  },
  {
    title: "Herren 2",
    group: "herren",
    competitions: [
      { name: "Kreisliga 1 Männer", wettbewerb: "dcbdb943-fdc7-4ea8-bab9-560c21b07f38", team: "ac57a0c8-6024-4908-aabd-ebb40e0188f0", tabelle: true },
      { name: "Kreispokal OBB-Nord Männer", wettbewerb: "5bf9b56a-b508-4c1d-b4ec-e8b7cc3e1617", team: "c9905e30-d697-4fef-a8e6-0b5ef25f6d88", tabelle: false },
    ],
  },
  {
    title: "Damen 2",
    group: "damen",
    competitions: [
      { name: "Kreisliga 1 Frauen", wettbewerb: "6cfadf91-0e4f-4500-a1d4-c2cb98450a0b", team: "8552d90e-8e8e-4625-b41e-41a6843dd117", tabelle: true },
    ],
  },
  {
    title: "Damen 3",
    group: "damen",
    competitions: [
      { name: "Kreisklasse 1 Frauen", wettbewerb: "c27621a8-c32b-455b-9c9a-6f8e1183de5a", team: "3ebf3c16-2109-4360-b71a-efb3a100310d", tabelle: true },
    ],
  },
  {
    title: "Mixed",
    group: "mixed",
    competitions: [
      { name: "2A Liga Nord Mixed", wettbewerb: "0663df69-91d4-459d-bfcf-df7070d23aaa", team: "d320a317-e56d-4790-9363-2e1caf17cc7b", tabelle: true },
    ],
  },
  {
    title: "U20 weiblich",
    group: "jugend",
    competitions: [
      { name: "U20 Kreisliga 1 weiblich", wettbewerb: "61e7b98e-afe2-4ae1-91d7-0c7475f58089", team: "02a59e1a-bcf7-4e1c-8db6-7f053b5bf188", tabelle: true },
    ],
  },
  {
    title: "U18 weiblich",
    group: "jugend",
    competitions: [
      { name: "U18 Kreisliga 1 weiblich", wettbewerb: "635a5953-0832-4c86-bac6-43a1ce55bc1d", team: "3f2b28d4-287c-44e5-ac8a-1f404e27c3f3", tabelle: true },
    ],
  },
  {
    title: "U18 männlich",
    group: "jugend",
    competitions: [
      { name: "U18 Kreisliga 1 männlich", wettbewerb: "811f8864-166e-49ef-8246-e6607b936e63", team: "165b7388-172b-47d2-99bc-48833af37cd6", tabelle: true },
    ],
  },
  {
    title: "U16 weiblich",
    group: "jugend",
    competitions: [
      { name: "U16 Kreisliga 1 weiblich", wettbewerb: "763e820d-65c3-40b7-9674-81e76f34b4f7", team: "44a5e89c-503d-4766-8573-cf77f6d1c904", tabelle: true },
    ],
  },
];
