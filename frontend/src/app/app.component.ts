import { DatePipe } from "@angular/common";
import { Component, DestroyRef, NgZone, afterNextRender, computed, inject, signal } from "@angular/core";
import {
  ALBUMS, ARTISTS, BOOKS, CARTOONS, CONTINUE_WATCHING, FRIENDS, GENRE_TILES, PREMIERES, PRIMARY_NAV,
  SLIDES, SONGS, SPOTLIGHT, TRIVIA, WEEKLY_ACTIVITY
} from "./dashboard-data";
import { DragScrollDirective } from "./drag-scroll.directive";
import { FavoriteButtonComponent } from "./favorite-button.component";
import { LibraryService } from "./library.service";
import { Cartoon, GenreTile, NavItem } from "./models";
import { MusicPlayerComponent } from "./music-player.component";
import { PlaylistSliderComponent } from "./playlist-slider.component";
import { SidebarComponent } from "./sidebar.component";
import { WeeklyActivityComponent } from "./weekly-activity.component";

const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const FOOTER_LABELS: Record<string, string> = { playlist: "Playlist", trending: "Trending", books: "Comic books", cartoons: "Cartoons", favorites: "Favorites" };
const byId = new Map(CARTOONS.map((cartoon) => [cartoon.id, cartoon]));

@Component({
  selector: "app-root",
  imports: [DatePipe, DragScrollDirective, FavoriteButtonComponent, MusicPlayerComponent, PlaylistSliderComponent, SidebarComponent, WeeklyActivityComponent],
  templateUrl: "./app.component.html"
})
export class AppComponent {
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

  protected readonly continueWatching = CONTINUE_WATCHING.map((entry) => ({ ...entry, cartoon: byId.get(entry.cartoonId)! }));
  protected readonly spotlight = { ...SPOTLIGHT, cartoon: byId.get(SPOTLIGHT.cartoonId)! };

  protected readonly activeNav = signal(PRIMARY_NAV[0].label);
  protected readonly genre = signal<GenreTile["name"]>("All");
  protected readonly factIndex = signal(0);
  protected readonly subscribed = signal(false);

  protected readonly trending = computed(() => CARTOONS
    .filter((cartoon) => this.genre() === "All" || cartoon.genre === this.genre())
    .sort((a, b) => b.views - a.views)
    .slice(0, 6));
  protected readonly favorites = computed(() => CARTOONS.filter((cartoon) => this.library.favorites().has(cartoon.id)));

  /** Pauses the scroll spy while a nav click scrolls the page. */
  private spyPaused = false;
  private spyTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    const zone = inject(NgZone);
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const label = this.sectionInView();
        if (label && label !== this.activeNav()) zone.run(() => this.activeNav.set(label));
      });
    };
    const onScrollEnd = () => (this.spyPaused = false);
    afterNextRender(() => zone.runOutsideAngular(() => {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("scrollend", onScrollEnd);
      onScroll(); // The browser may restore a scroll position on reload.
    }));
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScrollEnd);
      cancelAnimationFrame(frame);
      clearTimeout(this.spyTimer);
    });
  }

  protected navigate(item: NavItem): void {
    this.activeNav.set(item.label);
    const section = item.section && document.getElementById(item.section);
    if (!section) return;
    this.spyPaused = true;
    clearTimeout(this.spyTimer);
    // Fallback for browsers without the scrollend event.
    this.spyTimer = setTimeout(() => (this.spyPaused = false), 1200);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
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

  /** The nav item of the last section whose top has passed 35% of the viewport. */
  private sectionInView(): string | null {
    if (this.spyPaused) return null;
    const line = window.innerHeight * 0.35;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    let best: { label: string; top: number } | null = null;
    for (const item of PRIMARY_NAV) {
      const top = document.getElementById(item.section!)?.getBoundingClientRect().top;
      if (top === undefined || top > (atBottom ? window.innerHeight : line)) continue;
      if (!best || top > best.top) best = { label: item.label, top };
    }
    return best?.label ?? null;
  }
}
