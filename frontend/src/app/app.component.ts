import { DetailDialogComponent } from './detail-dialog.component';
import { ExperienceService } from './experience.service';
import { TrackListComponent } from './track-list.component';
import { DashboardHeaderComponent } from './dashboard-header.component';
import { CatalogComponent } from './catalog.component';
import { DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, DestroyRef, NgZone, afterNextRender, computed, inject, signal } from "@angular/core";
import {
  ALBUMS, ARTISTS, BOOKS, CARTOONS, CONTINUE_WATCHING, FRIENDS, GENRE_TILES, PREMIERES, PRIMARY_NAV,
  SLIDES, SONGS, SPOTLIGHT, TRIVIA, USER, WEEKLY_ACTIVITY
} from "./dashboard-data";
import { DragScrollDirective } from "./drag-scroll.directive";
import { FavoriteButtonComponent } from "./favorite-button.component";
import { LibraryService } from "./library.service";
import { Cartoon, GenreTile, NavItem } from "./models";
import { MusicPlayerComponent } from "./music-player.component";
import { PlaylistSliderComponent } from "./playlist-slider.component";
import { RevealDirective } from "./reveal.directive";
import { SidebarComponent } from "./sidebar.component";
import { WeeklyActivityComponent } from "./weekly-activity.component";

const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const FOOTER_LABELS: Record<string, string> = { playlist: "Playlist", trending: "Trending", books: "Comic books", cartoons: "Cartoons", favorites: "Favorites" };
const byId = new Map(CARTOONS.map((cartoon) => [cartoon.id, cartoon]));

function greetingFor(hour: number): string {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

@Component({
  selector: "app-root",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DetailDialogComponent, TrackListComponent, DashboardHeaderComponent, CatalogComponent, DatePipe, DragScrollDirective, FavoriteButtonComponent, MusicPlayerComponent, PlaylistSliderComponent, RevealDirective, SidebarComponent, WeeklyActivityComponent],
  templateUrl: "./app.component.html"
})
export class AppComponent {
  protected readonly experience = inject(ExperienceService);
  protected readonly library = inject(LibraryService);

  protected readonly slides = SLIDES;
  protected readonly artists = ARTISTS;
  protected readonly albums = ALBUMS;
  protected readonly songs = SONGS;
  protected readonly genreTiles = GENRE_TILES;
  protected readonly books = BOOKS;
  protected readonly weeklyActivity = WEEKLY_ACTIVITY;
  protected readonly premieres = PREMIERES;
  protected readonly friends = FRIENDS;
  protected readonly trivia = TRIVIA;
  protected readonly footerLinks = PRIMARY_NAV.map((item) => ({ item, label: FOOTER_LABELS[item.section!] }));
  protected readonly year = new Date().getFullYear();
  protected readonly firstName = USER.name.split(" ")[0];
  protected readonly greeting = greetingFor(new Date().getHours());

  protected readonly continueWatching = CONTINUE_WATCHING.map((entry) => ({ ...entry, cartoon: byId.get(entry.cartoonId)! }));
  protected readonly spotlight = { ...SPOTLIGHT, cartoon: byId.get(SPOTLIGHT.cartoonId)! };

  protected readonly activeNav = signal(PRIMARY_NAV[0].label);
  protected readonly genre = signal<GenreTile["name"]>("All");
  protected readonly factIndex = signal(0);
  protected readonly subscribed = signal(false);
  protected readonly query = signal("");
  protected readonly showTop = signal(false);

  protected readonly favorites = computed(() => CARTOONS.filter((cartoon) => this.library.favorites().has(cartoon.id)));

  /** Pauses the scroll spy while a nav click scrolls the page. */
  private spyPaused = false;
  private spyTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    const zone = inject(NgZone);
    let frame = 0;
    let positions: { label: string; top: number }[] = [];
    const measure = () => {
      positions = PRIMARY_NAV.flatMap(item => {
        const element = document.getElementById(item.section!);
        return element ? [{ label: item.label, top: element.getBoundingClientRect().top + window.scrollY }] : [];
      });
    };
    const resize = new ResizeObserver(measure);
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const line = window.scrollY + window.innerHeight * 0.35;
        const label = this.spyPaused ? null : positions.filter(item => item.top <= line).at(-1)?.label;
        if (label && label !== this.activeNav()) zone.run(() => this.activeNav.set(label));
        const showTop = window.scrollY > window.innerHeight;
        if (showTop !== this.showTop()) zone.run(() => this.showTop.set(showTop));
      });
    };
    const onScrollEnd = () => (this.spyPaused = false);
    afterNextRender(() => zone.runOutsideAngular(() => {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("scrollend", onScrollEnd);
      resize.observe(document.querySelector("main")!);
      window.addEventListener("resize", measure, { passive: true });
      measure();
      onScroll(); // The browser may restore a scroll position on reload.
    }));
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScrollEnd);
      resize.disconnect();
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(frame);
      clearTimeout(this.spyTimer);
    });
  }

  protected navigate(item: NavItem): void {
    if (item.label === 'Settings') { this.experience.panel.set({ kind: 'settings' }); return; }
    if (item.label === 'Library') { this.experience.panel.set({ kind: 'library' }); return; }
    this.activeNav.set(item.label);
    const section = item.section && document.getElementById(item.section);
    if (!section) return;
    this.spyPaused = true;
    clearTimeout(this.spyTimer);
    // Fallback for browsers without the scrollend event.
    this.spyTimer = setTimeout(() => (this.spyPaused = false), 1200);
    section.scrollIntoView({ behavior: this.scrollBehavior(), block: "start" });
  }

  protected openCartoon(image: string): void {
    const cartoon = CARTOONS.find(item => item.image === image);
    if (cartoon) this.experience.panel.set({ kind: 'cartoon', cartoon });
  }

  protected resetFilters(): void {
    this.query.set("");
    this.genre.set("All");
  }

  protected search(value: string): void {
    this.query.set(value);
  }

  /** Enter in the search box jumps to the filtered results. */
  protected showResults(): void {
    this.navigate(PRIMARY_NAV.find((item) => item.section === "trending")!);
  }

  protected scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: this.scrollBehavior() });
  }

  private scrollBehavior(): ScrollBehavior {
    return this.experience.motion() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant';
  }

  protected browseGenre(genre: GenreTile["name"]): void {
    this.genre.set(genre);
    this.navigate(PRIMARY_NAV.find((item) => item.section === "trending")!);
  }

  protected genreCount(genre: GenreTile["name"]): number {
    return genre === "All" ? CARTOONS.length : CARTOONS.filter((cartoon) => cartoon.genre === genre).length;
  }

  protected isFavorite(cartoon: Cartoon): boolean {
    return this.library.favorites().has(cartoon.id);
  }

  protected compact(value: number): string {
    return compactNumber.format(value);
  }

  /** Matches the original layout: songs 8-9 hide below 1100px, song 7 below 910px, and all return on phones. */
  protected songVisibility(index: number): string {
    if (index >= 7) return "max-[1100px]:hidden max-[700px]:grid";
    if (index === 6) return "max-[910px]:hidden max-[700px]:grid";
    return "";
  }

  protected initials(name: string): string {
    return name.split(" ").map((part) => part[0]).join("").slice(0, 2);
  }

  protected nextFact(): void {
    this.factIndex.update((index) => (index + 1) % this.trivia.length);
  }

  protected subscribe(event: Event, email: HTMLInputElement): void {
    event.preventDefault();
    this.subscribed.set(true);
    email.value = "";
  }

}
