import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DEMO_CARTOONS, poster, seedFrom } from "./demo-data";
import { AuthResponse, Cartoon, SessionUser, WatchEntry } from "./models";
import { CountUpDirective, RevealDirective } from "./motion.directives";

// Relative, so the app works on any port: `ng serve` proxies it (proxy.conf.mjs)
// and the API serves the production build itself.
const API = "/api";

type ListMode = "all" | "favorites" | "history";
type SortMode = "new" | "trending" | "rated";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [FormsModule, RevealDirective, CountUpDirective],
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);

  @ViewChild("hero") private hero?: ElementRef<HTMLElement>;
  @ViewChild("header") private header?: ElementRef<HTMLElement>;
  @ViewChild("picksTrack") private picksTrack?: ElementRef<HTMLElement>;

  catalog: Cartoon[] = [];
  cartoons: Cartoon[] = [];
  featured: Cartoon[] = [];
  genres: string[] = ["All"];
  favorites = new Set<string>();
  history: WatchEntry[] = [];
  user: SessionUser | null = null;
  selected: Cartoon | null = null;
  search = "";
  genre = "All";
  list: ListMode = "all";
  sort: SortMode = "new";
  demo = false;
  heroIndex = 0;
  menuOpen = false;
  authOpen = false;
  registering = false;
  email = "";
  password = "";
  name = "";
  error = "";
  loading = true;
  subscribeEmail = "";
  subscribed = false;

  readonly steps = [
    { title: "Pick a world", text: "Browse comedy, action, anime and family worlds. Filter by mood in a tap." },
    { title: "Save your favorites", text: "Heart the shows you love and we keep them ready in your list." },
    { title: "Press play", text: "Jump right back in. Your watch history remembers where you were." }
  ];

  private heroTimer?: ReturnType<typeof setInterval>;
  private picksTimer?: ReturnType<typeof setInterval>;
  private scrollFrame = 0;
  private readonly onScroll = () => {
    cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = requestAnimationFrame(() => this.paintScroll());
  };

  get current(): Cartoon | null {
    return this.featured[this.heroIndex] ?? null;
  }

  get picks(): Cartoon[] {
    return [...this.catalog].sort((a, b) => b.rating - a.rating).slice(0, 6);
  }

  get totalViews(): number {
    return this.catalog.reduce((sum, item) => sum + item.views, 0);
  }

  get totalEpisodes(): number {
    return this.catalog.reduce((sum, item) => sum + item.episodes, 0);
  }

  ngOnInit(): void {
    this.loadCatalog();
    const token = localStorage.getItem("cartoon-token");
    if (token) {
      this.http.get<SessionUser>(`${API}/auth/me`).subscribe({
        next: (user) => { this.user = user; this.loadUserData(); },
        error: () => { localStorage.removeItem("cartoon-token"); this.refresh(); }
      });
    }
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      window.addEventListener("scroll", this.onScroll, { passive: true });
      this.paintScroll();
      this.picksTimer = setInterval(() => this.autoScrollPicks(), 4500);
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener("scroll", this.onScroll);
    cancelAnimationFrame(this.scrollFrame);
    clearInterval(this.heroTimer);
    clearInterval(this.picksTimer);
  }

  imageUrl(cartoon: Cartoon): string {
    return cartoon.image || poster(seedFrom(cartoon.title));
  }

  /** Falls back to a generated poster when an image cannot load. */
  imageFallback(event: Event, cartoon: Cartoon): void {
    const img = event.target as HTMLImageElement;
    const fallback = poster(seedFrom(cartoon.title));
    if (img.src !== fallback) img.src = fallback;
  }

  fanScore(cartoon: Cartoon): number {
    return Math.round(cartoon.rating * 10);
  }

  selectHero(index: number): void {
    this.heroIndex = index;
    this.startHeroTimer();
  }

  setList(list: ListMode): void {
    if (list !== "all" && !this.user && !this.demo) {
      this.authOpen = true;
      return;
    }
    this.list = list;
    this.loadCartoons();
  }

  setGenre(genre: string): void {
    this.genre = genre;
    this.loadCartoons();
  }

  toggleTrending(): void {
    this.sort = this.sort === "trending" ? "new" : "trending";
    this.loadCartoons();
  }

  findNow(): void {
    this.loadCartoons();
    this.scrollTo("collection");
  }

  resetFilters(): void {
    this.search = "";
    this.genre = "All";
    this.list = "all";
    this.sort = "new";
    this.loadCartoons();
  }

  scrollTo(id: string): void {
    this.menuOpen = false;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  scrollPicks(direction: number): void {
    const track = this.picksTrack?.nativeElement;
    const card = track?.querySelector<HTMLElement>(".pick");
    if (!track || !card) return;
    track.scrollBy({ left: direction * (card.offsetWidth + 20), behavior: "smooth" });
  }

  loadCartoons(): void {
    if (this.demo) {
      this.cartoons = this.applyFilters(this.localList());
      this.refresh();
      return;
    }
    if (this.list === "favorites") {
      this.fetchList<Cartoon[]>(`${API}/favorites`, (items) => items);
    } else if (this.list === "history") {
      this.fetchList<WatchEntry[]>(`${API}/watch-history`, (items) => { this.history = items; return items.map((entry) => entry.cartoon); });
    } else {
      let params = new HttpParams();
      if (this.search.trim()) params = params.set("q", this.search.trim());
      if (this.genre !== "All") params = params.set("genre", this.genre);
      if (this.sort === "trending") params = params.set("sort", "trending");
      this.loading = true;
      this.http.get<Cartoon[]>(`${API}/cartoons`, { params }).subscribe({
        next: (cartoons) => { this.cartoons = this.applyFilters(cartoons); this.loading = false; this.refresh(); },
        error: (error: HttpErrorResponse) => { this.error = this.errorMessage(error); this.loading = false; this.refresh(); }
      });
    }
  }

  toggleFavorite(cartoon: Cartoon, event?: Event): void {
    event?.stopPropagation();
    const isFavorite = this.favorites.has(cartoon._id);
    if (this.demo) {
      this.updateFavorite(cartoon._id, isFavorite);
      return;
    }
    if (!this.user) { this.authOpen = true; return; }
    const request = isFavorite
      ? this.http.delete<void>(`${API}/favorites/${cartoon._id}`)
      : this.http.put<void>(`${API}/favorites/${cartoon._id}`, {});
    request.subscribe({
      next: () => this.updateFavorite(cartoon._id, isFavorite),
      error: (error: HttpErrorResponse) => { this.error = this.errorMessage(error); this.refresh(); }
    });
  }

  openCartoon(cartoon: Cartoon): void {
    this.selected = cartoon;
    if (this.demo) {
      this.history = [{ cartoon, watchedAt: new Date().toISOString() }, ...this.history.filter((entry) => entry.cartoon._id !== cartoon._id)];
      return;
    }
    if (!this.user) return;
    this.http.put<void>(`${API}/watch-history/${cartoon._id}`, {}).subscribe({
      next: () => this.loadUserData(),
      error: (error: HttpErrorResponse) => { this.error = this.errorMessage(error); this.refresh(); }
    });
  }

  submitAuth(): void {
    this.error = "";
    const endpoint = this.registering ? "register" : "login";
    const payload = this.registering
      ? { name: this.name, email: this.email, password: this.password }
      : { email: this.email, password: this.password };
    this.http.post<AuthResponse>(`${API}/auth/${endpoint}`, payload).subscribe({
      next: (response) => {
        localStorage.setItem("cartoon-token", response.token);
        this.user = response.user;
        this.authOpen = false;
        this.name = this.email = this.password = "";
        this.loadUserData();
        this.refresh();
      },
      error: (error: HttpErrorResponse) => { this.error = this.errorMessage(error); this.refresh(); }
    });
  }

  signOut(): void {
    localStorage.removeItem("cartoon-token");
    this.user = null;
    this.favorites.clear();
    this.history = [];
    if (this.list !== "all") this.setList("all");
  }

  subscribe(): void {
    if (!/^\S+@\S+\.\S+$/.test(this.subscribeEmail.trim())) return;
    this.subscribed = true;
    this.subscribeEmail = "";
  }

  private loadCatalog(): void {
    this.loading = true;
    this.http.get<Cartoon[]>(`${API}/cartoons`).subscribe({
      next: (cartoons) => {
        if (!cartoons.length) { this.useDemo(); return; }
        this.setCatalog(cartoons);
        this.http.get<string[]>(`${API}/genres`).subscribe({
          next: (genres) => { if (genres.length) this.genres = ["All", ...genres]; this.refresh(); },
          error: () => this.refresh()
        });
      },
      error: () => this.useDemo()
    });
  }

  /** Backend is offline or empty, so the page runs on generated demo cartoons. */
  private useDemo(): void {
    this.demo = true;
    this.setCatalog(DEMO_CARTOONS);
  }

  private setCatalog(cartoons: Cartoon[]): void {
    this.catalog = cartoons;
    this.genres = ["All", ...new Set(cartoons.map((item) => item.genre))];
    const byGenre = new Map<string, Cartoon>();
    for (const item of [...cartoons].sort((a, b) => Number(b.featured) - Number(a.featured))) {
      if (!byGenre.has(item.genre)) byGenre.set(item.genre, item);
    }
    this.featured = [...byGenre.values()].slice(0, 4);
    this.cartoons = this.applyFilters(cartoons);
    this.loading = false;
    this.startHeroTimer();
    this.refresh();
  }

  private localList(): Cartoon[] {
    if (this.list === "favorites") return this.catalog.filter((item) => this.favorites.has(item._id));
    if (this.list === "history") return this.history.map((entry) => entry.cartoon);
    return this.catalog;
  }

  private applyFilters(items: Cartoon[]): Cartoon[] {
    const query = this.search.trim().toLowerCase();
    const result = items.filter((item) =>
      (this.genre === "All" || item.genre === this.genre) &&
      (!query || `${item.title} ${item.description}`.toLowerCase().includes(query)));
    if (this.sort === "trending") result.sort((a, b) => b.views - a.views);
    else if (this.sort === "rated") result.sort((a, b) => b.rating - a.rating);
    else if (this.demo) result.sort((a, b) => b.year - a.year);
    return result;
  }

  private fetchList<T>(url: string, map: (items: T) => Cartoon[]): void {
    this.loading = true;
    this.http.get<T>(url).subscribe({
      next: (items) => { this.cartoons = this.applyFilters(map(items)); this.loading = false; this.refresh(); },
      error: (error: HttpErrorResponse) => { this.error = this.errorMessage(error); this.loading = false; this.refresh(); }
    });
  }

  private updateFavorite(id: string, wasFavorite: boolean): void {
    if (wasFavorite) this.favorites.delete(id);
    else this.favorites.add(id);
    this.favorites = new Set(this.favorites);
    if (this.list === "favorites") this.loadCartoons();
    this.refresh();
  }

  private startHeroTimer(): void {
    clearInterval(this.heroTimer);
    if (this.featured.length < 2) return;
    this.heroTimer = setInterval(() => {
      this.heroIndex = (this.heroIndex + 1) % this.featured.length;
      this.refresh();
    }, 6000);
  }

  private autoScrollPicks(): void {
    const track = this.picksTrack?.nativeElement;
    if (!track || track.matches(":hover")) return;
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 8) track.scrollTo({ left: 0, behavior: "smooth" });
    else this.scrollPicks(1);
  }

  /** Drives the hero zoom and the solid header from the scroll position. */
  private paintScroll(): void {
    const y = window.scrollY;
    this.header?.nativeElement.classList.toggle("scrolled", y > 24);
    const hero = this.hero?.nativeElement;
    if (hero) hero.style.setProperty("--p", Math.min(y / (hero.offsetHeight * 0.8), 1).toFixed(3));
  }

  private loadUserData(): void {
    this.http.get<Cartoon[]>(`${API}/favorites`).subscribe({
      next: (items) => { this.favorites = new Set(items.map((item) => item._id)); this.refresh(); },
      error: (error: HttpErrorResponse) => { this.error = this.errorMessage(error); this.refresh(); }
    });
    this.http.get<WatchEntry[]>(`${API}/watch-history`).subscribe({
      next: (items) => { this.history = items; this.refresh(); },
      error: (error: HttpErrorResponse) => { this.error = this.errorMessage(error); this.refresh(); }
    });
  }

  private refresh(): void {
    this.cdr.markForCheck();
  }

  private errorMessage(error: HttpErrorResponse): string {
    return error.error?.error || "Could not connect to the API. Check that the backend and database are running.";
  }
}
