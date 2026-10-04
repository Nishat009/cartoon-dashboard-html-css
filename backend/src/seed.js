import "dotenv/config";
import mongoose from "mongoose";
import { Cartoon } from "./models.js";

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in backend/.env before seeding.");

const cartoons = [
  { title: "Oggy and the Cockroaches", description: "A laid-back cat faces nonstop chaos from three mischievous cockroaches.", genre: "Comedy", year: 1998, rating: 8.2, image: "/image/oggy.jpg", episodes: 156, views: 9800, featured: true },
  { title: "Spider-Man: Animated Adventures", description: "A young hero balances everyday life with protecting his city.", genre: "Action", year: 1994, rating: 8.5, image: "/image/slide-3.jpg", episodes: 65, views: 9100, featured: true },
  { title: "Minions: Little Mischief", description: "Small yellow troublemakers set off on a series of big adventures.", genre: "Adventure", year: 2015, rating: 7.8, image: "/image/slide-4.jpg", episodes: 24, views: 7400, featured: true },
  { title: "Anime Worlds", description: "Discover imaginative animated stories from worlds near and far.", genre: "Anime", year: 2022, rating: 9.1, image: "/image/slide-1.jpg", episodes: 48, views: 8300, featured: true },
  { title: "Captain America: Hero Files", description: "A brave hero and his friends stand up for what's right.", genre: "Action", year: 2018, rating: 8.1, image: "/image/slide-2.jpg", episodes: 32, views: 6700 },
  { title: "The Curious Bunny", description: "A curious little bunny explores a colorful world with friends.", genre: "Family", year: 2023, rating: 8.7, image: "/image/cute-ai-generated-cartoon-bunny (1).jpg", episodes: 20, views: 6100 },
  { title: "Summer Tales", description: "Sunny-day adventures with a lovable cast of characters.", genre: "Family", year: 2021, rating: 7.9, image: "/image/cartoon-lifestyle-summertime-scene.jpg", episodes: 26, views: 5300 },
  { title: "Tiger's Kitchen", description: "A cheerful young tiger discovers the fun of cooking.", genre: "Comedy", year: 2020, rating: 7.6, image: "/image/3d-rendering-young-tiger.jpg", episodes: 18, views: 4200 }
];

try {
  await mongoose.connect(process.env.MONGODB_URI);
  await Cartoon.bulkWrite(cartoons.map((cartoon) => ({
    updateOne: {
      filter: { title: cartoon.title },
      update: { $set: cartoon },
      upsert: true
    }
  })));
  console.log(`Seeded ${cartoons.length} cartoons.`);
} finally {
  await mongoose.disconnect();
}
