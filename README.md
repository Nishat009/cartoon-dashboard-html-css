# Toonbox

A full-stack cartoon discovery dashboard built with Angular and Node.js/Express,
with a pink/purple theme, scroll-reveal animations, and animated counters.

## Requirements

- Node.js 22.12 or newer and npm
- Docker Desktop (recommended) or MongoDB running locally / a MongoDB Atlas connection string

## Run locally

1. Install dependencies from the project root:

   ```powershell
   npm install
   ```

2. Start local MongoDB with Docker:

   ```powershell
   npm run db:up
   ```

3. Copy `backend/.env.example` to `backend/.env`. If you use another MongoDB instance, update `MONGODB_URI`; replace `JWT_SECRET` with a long, random secret.
   For MongoDB Atlas, use the `mongodb+srv://` URI with `/cartoon_lifestyle` as
   the database name, and add your IP under Atlas **Network Access**. If the
   connection fails with `querySrv ECONNREFUSED`, set `DNS_SERVERS=8.8.8.8,1.1.1.1`.
4. Seed the database:

   ```powershell
   npm run seed
   ```

5. Start the API and the Angular app together:

   ```powershell
   npm run dev
   ```

6. Open the `Toonbox:` URL it prints (usually http://localhost:4200).

### Ports

Ports are not fixed. The API starts on `PORT` (default 3000) and moves to the
next free port if it is busy; `npm run dev` then starts the web app on the
first free port from `WEB_PORT` (default 4200) and points it at the API. The
app calls a relative `/api`, which `ng serve` proxies to the backend
(`frontend/proxy.conf.mjs`).

To run them in separate terminals instead, tell the web app where the API is
when it is not on 3000:

```powershell
npm run start:api                       # prints the port it is using
$env:API_PORT = "3001"; npm run start:web
```

For a single-port setup, build the frontend and start only the API; it serves
the app and the API together on whatever port it gets. Rebuild after frontend
changes, because the API serves the last build.

```powershell
npm run build
npm run start:api
```

Stop the Docker database when you are done with `npm run db:down`.

The dashboard supports cartoon search and genre filters, trending and favorites
views, details, sign-up/sign-in, and authenticated watch history and favorites.
Sign up before using personal favorites and watch history.
The API also exposes admin-only cartoon management endpoints; set a user's
`role` to `admin` in MongoDB to use them.

## Demo mode

If the API is offline or returns no cartoons, the frontend switches to demo
mode and uses a built-in catalog (`frontend/src/app/demo-data.ts`). Search,
filters, favorites, and watch history all work in the browser without signing
in, but nothing is saved. Posters are generated as SVGs, and the same
generator is used for cartoons with no image or when an image fails to load.

To try the UI without MongoDB, run only:

```powershell
npm run start:web
```

## API

- `GET /api/health`
- `GET /api/cartoons?q=&genre=&sort=trending`
- `GET /api/genres`
- `GET /api/cartoons/:id`
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/favorites`, `PUT /api/favorites/:cartoonId`, `DELETE /api/favorites/:cartoonId`
- `GET /api/watch-history`, `PUT /api/watch-history/:cartoonId`
- `POST /api/admin/cartoons`, `PATCH /api/admin/cartoons/:id`, `DELETE /api/admin/cartoons/:id`

## Project structure

```text
frontend/   Angular application
  src/app/app.component.*      Dashboard layout and logic
  src/app/demo-data.ts         Offline demo catalog and SVG poster generator
  src/app/motion.directives.ts Scroll-reveal and count-up directives
  proxy.conf.mjs               Dev-server proxy for /api and /image
backend/    Express API, MongoDB models, and seed data
image/      Dashboard images and video served by the Express API
scripts/dev.mjs                Starts the API and web app on free ports
```
