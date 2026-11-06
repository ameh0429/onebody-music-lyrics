# Onebody Music Lyrics API

A **NestJS 11 / TypeScript** backend for artistes, albums, songs, lyrics, image uploads and user accounts. Uses **PostgreSQL**, **Sequelize 6** (`sequelize-typescript`), JWT authentication, bcrypt password hashing, DTO validation and Swagger/OpenAPI documentation.

## Requirements

- Node.js 22 or newer (Node.js 24 is pinned in `.nvmrc` and was used for validation).
- npm and PostgreSQL (tested with PostgreSQL 17).
- Docker with Compose if you want the supplied local database container.

## Run locally

```bash
npm ci
cp .env.example .env
```

Edit `.env`: set a local database password and replace `JWT_SECRET` with a random secret of at least 32 characters. Generate a secret with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Keep `.env` private; it is ignored by Git. Set environment variables through your hosting platform in production.

Start PostgreSQL, initialize tables explicitly, then start the API:

```bash
docker compose up -d --wait db
npm run db:setup
npm run start:dev
```

Alternatively, point `.env` at an existing PostgreSQL database. The database itself must already exist and the configured user must have the necessary table permissions. `db:setup` creates missing tables; it does **not** create the database, alter existing tables or delete data.

The server listens on `PORT` (default `3000`) and `0.0.0.0`. API paths start with `/api`; the health endpoint is `/health`.

### Configuration

| Variable         | Purpose                                 | Default                      |
| ---------------- | --------------------------------------- | ---------------------------- |
| `DB_HOST`        | PostgreSQL hostname                     | Required                     |
| `DB_PORT`        | PostgreSQL port                         | `5432`                       |
| `DB_NAME`        | Database name                           | Required                     |
| `DB_USER`        | PostgreSQL username                     | Required                     |
| `DB_PASSWORD`    | PostgreSQL password                     | Required                     |
| `JWT_SECRET`     | JWT signing key, at least 32 characters | Required                     |
| `JWT_EXPIRES_IN` | Token duration, e.g. `1h` or `7d`       | `7d`                         |
| `PORT`           | HTTP port                               | `3000`                       |
| `NODE_ENV`       | Runtime environment                     | Set to `development` locally |

Environment variables override `.env`. Invalid required configuration fails at startup. The database container reads its initialization credentials only when its data volume is first created; changing `.env` does not change an existing database user's password.

### Commands

| Command                              | Purpose                                                              |
| ------------------------------------ | -------------------------------------------------------------------- |
| `npm run start:dev` or `npm run dev` | TypeScript development server with automatic restart                 |
| `npm start`                          | Compile and run the server                                           |
| `npm run build`                      | Compile TypeScript into `dist/`                                      |
| `npm run start:prod`                 | Run an already compiled build                                        |
| `npm run typecheck`                  | Check TypeScript without emitting files                              |
| `npm run db:setup`                   | Create missing tables explicitly, without altering existing tables   |
| `npm test`                           | Run configuration and DTO validation tests                           |
| `npm run test:e2e`                   | Run PostgreSQL-backed API integration tests; requires `TEST_DB_NAME` |

For production, install dependencies, build, then run `npm run start:prod`. Use reviewed database migrations for future schema changes; `db:setup` is an initial bootstrap utility, not a schema migration system. Startup never synchronizes or alters tables.

## Swagger documentation

- **`/docs`**: interactive Swagger UI.
- **`/docs-json`**: generated OpenAPI JSON.

Swagger documents request DTOs, validation limits, successful response shapes, errors, image uploads, and bearer authentication. Register or log in, copy `data.token`, and use the **Authorize** button with the token. Public reads do not require authentication.

## Endpoints

| Method | Path                                                     | Authentication | Purpose                                   |
| ------ | -------------------------------------------------------- | -------------- | ----------------------------------------- |
| GET    | `/health`                                                | Public         | API and database connectivity             |
| POST   | `/api/auth/register`                                     | Public         | Create a user and return a token          |
| POST   | `/api/auth/login`                                        | Public         | Login and return a token                  |
| GET    | `/api/auth/me`                                           | Bearer token   | Current user profile                      |
| PUT    | `/api/auth/update-password`                              | Bearer token   | Verify current password and set a new one |
| GET    | `/api/artistes`, `/api/albums`, `/api/songs`             | Public         | List records                              |
| GET    | `/api/artistes/:id`, `/api/albums/:id`, `/api/songs/:id` | Public         | Get a record and its relationships        |
| POST   | `/api/artistes`, `/api/albums`, `/api/songs`             | Bearer token   | Create a record                           |
| PUT    | `/api/artistes/:id`, `/api/albums/:id`, `/api/songs/:id` | Bearer token   | Update supplied fields                    |
| DELETE | `/api/artistes/:id`, `/api/albums/:id`, `/api/songs/:id` | Bearer token   | Delete a record                           |

Registration accepts `name`, `email`, and `password`. Passwords must have at least 6 characters and at most 72 UTF-8 bytes. Public registration always creates the `user` role; `role` and other unknown input fields are rejected. Authenticated users can perform music writes, matching the previous API's access policy. Password hashes are never included in user responses.

Password changes return a new token; existing tokens remain valid until their expiry. Tokens are not stored in a revocation table.

### Request examples

Artiste:

```json
{ "name": "Ada Ehi", "desc": "Gospel singer" }
```

Album (requires at least one existing artiste):

```json
{ "name": "Born of God", "releaseYear": 2020, "artisteIds": [1] }
```

Song (one main artiste, optional featured artistes and album):

```json
{
  "name": "Example song",
  "artisteId": 1,
  "featuredArtisteIds": [2],
  "albumId": 1,
  "lyrics": "Song lyrics..."
}
```

For song updates, `featuredArtisteIds: []` clears featured artistes and `albumId: null` removes the album. Omitted fields are preserved. A main artiste cannot also be featured on the same song. Album and song relationship writes run inside transactions.

Artiste detail responses contain `albums`, `mainSongs` and `featuredSongs`. Album details contain `artistes` and `songs`, including each song's main and featured artistes. Song responses contain `mainArtiste`, `featuredArtistes` and `album`.

### Image uploads

Create/update endpoints accept JSON or `multipart/form-data`. For multipart requests, use the `image` field and send array fields as **JSON strings**, such as `[1,2]`. The optional image accepts JPEG, PNG, GIF and WebP MIME types, up to **5 MiB**. Example using an existing bearer token:

```bash
curl -X POST http://127.0.0.1:3000/api/albums \
  -H "Authorization: Bearer $TOKEN" \
  -F 'name=Example album' \
  -F 'artisteIds=[1,2]' \
  -F 'image=@cover.png'
```

Uploads use generated filenames and are served publicly from `/uploads/<filename>`. Files from failed requests are removed. Existing images remain on disk after a record is replaced or deleted; arrange file retention separately. Persist `uploads/` when deploying to an ephemeral filesystem.

### Responses

Collections use `{ "success": true, "count": 0, "data": [] }`. Details and writes return `{ "success": true, "data": ... }`, with a message for writes. Deletes return success and a message. Errors use `{ "success": false, "message": "..." }`; validation may return an array of messages. Creation returns 201; login, reads, updates and deletes return 200. Invalid input returns 400, authentication failures 401, missing records 404, and oversized files 413.

## Database and migration from the JavaScript API

The NestJS models preserve the original tables and camelCase columns:

- `users`: accounts with hashed passwords and roles.
- `artistes`, `albums`, `songs`: music content.
- `album_artistes`: album/artiste relationships.
- `song_featured_artistes`: featured artistes on songs.

Albums have multiple artistes. A song has one main artiste, optional featured artistes and an optional album. Deleting an album sets its songs' `albumId` to null; deleting an artiste cascades to songs where it is the main artiste.

The old code had conflicting song controllers and invalid association aliases, plus a missing default router export that prevented startup. This migration replaces the old JavaScript entry point and routers with NestJS controllers/services and uses the existing database model's `artisteId` / `featuredArtisteIds` representation. Clients sending the broken controller's `artistes: [{ id, isFeatured }]` payload must switch to those fields.

Back up an existing database before deployment. Existing table names and data are retained; no destructive reset is required. `db:setup` does not repair schema drift. Compare and migrate any database whose schema differs from the original models before deploying.

## Tests

Unit tests run without a database:

```bash
npm test
```

For integration tests, create a **separate** PostgreSQL database whose name ends in `_test`. With the Compose database:

```bash
docker compose exec db sh -c 'createdb -U "$POSTGRES_USER" onebody_music_lyrics_test'
DB_NAME=onebody_music_lyrics_test npm run db:setup
TEST_DB_NAME=onebody_music_lyrics_test npm run test:e2e
```

The environment-variable prefixes above use POSIX shell syntax. The tests read connection credentials from `.env`, override the database name, start NestJS on an available local port, and remove the records and uploaded file they create. They verify health, Swagger, JWT authentication, password privacy and updates, DTO validation, image handling, music CRUD, nested relationships and rollback on invalid relationship updates. They do not reset or drop existing tables.

## Project structure

```text
src/
  main.ts                  # Start the HTTP server
  app.ts                   # Validation, errors, uploads and Swagger setup
  app.module.ts            # Application modules and PostgreSQL configuration
  auth/                    # Registration, login, password updates and JWT guard
  music/                   # Artiste, album and song controllers, services and DTOs
  database/                # Sequelize models and explicit table bootstrap
  config/                  # Environment validation
  health/                  # Database-backed health endpoint
  common/                  # Error handling, upload handling and OpenAPI responses
test/                      # Validation and API integration tests
compose.yaml               # Optional local PostgreSQL service
.env.example               # Configuration template without real secrets
```

## Troubleshooting

- **Missing environment variable / short JWT secret:** fill in `.env` using the template.
- **Connection refused / authentication failed:** start PostgreSQL, check host/port and credentials, and confirm the database exists.
- **Relation does not exist:** run `npm run db:setup` against the intended database. Existing incompatible schemas need a reviewed migration.
- **Port already in use:** stop the process you started or choose another `PORT`.
- **Old router export error:** use the new npm commands; `app.js` has been replaced by `src/main.ts` and `dist/main.js`.
