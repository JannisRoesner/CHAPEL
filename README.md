# CHAPEL

**Church Hymn Audio Playlist Engine for Liturgy**

CHAPEL ist eine moderne Web-App zur Verwaltung und touch-gesteuerten Wiedergabe von Gottesdienst-Playlists. Liturgieelemente sind fix, Lieder frei austauschbar. Mehrere Nutzer können parallel arbeiten; die Audiobibliothek und Gottesdienst-Übersicht aktualisieren sich dabei automatisch.

## Funktionen

- MP3-Bibliothek mit Upload, Metadaten, Kategorien (Lied / Liturgie) und Auto-Deduplication (SHA-256)
- Gottesdienst-Typen als Vorlagen (Liturgie + Lied-Slots)
- Konkrete Gottesdienste aus Vorlagen erstellen und Lied-Slots befüllen
- Touch-minimale Wiedergabe: Play → Stopp nach Titel → nächster Titel per Knopf
- Automatische Listen-Aktualisierung via WebSocket (Bibliothek, Gottesdienst-Übersicht)
- PWA mit Offline-Cache für Gottesdienste
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
| `/settings` | Theme, Offline-Cache & Benutzerverwaltung (Admin) |

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
