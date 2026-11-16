# CHAPEL

**Church Hymn Audio Playlist Engine for Liturgy**

CHAPEL ist eine moderne Web-App zur Verwaltung und touch-gesteuerten Wiedergabe von Gottesdienst-Playlists. Liturgieelemente sind fix, Lieder frei austauschbar. Mehrere Nutzer können parallel arbeiten; die Audiobibliothek und Gottesdienst-Übersicht aktualisieren sich dabei automatisch.

## Funktionen

- MP3-Bibliothek mit Upload, Metadaten, Kategorien (Lied / Ein-/Ausgang / Liturgie) und Auto-Deduplication (SHA-256)
- Nicht-destruktive Tempo-Varianten (50–150 %, tonhöhenerhaltend) – als eigene Einträge in der Bibliothek, in Gottesdiensten auswählbar
- Gottesdienst-Typen als Vorlagen (Liturgie + Lied-Slots), Reihenfolge per Drag & Drop (Touch, Maus, Tastatur)
- Konkrete Gottesdienste aus Vorlagen erstellen und Lied-Slots befüllen; Vorlagen und Gottesdienste umbenennen und duplizieren
- Lieder direkt im Auswahl-Dialog hochladen
- Wiedergabe-Fortschritt bleibt beim Neuladen erhalten und wird nur zurückgesetzt, wenn der Ablauf des Gottesdienstes geändert wurde
- Touch-minimale Wiedergabe: Play → Stopp nach Titel → nächster Titel per Knopf
- Automatische Listen-Aktualisierung via WebSocket (Bibliothek, Gottesdienst-Übersicht)
- Installierbar als PWA (Wiedergabe im Browser benötigt eine Verbindung zum Server)
- [Paket-API](#offline-pakete-api-für-native-wiedergabe-clients) für native Offline-Clients (iOS/Android)
- Benutzerverwaltung (Admin: Anlegen und Rollen zuweisen)
- Hell/Dunkel-Modus, Font Awesome Icons
- Docker-Deployment (eine Gemeinde pro Installation)

Detail-Ansichten (Gottesdienst-Editor, Vorlagen-Editor) laden Änderungen anderer Nutzer nicht live nach.

## Tech-Stack

Nuxt 4 · Nuxt UI · PostgreSQL · Drizzle ORM · nuxt-auth-utils · Pinia · @vite-pwa/nuxt

## Schnellstart (Entwicklung)

### Voraussetzungen

- Node.js 22+
- PostgreSQL 16 (oder Docker nur für die DB)

### 1. Abhängigkeiten

```bash
npm install
npm run icons
```

### 2. Umgebung

Kopieren Sie `.env.example` nach `.env` und passen Sie die Werte an.

### 3. Datenbank

PostgreSQL muss erreichbar sein (lokal installiert oder per Docker):

```bash
docker run -d --name chapel-db \
  -e POSTGRES_USER=chapel \
  -e POSTGRES_PASSWORD=chapel \
  -e POSTGRES_DB=chapel \
  -p 5432:5432 \
  postgres:16

npm run db:migrate
```

`DATABASE_URL` in `.env` muss zum laufenden PostgreSQL passen (siehe `.env.example`).

### 4. Entwicklungsserver

```bash
npm run dev
```

App: http://localhost:3001

Standard-Login (nach Seed): Werte aus `ADMIN_EMAIL` und `ADMIN_PASSWORD` in `.env` (Default in `.env.example`: `admin@example.com` / `changeme`)

## Produktion (Docker)

Ein Container enthält App und PostgreSQL — ideal für Unraid o. Ä.

```bash
cp .env.example .env
# NUXT_SESSION_PASSWORD, POSTGRES_PASSWORD und ADMIN_* anpassen

docker compose up --build -d
```

App: http://localhost:2500

Migrationen und DB-Initialisierung laufen beim Container-Start automatisch.

### Unraid / manuelles Deployment

| Host-Pfad | Container-Pfad | Zweck |
|---|---|---|
| `/mnt/user/appdata/chapel/postgres` | `/var/lib/postgresql/data` | PostgreSQL-Daten |
| `/mnt/user/appdata/chapel/audio` | `/data/audio` | MP3-Bibliothek |

Wichtige Umgebungsvariablen:

| Variable | Pflicht | Beschreibung |
|---|---|---|
| `NUXT_SESSION_PASSWORD` | ja | Session-Geheimnis (mind. 32 Zeichen) |
| `POSTGRES_PASSWORD` | empfohlen | DB-Passwort (Default: `chapel`) |
| `ADMIN_EMAIL` | beim Erststart | Erster Admin (nur wenn DB leer) |
| `ADMIN_PASSWORD` | beim Erststart | Admin-Passwort (nur wenn DB leer) |

Port **2500** nach außen mappen. `DATABASE_URL` muss nicht gesetzt werden — wird intern aus `POSTGRES_*` gebaut.

## Projektstruktur

```
app/           # Vue-Frontend (Seiten, Komponenten, Stores)
server/        # Nitro API, WebSocket, Drizzle-Schema
shared/        # Gemeinsame TypeScript-Typen
scripts/       # Migration, Icon-Generierung
```

## Wichtige Routen

| Route | Beschreibung |
|---|---|
| `/` | Landing-Page (öffentlich; eingeloggte Nutzer → `/playback`) |
| `/login` | Anmeldung |
| `/library` | MP3-Bibliothek |
| `/service-types` | Gottesdienst-Vorlagen |
| `/services` | Konkrete Gottesdienste |
| `/playback` | Touch-Wiedergabe |
| `/settings` | Theme, Passwort, Branding & Benutzerverwaltung (Admin) |

## Offline-Pakete (API für native Wiedergabe-Clients)

Die Web-App selbst spielt nur online ab. Für die Offline-Wiedergabe ist eine separate
iOS-/Android-App vorgesehen, die fertige Gottesdienste als **Paket** (ZIP-Container) vom
Server lädt und danach **ohne Login und ohne Internet** abspielt. Der Server stellt dafür
die folgenden Endpunkte bereit.

### Authentifizierung

Alle Paket-Endpunkte erfordern einen angemeldeten Benutzer (Rolle egal).

1. `POST /api/auth/login` mit JSON `{ "email": "...", "password": "..." }`
2. Die Antwort setzt das Session-Cookie `nuxt-session` (HttpOnly, gültig 90 Tage).
   Der Client speichert es im Cookie-Store (`HTTPCookieStorage` / OkHttp `CookieJar`)
   und sendet es bei allen weiteren Anfragen mit.
3. Muss der Benutzer sein Passwort ändern (`mustChangePassword: true` in
   `GET /api/auth/me`), antworten die Endpunkte mit `403`. Der Client verweist dann auf
   die Web-App.
4. `401` → Session abgelaufen, erneut anmelden. Bereits heruntergeladene Pakete bleiben
   davon unberührt abspielbar.

Die Basis-URL des Servers (z. B. `https://chapel.gemeinde.de`) gibt der Benutzer in der App ein.
Alle URLs in den Antworten sind relativ zu dieser Basis-URL.

### Endpunkte

| Methode & Pfad | Beschreibung |
|---|---|
| `GET /api/packages` | Liste aller Gottesdienste mit aktueller Paket-`version` und Größe |
| `GET /api/packages/:serviceId` | Manifest (JSON). Header `ETag` = `"<version>"`, `If-None-Match` → `304` |
| `GET /api/packages/:serviceId/download` | Kompletter Container (`application/zip`) mit `Content-Length` |
| `GET /api/tracks/:trackId/stream` | Einzelne Audiodatei (Alternative zum ZIP, siehe `audio.url`) |

`GET /api/packages` – Beispielantwort:

```json
[
  {
    "serviceId": 12,
    "name": "1. Advent",
    "serviceDate": "2026-11-29T00:00:00.000Z",
    "version": "ea8c8f53b9835a2dbbc0e3568d7aa6f6",
    "updatedAt": "2026-11-15T16:58:57.120Z",
    "stepCount": 6,
    "totalAudioBytes": 18342011,
    "manifestUrl": "/api/packages/12",
    "downloadUrl": "/api/packages/12/download"
  }
]
```

### Container-Format (`formatVersion: 1`)

Unkomprimiertes ZIP (Methode STORE, kein ZIP64, max. 4 GB), lesbar mit
`java.util.zip.ZipInputStream` bzw. ZIPFoundation/SSZipArchive:

```
manifest.json
audio/<sha256>.<ext>      # jede Audiodatei genau einmal, auch wenn mehrfach verwendet
```

`manifest.json`:

```json
{
  "formatVersion": 1,
  "version": "ea8c8f53b9835a2dbbc0e3568d7aa6f6",
  "generatedAt": "2026-11-15T17:00:00.000Z",
  "service": {
    "id": 12,
    "name": "1. Advent",
    "serviceDate": "2026-11-29T00:00:00.000Z",
    "notes": null,
    "updatedAt": "2026-11-15T16:58:57.120Z"
  },
  "steps": [
    {
      "position": 0,
      "kind": "liturgy",
      "label": "Kyrie",
      "title": "Kyrie eleison",
      "composer": null,
      "durationMs": 61000,
      "playbackRate": 1,
      "audio": {
        "file": "audio/4990c2a0…f9f.mp3",
        "sha256": "4990c2a0…f9f",
        "mimeType": "audio/mpeg",
        "sizeBytes": 980044,
        "url": "/api/tracks/5/stream"
      }
    },
    {
      "position": 1,
      "kind": "songSlot",
      "label": "Eingangslied",
      "title": null,
      "composer": null,
      "durationMs": null,
      "playbackRate": 1,
      "audio": null
    }
  ],
  "totalAudioBytes": 980044
}
```

Feldbedeutung:

- `steps` sind nach `position` sortiert und bilden den Ablauf. `kind`: `liturgy` (fest) oder `songSlot` (Lied).
- `audio: null` → leerer Schritt (z. B. kein Lied gewählt). Der Player zeigt ihn an, überspringt ihn aber beim Abspielen.
- `playbackRate` → **Tempo-Faktor, beim Abspielen anzuwenden, Tonhöhe erhalten**
  (iOS: `AVAudioPlayer.enableRate = true; rate = …` bzw. `AVPlayerItem.audioTimePitchAlgorithm = .timeDomain`;
  Android/Media3: `player.setPlaybackParameters(PlaybackParameters(rate, 1f))`).
  Tempo-Varianten verweisen auf dieselbe Audiodatei wie das Original.
- `durationMs` ist bereits für `playbackRate` umgerechnet.
- `audio.sha256` erlaubt Integritätsprüfung und Deduplizierung über Pakete hinweg (gleicher Hash = gleiche Datei).
- `version` ist ein Inhalts-Hash: Er ändert sich genau dann, wenn sich Name, Datum, Notizen oder der abspielbare
  Ablauf (Schritte, Tracks, Tempo) ändern.

TypeScript-Definitionen: `PackageSummaryDto`, `PackageManifestDto`, `PackageStepDto` in
`shared/types/chapel.ts`; Implementierung in `server/utils/servicePackage.ts`.

### Empfohlener Client-Ablauf

1. Anmelden, `GET /api/packages` anzeigen; lokal gespeicherte Pakete mit `version` vergleichen
   → Status „aktuell“, „Update verfügbar“ oder „nicht geladen“.
2. Download: `GET /api/packages/:id/download` in eine temporäre Datei (Fortschritt über `Content-Length`),
   entpacken, `formatVersion` prüfen (unbekannte Version → abbrechen und App-Update empfehlen),
   SHA-256 der Audiodateien prüfen, dann atomar das alte Paket ersetzen.
   Alternativ: Manifest laden und nur fehlende Dateien über `audio.url` nachladen (Abgleich via `sha256`).
3. Wiedergabe komplett lokal aus dem Paketverzeichnis – keine Netzwerkzugriffe, keine Authentifizierung.
   Bedienkonzept analog Web: Play → Stopp nach jedem Titel → „Nächster“ per Knopf.
4. Wiedergabe-Fortschritt pro Paket speichern und beim Wechsel der `version` zurücksetzen
   (gleiches Verhalten wie die Web-App).

## Skripte

| Befehl | Beschreibung |
|---|---|
| `npm run dev` | Entwicklungsserver |
| `npm run build` | Produktions-Build |
| `npm run db:generate` | Drizzle-Migration erzeugen |
| `npm run db:migrate` | Migrationen ausführen |
| `npm run db:push` | Schema direkt pushen (Dev) |
| `npm run icons` | PWA-Icons generieren |

## Lizenz

[GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE) — Copyright © Jannis Rösner
