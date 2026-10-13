import { Injectable, WritableSignal, signal } from "@angular/core";

const STORAGE_KEY = "cartoon-lifestyle";

interface SavedLibrary {
  favorites: string[];
  books: string[];
  reminders: string[];
}

/** Favorites, the reading list and premiere reminders, kept in this browser. */
@Injectable({ providedIn: "root" })
export class LibraryService {
  readonly favorites = signal<ReadonlySet<string>>(new Set(["oggy", "minions", "curious-bunny"]));
  readonly books = signal<ReadonlySet<string>>(new Set(["calvin-and-hobbes"]));
  readonly reminders = signal<ReadonlySet<string>>(new Set());

  constructor() {
    try {
      const saved: Partial<SavedLibrary> | null = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (Array.isArray(saved?.favorites)) this.favorites.set(new Set(saved.favorites));
      if (Array.isArray(saved?.books)) this.books.set(new Set(saved.books));
      if (Array.isArray(saved?.reminders)) this.reminders.set(new Set(saved.reminders));
    } catch { /* Storage unavailable: start with the defaults. */ }
  }

  toggleFavorite(id: string): void {
    this.toggle(this.favorites, id);
  }

  toggleBook(id: string): void {
    this.toggle(this.books, id);
  }

  toggleReminder(id: string): void {
    this.toggle(this.reminders, id);
  }

  private toggle(list: WritableSignal<ReadonlySet<string>>, id: string): void {
    list.update((items) => {
      const next = new Set(items);
      if (!next.delete(id)) next.add(id);
      return next;
    });
    this.save();
  }

  private save(): void {
    const library: SavedLibrary = { favorites: [...this.favorites()], books: [...this.books()], reminders: [...this.reminders()] };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(library)); }
    catch { /* Changes last for this session only. */ }
  }
}
