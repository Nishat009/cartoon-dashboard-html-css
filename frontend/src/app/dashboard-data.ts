import { Album, Artist, Book, Cartoon, DayActivity, Friend, GenreTile, NavItem, Premiere, Slide, Song, Track, WatchProgress } from "./models";

const IMG = {
  anime: "images/cartoons/anime-worlds.jpg",
  captain: "images/cartoons/captain-america.jpg",
  spider: "images/cartoons/spider-man.jpg",
  minions: "images/cartoons/minions.jpg",
  oggy: "images/cartoons/oggy.jpg",
  tiger: "images/cartoons/tigers-kitchen.jpg",
  bear: "images/cartoons/summer-tales.jpg",
  bunny: "images/cartoons/curious-bunny.jpg",
  bunnyCake: "images/cartoons/cake-paws.jpg",
  bunnySnack: "images/cartoons/sweet-safari.jpg"
};

export const USER = { name: "Falaq Seherish", avatar: "images/avatar.jpg" };

export const SLIDES: Slide[] = [
  { title: "Anime", image: IMG.anime },
  { title: "Captain America", image: IMG.captain },
  { title: "Spider Man", image: IMG.spider },
  { title: "Minions", image: IMG.minions },
  { title: "Oggy", image: IMG.oggy }
];

export const ARTISTS: Artist[] = [
  { name: "Robert Crumb", image: IMG.tiger },
  { name: "Bill Watterson", image: IMG.bunnySnack },
  { name: "Gary Larson", image: IMG.bear },
  { name: "Scott Adams", image: IMG.bunny },
  { name: "Charles M. Schulz", image: IMG.oggy },
  { name: "Matt Groening", image: IMG.tiger },
  { name: "Albert Uderzo", image: IMG.bunnyCake },
  { name: "Alison Bechdel", image: IMG.bear }
];

export const ALBUMS: Album[] = [
  { title: "Oggy", image: IMG.oggy },
  { title: "Anime", image: IMG.anime },
  { title: "Mr.America", image: IMG.captain },
  { title: "Spider Man", image: IMG.spider },
  { title: "Minion", image: IMG.minions }
];

export const SONGS: Song[] = [
  { title: "Oggy", artist: "Robert Crumb", duration: "4:33", image: IMG.tiger },
  { title: "One Dance", artist: "Bill Watterson", duration: "4:03", image: IMG.bunnySnack },
  { title: "Pawn It All", artist: "Gary Larson", duration: "3:10", image: IMG.bear },
  { title: "Lose Control", artist: "Scott Adams", duration: "3:30", image: IMG.bunny },
  { title: "Be The One", artist: "Charles M. Schulz", duration: "3:24", image: IMG.oggy },
  { title: "Delicate", artist: "Matt Groening", duration: "3:54", image: IMG.oggy },
  { title: "Last Christmas", artist: "Albert Uderzo", duration: "4:39", image: IMG.tiger },
  { title: "Paradise", artist: "Alison Bechdel", duration: "4:20", image: IMG.bunnyCake },
  { title: "Easy On Me", artist: "Jim Davis", duration: "3:45", image: IMG.bear }
];

const SONG_LIST = "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list";
const COVERS = "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728";

export const TRACKS: Track[] = [
  { title: "Redemption", artist: "Besomorph & Coopex", source: `${SONG_LIST}/Besomorph-Coopex-Redemption.mp3`, cover: `${COVERS}/398875d0-9b9e-494a-8906-210aa3f777e0` },
  { title: "What's The Problem?", artist: "OSKI", source: `${SONG_LIST}/OSKI-Whats-The-Problem.mp3`, cover: `${COVERS}/810d1ddc-1168-4990-8d43-a0ffee21fb8c` },
  { title: "Control", artist: "Unknown Brain x Rival", source: `${SONG_LIST}/Unknown-BrainxRival-Control.mp3`, cover: `${COVERS}/7bd23b84-d9b0-4604-a7e3-872157a37b61` }
];

/** Used when a remote track cover cannot load. */
export const FALLBACK_COVER = IMG.anime;

export const CARTOONS: Cartoon[] = [
  { id: "oggy", title: "Oggy and the Cockroaches", genre: "Comedy", image: IMG.oggy, rating: 4.9, views: 2_400_000 },
  { id: "spider-man", title: "Spider-Man", genre: "Action", image: IMG.spider, rating: 4.8, views: 2_100_000 },
  { id: "minions", title: "Minions", genre: "Comedy", image: IMG.minions, rating: 4.7, views: 1_900_000 },
  { id: "captain-america", title: "Captain America", genre: "Action", image: IMG.captain, rating: 4.6, views: 1_500_000 },
  { id: "anime-dreams", title: "Anime Dreams", genre: "Anime", image: IMG.anime, rating: 4.8, views: 1_300_000 },
  { id: "curious-bunny", title: "The Curious Bunny", genre: "Family", image: IMG.bunny, rating: 4.7, views: 980_000 },
  { id: "tigers-kitchen", title: "Tiger's Kitchen", genre: "Comedy", image: IMG.tiger, rating: 4.5, views: 860_000 },
  { id: "summer-tales", title: "Summer Tales", genre: "Family", image: IMG.bear, rating: 4.4, views: 720_000 },
  { id: "cake-paws", title: "Cake Paws Bakery", genre: "Family", image: IMG.bunnyCake, rating: 4.6, views: 690_000 },
  { id: "snack-club", title: "Little Snack Club", genre: "Family", image: IMG.bunnySnack, rating: 4.3, views: 540_000 }
];

export const SPOTLIGHT = {
  cartoonId: "oggy",
  description: "A laid-back blue cat just wants a quiet day at home, but three mischievous cockroaches have other plans. Fast, silly and almost wordless, it is fun for every age.",
  tags: ["Comedy", "All ages", "Short episodes", "No dialogue"]
};

export const GENRE_TILES: GenreTile[] = [
  { name: "All", icon: "fa-layer-group" },
  { name: "Comedy", icon: "fa-face-laugh-beam" },
  { name: "Action", icon: "fa-bolt" },
  { name: "Anime", icon: "fa-dragon" },
  { name: "Family", icon: "fa-children" }
];

export const CONTINUE_WATCHING: WatchProgress[] = [
  { cartoonId: "oggy", episode: "S2 · E14", minutesLeft: 3, progress: 72 },
  { cartoonId: "spider-man", episode: "S1 · E05", minutesLeft: 12, progress: 45 },
  { cartoonId: "curious-bunny", episode: "S1 · E03", minutesLeft: 2, progress: 88 },
  { cartoonId: "minions", episode: "Movie", minutesLeft: 58, progress: 30 },
  { cartoonId: "anime-dreams", episode: "S1 · E09", minutesLeft: 16, progress: 55 },
  { cartoonId: "summer-tales", episode: "S3 · E01", minutesLeft: 9, progress: 20 }
];

export const BOOKS: Book[] = [
  { id: "calvin-and-hobbes", title: "Calvin and Hobbes", author: "Bill Watterson", year: 1985, kind: "Comic strip", icon: "fa-paw", colors: ["#f0abfc", "#a21caf"] },
  { id: "peanuts", title: "Peanuts", author: "Charles M. Schulz", year: 1950, kind: "Comic strip", icon: "fa-dog", colors: ["#fbcfe8", "#be185d"] },
  { id: "the-far-side", title: "The Far Side", author: "Gary Larson", year: 1980, kind: "Single panel", icon: "fa-cow", colors: ["#e9d5ff", "#7e22ce"] },
  { id: "asterix", title: "Asterix", author: "René Goscinny & Albert Uderzo", year: 1959, kind: "Comic album", icon: "fa-shield-halved", colors: ["#fecdd3", "#be123c"] },
  { id: "garfield", title: "Garfield", author: "Jim Davis", year: 1978, kind: "Comic strip", icon: "fa-cat", colors: ["#ddd6fe", "#6d28d9"] },
  { id: "life-in-hell", title: "Life in Hell", author: "Matt Groening", year: 1977, kind: "Comic strip", icon: "fa-fire-flame-curved", colors: ["#f5d0fe", "#86198f"] },
  { id: "fun-home", title: "Fun Home", author: "Alison Bechdel", year: 2006, kind: "Graphic memoir", icon: "fa-house-chimney", colors: ["#fce7f3", "#9d174d"] }
];

export const WEEKLY_ACTIVITY: DayActivity[] = [
  { day: "Mon", minutes: 45 },
  { day: "Tue", minutes: 70 },
  { day: "Wed", minutes: 38 },
  { day: "Thu", minutes: 92 },
  { day: "Fri", minutes: 64 },
  { day: "Sat", minutes: 110 },
  { day: "Sun", minutes: 83 }
];

export const PREMIERES: Premiere[] = [
  { id: "curious-bunny-s2", title: "The Curious Bunny", detail: "Season 2 premiere", date: "2026-10-17" },
  { id: "tigers-kitchen-special", title: "Tiger's Kitchen", detail: "Holiday special", date: "2026-10-24" },
  { id: "summer-tales-s4", title: "Summer Tales", detail: "Season 4 premiere", date: "2026-11-02" },
  { id: "cake-paws-movie", title: "Cake Paws Bakery", detail: "The movie", date: "2026-11-14" }
];

export const FRIENDS: Friend[] = [
  { name: "Nadia Islam", watching: "Oggy and the Cockroaches", when: "Now", color: "#a23a9d", live: true },
  { name: "Rafi Ahmed", watching: "Spider-Man", when: "12 min ago", color: "#7b1595" },
  { name: "Sara Khan", watching: "The Curious Bunny", when: "1 h ago", color: "#a8506d" },
  { name: "Leo Martin", watching: "Anime Dreams", when: "3 h ago", color: "#6d28d9" }
];

export const TRIVIA: string[] = [
  "Charles M. Schulz wrote and drew every Peanuts strip himself, from 1950 until 2000.",
  "Bill Watterson ended Calvin and Hobbes on December 31, 1995, after ten years.",
  "Garfield holds the Guinness World Record for the most syndicated comic strip.",
  "Oggy and the Cockroaches is a French animated series that first aired in 1998.",
  "The Minions made their first appearance in Despicable Me (2010).",
  "Spider-Man first swung into comics in Amazing Fantasy #15 in 1962.",
  "Matt Groening named most of the Simpson family after his own relatives."
];

export const PRIMARY_NAV: NavItem[] = [
  { label: "New", icon: "fa-map", section: "playlist" },
  { label: "Trending", icon: "fa-arrow-trend-up", section: "trending" },
  { label: "Book", icon: "fa-compact-disc", section: "books" },
  { label: "Cartoon", icon: "fa-circle-play", section: "cartoons" },
  { label: "Favorites", icon: "fa-heart", section: "favorites" }
];

export const SECONDARY_NAV: NavItem[] = [
  { label: "Account", icon: "fa-user", section: "activity" },
  { label: "Settings", icon: "fa-gear" },
  { label: "Logout", icon: "fa-right-from-bracket" }
];
