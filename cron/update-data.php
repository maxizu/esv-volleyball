<?php
declare(strict_types=1);

/**
 * Holt alle Daten von der BVV-Schnittstelle und schreibt data/bvv.json.
 *
 * Aufruf per Cronjob auf dem Webserver (Plesk: "PHP-Skript ausfuehren"), z. B.
 *   Skriptpfad: httpdocs/cron/update-data.php
 * Zeitplan siehe README.
 *
 * Die Mannschaften stehen in config/shared.json (gleiche Datei wie auf der Seite).
 * Bei einem Fehler bleibt die bisherige data/bvv.json unveraendert und das Skript
 * endet mit Exit-Code 1 (Plesk: Benachrichtigung "Nur Fehler").
 */

// Nie ueber den Webserver ausfuehrbar machen (sonst koennte jeder Abrufe ausloesen).
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("Nur per Cronjob/CLI.\n");
}

// Die Schnittstelle prueft die Domain (Origin/Referer) gegen den API-Key.
const ORIGIN = 'https://esv-volleyball.de';
const TIMEOUT_SECONDS = 60;

$root = dirname(__DIR__);
$configFile = $root . '/config/shared.json';
$dataDir = $root . '/data';
$outFile = $dataDir . '/bvv.json';

function fail(string $message): never
{
    fwrite(STDERR, "FEHLER: {$message}\n");
    exit(1);
}

/** POST an die Schnittstelle, liefert den Antwort-Body. */
function post(string $url, string $body, array $headers): string
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 15,
            CURLOPT_TIMEOUT => TIMEOUT_SECONDS,
            CURLOPT_ENCODING => '', // gzip/deflate erlauben
        ]);
        $response = curl_exec($ch);
        if ($response === false) {
            fail('Abruf fehlgeschlagen: ' . curl_error($ch));
        }
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        if ($status !== 200) {
            fail("API antwortet mit HTTP {$status}");
        }
        return (string) $response;
    }

    // Fallback ohne cURL-Erweiterung
    $context = stream_context_create(['http' => [
        'method' => 'POST',
        'header' => implode("\r\n", $headers),
        'content' => $body,
        'timeout' => TIMEOUT_SECONDS,
        'ignore_errors' => true,
    ]]);
    $response = @file_get_contents($url, false, $context);
    if ($response === false) {
        fail('Abruf fehlgeschlagen (weder cURL noch allow_url_fopen nutzbar?)');
    }
    $status = 0;
    if (isset($http_response_header[0]) && preg_match('#\s(\d{3})\s#', $http_response_header[0], $m)) {
        $status = (int) $m[1];
    }
    if ($status !== 200) {
        fail("API antwortet mit HTTP {$status}");
    }
    return $response;
}

// Verhindert, dass sich zwei Laeufe ueberschneiden.
if (!is_dir($dataDir) && !mkdir($dataDir, 0755, true) && !is_dir($dataDir)) {
    fail("Ordner {$dataDir} nicht anlegbar");
}
$lock = fopen($dataDir . '/.update.lock', 'c');
if ($lock === false || !flock($lock, LOCK_EX | LOCK_NB)) {
    echo "Anderer Lauf aktiv, uebersprungen.\n";
    exit(0);
}

// Konfiguration lesen und Abfragen bauen (gleiche Abfragen und Schluessel wie js/queries.js)
try {
    $config = json_decode((string) file_get_contents($configFile), true, 512, JSON_THROW_ON_ERROR);
} catch (Throwable $e) {
    fail("{$configFile} nicht lesbar: " . $e->getMessage());
}

$queries = [];
$keys = [];
foreach ($config['tiles'] as $tile) {
    foreach ($tile['competitions'] as $c) {
        $base = ['w' => $c['wettbewerb'], 'teams' => [$c['team']]];

        $queries[] = $base + [
            'type' => 'spiele',
            'teamfilter' => [$c['team']],
            'heimspielkennzeichen' => $config['homeMarker'],
        ];
        $keys[] = "spiele|{$c['wettbewerb']}|{$c['team']}";

        if (!empty($c['tabelle'])) {
            $queries[] = $base + ['type' => 'tabelle'];
            $keys[] = "tabelle|{$c['wettbewerb']}|{$c['team']}";
        }
    }
}

// Alle Bloecke in einem Request
$jsonFlags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR;
$payload = json_encode([
    'multimode' => 1,
    'key' => $config['api']['key'],
    'version' => $config['api']['version'],
    'subs' => $queries,
], $jsonFlags);

$responseBody = post($config['api']['url'], 'data=' . rawurlencode($payload), [
    'Content-Type: application/x-www-form-urlencoded',
    'Origin: ' . ORIGIN,
    'Referer: ' . ORIGIN . '/',
]);

try {
    $response = json_decode($responseBody, true, 512, JSON_THROW_ON_ERROR);
} catch (Throwable $e) {
    fail('Antwort ist kein gueltiges JSON: ' . $e->getMessage());
}

$subs = $response['subs'] ?? null;
if (!is_array($subs) || count($subs) !== count($queries)) {
    fail('Antwort hat falsche Anzahl Bloecke');
}

$blocks = [];
foreach ($subs as $i => $sub) {
    $content = $sub['content'] ?? null;
    if (!is_string($content) || trim($content) === '') {
        fail("Leere Antwort fuer Block {$i} ({$keys[$i]})");
    }
    if (str_contains($content, 'Fehlende Rechte')) {
        fail("'Fehlende Rechte': ist " . ORIGIN . ' im BVV-Portal fuer den API-Key hinterlegt?');
    }
    $blocks[$keys[$i]] = $content;
}

// Atomar schreiben, damit die Seite nie eine halbe Datei liest
$json = json_encode([
    'fetchedAt' => gmdate('Y-m-d\TH:i:s\Z'),
    'blocks' => $blocks,
], $jsonFlags);

$tmp = $outFile . '.tmp';
if (file_put_contents($tmp, $json, LOCK_EX) === false) {
    fail("{$tmp} nicht schreibbar");
}
chmod($tmp, 0644);
if (!rename($tmp, $outFile)) {
    fail("{$outFile} nicht ersetzbar");
}

echo count($blocks) . ' Bloecke geschrieben (' . round(strlen($json) / 1024) . " KB).\n";
