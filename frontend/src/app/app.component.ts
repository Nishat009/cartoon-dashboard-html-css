import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { ChangeDetectorRef, Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AuthResponse, Cartoon, SessionUser, WatchEntry } from "./models";

const API = "http://localhost:3000/api";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  cartoons: Cartoon[] = [];
  genres: string[] = ["All"];
  favorites = new Set<string>();
  history: WatchEntry[] = [];
  user: SessionUser | null = null;
  selected: Cartoon | null = null;
  search = "";
  genre = "All";
  view = "New";
  authOpen = false;
  registering = false;
  email = "";
  password = "";
  name = "";
  error = "";
  loading = true;

  imageUrl(image: string): string {
    return `${API.replace(/\/api$/, "")}${image}`;
  }

  ngOnInit(): void {
    this.http.get<string[]>(`${API}/genres`).subscribe({
      next: (genres) => { this.genres = ["All", ...genres]; this.refresh(); },
      error: (error: HttpErrorResponse) => { this.error = this.errorMessage(error); this.refresh(); }
    });
    this.loadCartoons();
    const token = localStorage.getItem("cartoon-token");
    if (token) {
      this.http.get<SessionUser>(`${API}/auth/me`).subscribe({
        next: (user) => { this.user = user; this.loadUserData(); },
        error: () => { localStorage.removeItem("cartoon-token"); this.refresh(); }
      });
    }
  }

  loadCartoons(): void {
    let params = new HttpParams();
    if (this.search.trim()) params = params.set("q", this.search.trim());
    if (this.genre !== "All") params = params.set("genre", this.genre);
    if (this.view === "Trending") params = params.set("sort", "trending");
    this.loading = true;
    this.http.get<Cartoon[]>(`${API}/cartoons`, { params }).subscribe({
      next: (cartoons) => {
        this.cartoons = cartoons;
        this.loading = false;
        this.refresh();
      },
      error: (error: HttpErrorResponse) => { this.error = this.errorMessage(error); this.loading = false; this.refresh(); }
    });
  }

  selectView(view: string): void {
    if ((view === "Favorites" || view === "History") && !this.user) {
      this.authOpen = true;
      return;
    }
    this.view = view;
    if (view === "Favorites") {
      this.http.get<Cartoon[]>(`${API}/favorites`).subscribe({
        next: (cartoons) => { this.cartoons = cartoons; this.refresh(); },
        error: (error: HttpErrorResponse) => { this.error = this.errorMessage(error); this.refresh(); }
      });
    } else if (view === "History") {
      this.http.get<WatchEntry[]>(`${API}/watch-history`).subscribe({
        next: (history) => { this.history = history; this.cartoons = history.map((entry) => entry.cartoon); this.refresh(); },
        error: (error: HttpErrorResponse) => { this.error = this.errorMessage(error); this.refresh(); }
      });
    } else {
      this.loadCartoons();
    }
  }

  toggleFavorite(cartoon: Cartoon, event?: Event): void {
    event?.stopPropagation();
    if (!this.user) { this.authOpen = true; return; }
    const isFavorite = this.favorites.has(cartoon._id);
    const request = isFavorite
      ? this.http.delete<void>(`${API}/favorites/${cartoon._id}`)
      : this.http.put<void>(`${API}/favorites/${cartoon._id}`, {});
    request.subscribe({
      next: () => {
        if (isFavorite) this.favorites.delete(cartoon._id);
        else this.favorites.add(cartoon._id);
        this.favorites = new Set(this.favorites);
        if (this.view === "Favorites") this.selectView("Favorites");
        this.refresh();
      },
      error: (error: HttpErrorResponse) => { this.error = this.errorMessage(error); this.refresh(); }
    });
  }

  openCartoon(cartoon: Cartoon): void {
    this.selected = cartoon;
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
