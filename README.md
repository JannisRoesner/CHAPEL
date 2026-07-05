# CHAPEL

**Church Hymn Audio Playlist Engine for Liturgy**

CHAPEL ist eine moderne Web-App zur Verwaltung und touch-gesteuerten Wiedergabe von Gottesdienst-Playlists. Liturgieelemente sind fix, Lieder frei austauschbar. Mehrere Nutzer können gleichzeitig an der Bibliothek arbeiten (Echtzeit-Sync).

## Funktionen

- MP3-Bibliothek mit Upload, Metadaten, Kategorien (Lied / Liturgie) und Auto-Deduplication (SHA-256)
- Gottesdienst-Typen als Vorlagen (Liturgie + Lied-Slots)
- Konkrete Gottesdienste aus Vorlagen erstellen und Lied-Slots befüllen
- Touch-minimale Wiedergabe: Play → Stopp nach Titel → nächster Titel per Knopf
- Echtzeit-Updates via WebSocket
- PWA mit Offline-Cache für Gottesdienste
- Hell/Dunkel-Modus, Font Awesome Icons
- Docker-Deployment (eine Gemeinde pro Installation)

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

PostgreSQL starten (z. B. nur die DB via Docker):

```bash
docker compose up db -d
npm run db:migrate
```

### 4. Entwicklungsserver

```bash
npm run dev
```

App: http://localhost:3000

Standard-Login (nach Seed): `admin@chapel.local` / `changeme` (siehe `.env`)

## Produktion (Docker)

```bash
cp .env.example .env
# NUXT_SESSION_PASSWORD und ADMIN_* anpassen

docker compose up --build -d
```

App: http://localhost:3000

Migrationen laufen beim Container-Start automatisch.

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
| `/login` | Anmeldung |
| `/library` | MP3-Bibliothek |
| `/service-types` | Gottesdienst-Vorlagen |
| `/services` | Konkrete Gottesdienste |
| `/playback` | Touch-Wiedergabe |
| `/settings` | Theme & Offline-Cache |

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

MIT
