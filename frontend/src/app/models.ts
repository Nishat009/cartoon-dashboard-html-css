export interface Slide {
  title: string;
  image: string;
}

export interface Artist {
  name: string;
  image: string;
}

export interface Album {
  title: string;
  image: string;
}

export interface Song {
  title: string;
  artist: string;
  duration: string;
  image: string;
}

export interface Track {
  title: string;
  artist: string;
  source: string;
  cover: string;
}

export interface Cartoon {
  id: string;
  title: string;
  genre: Genre;
  image: string;
  rating: number;
  views: number;
}

export type Genre = "Comedy" | "Action" | "Anime" | "Family";

export interface GenreTile {
  name: Genre | "All";
  icon: string;
}

export interface WatchProgress {
  cartoonId: string;
  episode: string;
  minutesLeft: number;
  progress: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  kind: string;
  icon: string;
  colors: [string, string];
}

export interface DayActivity {
  day: string;
  minutes: number;
}

export interface Premiere {
  id: string;
  title: string;
  detail: string;
  date: string;
}

export interface Friend {
  name: string;
  watching: string;
  when: string;
  color: string;
  live?: boolean;
}

export interface NavItem {
  label: string;
  icon: string;
  /** Id of the page section the item scrolls to. */
  section?: string;
}
