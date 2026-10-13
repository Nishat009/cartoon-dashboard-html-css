# Cartoon Lifestyle

A glassmorphism cartoon and music dashboard built with Angular and Tailwind CSS. It keeps the original HTML/CSS design and adds more sections. It is frontend only: no backend, database or credentials.

## Run

Install Node.js 22.22.3 or newer, then run:

```powershell
npm install
npm run dev
```

Open the printed localhost URL. `WEB_PORT` optionally sets the starting port (default 4200).

## Build

Run `npm run build` and deploy `frontend/dist/cartoon-lifestyle/browser` to a static host.

## What's on the page

- **Original design:** sidebar, Popular Playlist coverflow slider (Swiper), Featured Music, Recommended Cartoon, Recommended Songs and the music player.
- **New sections:** Browse by Genre (filters Trending), Trending This Week, Continue Watching, Cartoon of the Week, Comic Book Shelf, Your Favorites and a newsletter form. The right column adds Weekly Activity, Upcoming Premieres, Friends Watching and Toon Trivia.
- Sidebar items scroll to their section, and the active item follows your scroll position.
- Favorites, saved books and premiere reminders are saved in browser localStorage. The newsletter form is a demo; no email is sent.

## Code layout

- `frontend/src/app/app.component.*`: page layout and sections
- `frontend/src/app/dashboard-data.ts`: all demo content
- `sidebar`, `playlist-slider`, `music-player` and `weekly-activity` components, the `favorite-button` component, and `drag-scroll.directive.ts` for the drag-to-scroll rows
- `frontend/src/styles.css`: Tailwind setup, theme tokens, and the few styles Tailwind can't express (Swiper bullets, the range slider, scrollbars)

Images live in `frontend/public/images/`. The root `index.html`, `style.css`, `script.js` and `image/` folder are the original static version and its full-size assets.
