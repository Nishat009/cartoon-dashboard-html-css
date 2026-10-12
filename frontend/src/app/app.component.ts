import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DEMO_CARTOONS, poster, seedFrom } from "./demo-data";
import { Cartoon, SessionUser, WatchEntry } from "./models";
import { CountUpDirective, RevealDirective } from "./motion.directives";


type ListMode = "all" | "favorites" | "history";
type PlanId = "free" | "plus" | "family";

type SortMode = "new" | "trending" | "rated";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [FormsModule, RevealDirective, CountUpDirective],
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);

  @ViewChild("hero") private hero?: ElementRef<HTMLElement>;
  @ViewChild("header") private header?: ElementRef<HTMLElement>;

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
  demo = true;
  heroIndex = 0;
  menuOpen = false;
  authOpen = false;



  plan: PlanId = 'free';
  pendingPlan: PlanId | null = null;
  accountMessage = '';
  readonly plans: { id: PlanId; name: string; price: number; description: string; features: string[] }[] = [
    { id: 'free', name: 'Starter', price: 0, description: 'Find your next favorite world.', features: ['Browse the full demo catalog', 'Personal favorites', 'Watch history'] },
    { id: 'plus', name: 'Toonbox Plus', price: 8, description: 'A little more cartoon magic.', features: ['Everything in Starter', 'Preview premium membership', 'One explorer profile'] },
    { id: 'family', name: 'Family', price: 14, description: 'A world for every imagination.', features: ['Everything in Plus', 'Preview a family membership', 'Family plan overview'] }
  ];
  get currentPlan() { return this.plans.find(item => item.id === this.plan)!; }
  choosePlan(plan: PlanId): void {
    if (!this.user) { this.pendingPlan = plan; this.authOpen = true; return; }
    this.plan = plan; this.persist();
    this.accountMessage = 'Your demo plan is now ' + this.currentPlan.name + '. No payment was taken.';
    this.cdr.detectChanges(); this.scrollTo('account');
  }

  name = "";
  error = "";
  loading = true;
  subscribeEmail = "";
  subscribed = false;
  adminOpen = false;
  adminSaving = false;
  adminError = "";
  adminMessage = "";
  editingId: string | null = null;
  deleting: Cartoon | null = null;
  draft: Omit<Cartoon, "_id"> = this.emptyDraft();


  private emptyDraft(): Omit<Cartoon, "_id"> {
    return { title: "", description: "", genre: "", year: new Date().getFullYear(), rating: 0, image: "", episodes: 0, views: 0, featured: false };
  }

  openAdmin(): void {
    this.adminOpen = true;
    this.menuOpen = false;
    this.cdr.detectChanges();
    this.scrollTo("admin");
  }

  editCartoon(cartoon?: Cartoon): void {
    this.editingId = cartoon?._id ?? null;
    this.draft = cartoon ? { title: cartoon.title, description: cartoon.description, genre: cartoon.genre, year: cartoon.year, rating: cartoon.rating, image: cartoon.image, episodes: cartoon.episodes, views: cartoon.views, featured: cartoon.featured } : this.emptyDraft();
    this.adminError = this.adminMessage = "";
  }

  saveCartoon(): void {
    if (!this.draft.title.trim() || !this.draft.genre.trim()) return;
    const cartoon: Cartoon = { ...this.draft, _id: this.editingId ?? crypto.randomUUID() };
    this.setCatalog([...this.catalog.filter(item => item._id !== cartoon._id), cartoon]);
    this.history = this.history.map(entry => entry.cartoon._id === cartoon._id ? { ...entry, cartoon } : entry);
    this.persist(); this.editCartoon(); this.adminMessage = 'Cartoon saved in this browser.';
  }

  deleteCartoon(): void {
    if (!this.deleting) return;
    const id = this.deleting._id;
    this.favorites.delete(id); this.history = this.history.filter(entry => entry.cartoon._id !== id);
    this.setCatalog(this.catalog.filter(item => item._id !== id));
    if (this.selected?._id === id) this.selected = null;
    if (this.editingId === id) this.editCartoon();
    this.deleting = null; this.persist(); this.adminMessage = 'Cartoon deleted from this browser.';
  }

  readonly steps = [
    { title: "Pick a world", text: "Browse comedy, action, anime and family worlds. Filter by mood in a tap.", icon: "fa-earth-americas" },
    { title: "Save your favorites", text: "Heart the shows you love and we keep them ready in your list.", icon: "fa-heart" },
    { title: "Press play", text: "Jump right back in. Your watch history remembers where you were.", icon: "fa-play" }
  ];

  private heroTimer?: ReturnType<typeof setInterval>;
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
    let catalog = DEMO_CARTOONS.map(item => ({ ...item }));
    try {
      const saved = JSON.parse(localStorage.getItem('toonbox-demo') || 'null');
      if (saved && Array.isArray(saved.catalog) && Array.isArray(saved.favorites) && Array.isArray(saved.history)) {
        catalog = saved.catalog.map((item: Cartoon) => {
          const mock = DEMO_CARTOONS.find(cartoon => cartoon._id === item._id);
          return mock && (!item.image || item.image.startsWith('data:image/svg+xml')) ? { ...item, image: mock.image } : item;
        });
        this.favorites = new Set(saved.favorites);
        this.history = saved.history.map((entry: WatchEntry) => ({ ...entry, cartoon: catalog.find(item => item._id === entry.cartoon._id) ?? entry.cartoon }));
      }
    } catch { /* Storage unavailable: use mock data. */ }
    try {
      const saved = JSON.parse(localStorage.getItem('toonbox-demo') || 'null');
      if (saved?.user?.id === 'demo-user' && typeof saved.user.name === 'string') this.user = saved.user;
      if (this.plans.some(item => item.id === saved?.plan)) this.plan = saved.plan;
    } catch { /* Start without a profile when storage is unavailable. */ }
    this.setCatalog(catalog);
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      window.addEventListener("scroll", this.onScroll, { passive: true });
      this.paintScroll();
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener("scroll", this.onScroll);
    cancelAnimationFrame(this.scrollFrame);
    clearInterval(this.heroTimer);
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

  genreCount(genre: string): number {
    return genre === "All" ? this.catalog.length : this.catalog.filter((item) => item.genre === genre).length;
  }

  /** Picks which posters span two columns so the wall's last row is full at 4, 3 and 2 columns. */
  isWide(index: number, columns: number): boolean {
    const total = this.cartoons.length;
    if (index === 0 || total < 3) return false;
    const leadCells = columns === 2 ? 2 : 4;
    const extra = (columns - ((total - 1 + leadCells) % columns)) % columns;
    for (let k = 1; k <= extra; k++) {
      if (Math.round((k * total) / (extra + 1)) === index) return true;
    }
    return false;
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
    if (this.list !== list) { this.search = ""; this.genre = "All"; }
    this.list = list;
    this.loadCartoons();
  }

  setGenre(genre: string): void {
    this.genre = genre;
    this.loadCartoons();
  }

  setSort(sort: SortMode): void {
    this.sort = sort;
    this.loadCartoons();
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

  loadCartoons(): void { this.cartoons = this.applyFilters(this.localList()); this.loading = false; this.refresh(); }

  toggleFavorite(cartoon: Cartoon, event?: Event): void {
    event?.stopPropagation(); this.updateFavorite(cartoon._id, this.favorites.has(cartoon._id)); this.persist();
  }

  openCartoon(cartoon: Cartoon): void {
    this.selected = cartoon;
    this.history = [{ cartoon, watchedAt: new Date().toISOString() }, ...this.history.filter(entry => entry.cartoon._id !== cartoon._id)].slice(0, 20);
    if (this.list === 'history') this.loadCartoons();
    this.persist();
  }

  submitAuth(): void {
    this.user = { id: 'demo-user', name: this.name.trim() || 'Demo explorer', email: '', role: 'admin' };
    this.authOpen = false; this.name = '';
    const chosen = this.pendingPlan ?? this.plan; this.pendingPlan = null;
    this.choosePlan(chosen);
  }

  signOut(): void { this.user = null; this.adminOpen = false; this.deleting = null; this.persist(); }

  subscribe(): void {
    if (!/^\S+@\S+\.\S+$/.test(this.subscribeEmail.trim())) return;
    this.subscribed = true;
    this.subscribeEmail = "";
  }

  private setCatalog(cartoons: Cartoon[]): void {
    this.catalog = cartoons;
    this.genres = ["All", ...new Set(cartoons.map((item) => item.genre))];
    const byGenre = new Map<string, Cartoon>();
    for (const item of [...cartoons].sort((a, b) => Number(b.featured) - Number(a.featured))) {
      if (!byGenre.has(item.genre)) byGenre.set(item.genre, item);
    }
    this.featured = [...byGenre.values()].slice(0, 4);
    this.heroIndex = 0;
    this.cartoons = this.applyFilters(this.localList());
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
    else if (this.demo && this.list !== "history") result.sort((a, b) => b.year - a.year);
    return result;
  }

  private updateFavorite(id: string, wasFavorite: boolean): void {
    if (wasFavorite) this.favorites.delete(id);
    else { this.favorites.add(id); if (this.selected?._id === id) this.selected = null; }
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

  /** Drives the hero zoom and the solid header from the scroll position. */
  private paintScroll(): void {
    const y = window.scrollY;
    this.header?.nativeElement.classList.toggle("scrolled", y > 24);
    const hero = this.hero?.nativeElement;
    if (hero) hero.style.setProperty("--p", Math.min(y / (hero.offsetHeight * 0.8), 1).toFixed(3));
  }

  private persist(): void {
    try { localStorage.setItem('toonbox-demo', JSON.stringify({ catalog: this.catalog, favorites: [...this.favorites], history: this.history, user: this.user, plan: this.plan })); }
    catch { /* Interactions remain available for this session. */ }
  }

  private refresh(): void {
    this.cdr.markForCheck();
  }

}
