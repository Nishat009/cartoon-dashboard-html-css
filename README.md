# Toonbox

Frontend-only Angular cartoon dashboard with a built-in mock catalog. No backend, database, Docker, or credentials required.

## Run

Install Node.js 22.22.3 or newer, then run:

```powershell
npm install
npm run dev
```

Open the printed localhost URL. WEB_PORT optionally sets the starting port (default 4200).

## Build

Run `npm run build` and deploy `frontend/dist/cartoon-lifestyle/browser` to a static host.

Search, filtering, sorting, favorites, details, and history run locally. Catalog edits, favorites, and history persist in browser localStorage. Clearing site storage resets the mock data. If storage is unavailable, changes last for the session.

Choose **Try demo profile**, then **Admin**, to create, edit, or delete local cartoons. This profile simulates the UI and provides no authentication. Newsletter submissions only show a demo confirmation; no email is sent.

Mock catalog: `frontend/src/app/demo-data.ts`. Optimized local demo images live in `frontend/public/images/cartoons/` and are bundled in every build. Related fictional shows share themed artwork. Generated SVG posters remain a fallback when an image fails. The root `image/` folder contains original design assets.

## Sass styling

Angular compiles `frontend/src/styles.scss`. Styles use Sass modules in `frontend/src/styles/`: theme tokens, base styles, components, responsive rules, and admin styles. Shared breakpoint mixins are in `_mixins.scss`. New Angular components default to SCSS.

## SaaS demo flows

Pricing offers Starter, Plus, and Family sample memberships. Choosing a plan opens demo profile onboarding, then the account overview. Plans can be changed or downgraded locally. Profile and plan persist in this browser. There is no billing, authentication, or cross-device sync. The account links to favorites, history, and a local catalog studio.
