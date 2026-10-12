export interface Cartoon {
  _id: string;
  title: string;
  description: string;
  genre: string;
  year: number;
  rating: number;
  image: string;
  episodes: number;
  views: number;
  featured: boolean;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface WatchEntry {
  cartoon: Cartoon;
  watchedAt: string;
}
