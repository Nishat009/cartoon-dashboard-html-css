# Cartoon Lifestyle

A full-stack cartoon discovery dashboard built with Angular and Node.js/Express.

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
4. Seed the database:

   ```powershell
   npm run seed
   ```

5. Start the API and Angular app in separate terminals:

   ```powershell
   npm run start:api
   npm run start:web
   ```

6. Open http://localhost:4200. The API runs at http://localhost:3000.

Stop the Docker database when you are done with `npm run db:down`.

The dashboard supports cartoon search and genre filters, trending and favorites
views, details, sign-up/sign-in, and authenticated watch history and favorites.
Sign up before using personal favorites and watch history.
The API also exposes admin-only cartoon management endpoints; set a user's
`role` to `admin` in MongoDB to use them.

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
backend/    Express API, MongoDB models, and seed data
image/      Existing dashboard images served by the Express API
```
