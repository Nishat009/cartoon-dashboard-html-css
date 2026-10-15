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

- **Original design:** background artwork, lilac glass panels, sidebar, Popular Playlist coverflow slider (Swiper), Featured Music, Recommended Cartoon and the music player.
- **New sections:** Browse by Genre (filters Trending), Trending This Week, Continue Watching, Cartoon of the Week, Comic Book Shelf, Your Favorites and a newsletter form. The right column adds Weekly Activity, Upcoming Premieres, Friends Watching and Toon Trivia.
- Sidebar items scroll to their section, and the active item follows your scroll position.
- Phones use a sticky horizontal menu and full-width content. Tablets use a compact sidebar and two-column activity area; larger screens show the music and activity column beside the catalog.
- Popular Playlist advances automatically in a continuous loop. Horizontal collections scroll back and forth on their own while visible; hover, focus, touch and dragging pause movement. Motion stops in hidden tabs, open dialogs, or when decorative animations/reduced motion disable it.
- Favorites, saved books and premiere reminders are saved in browser localStorage. The newsletter form is a demo; no email is sent.
- Explore playlist and catalog titles in a keyboard-accessible details dialog. Full episodes are not hosted.
- Open **Library** to manage saved cartoons, books and reminders. **Settings** stores background and motion preferences locally.
- **Listen & unwind** selects real tracks in the audio player. Playback requires access to the remote audio source.

## Code layout

- `frontend/src/app/app.component.*`: page layout and sections
- `dashboard-header.component.*`: reusable search and greeting header
- `catalog.component.ts`: complete cartoon search, genre filtering, sorting and empty states
- `detail-dialog.component.ts`: native modal for cartoon details, preferences and saved library
- `experience.service.ts`: dialog state and persistent appearance preferences
- `track-list.component.ts`: track selection connected to the player
- `frontend/src/app/dashboard-data.ts`: all demo content
- `sidebar`, `playlist-slider`, `music-player` and `weekly-activity` components, the `favorite-button` component, and `drag-scroll.directive.ts` for the drag-to-scroll rows
- `frontend/src/styles.css`: Tailwind setup, theme tokens, and the few styles Tailwind can't express (Swiper bullets, the range slider, scrollbars)

Images live in `frontend/public/images/`. The root `index.html`, `style.css`, `script.js` and `image/` folder are the original static version and its full-size assets.

The Angular components use OnPush change detection. Scroll navigation caches section positions through ResizeObserver. A translucent lilac panel and frosted blur keep the original background visible. Audio waits for playback before downloading; offscreen images load lazily. Reduced-motion preferences disable decorative animation. Catalog search includes titles and genres and returns all matching shows. Fonts and icons are served locally.

## Images and checks

`npm run optimize:images` generates WebP assets from the retained JPG originals. The dashboard uses WebP images, reducing the combined referenced image size from 1,392,580 to 441,962 bytes (68%). The background is 43,946 bytes.

`npm run test:e2e` runs Playwright interaction checks on desktop and mobile. Install Chromium once with `npx playwright install chromium` if it is missing. Tests cover layout overflow, search, sorting, filters, details, persistent favorites, library management, settings and track selection.
