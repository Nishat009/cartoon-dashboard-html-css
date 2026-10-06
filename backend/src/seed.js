import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "./db.js";
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
  { title: "Tiger's Kitchen", description: "A cheerful young tiger discovers the fun of cooking.", genre: "Comedy", year: 2020, rating: 7.6, image: "/image/3d-rendering-young-tiger.jpg", episodes: 18, views: 4200 },
  // Cartoons with an empty image get a generated poster in the frontend.
  { title: "Cake Paws Bakery", description: "Two hungry animal friends run the sweetest little bakery in town.", genre: "Family", year: 2022, rating: 8.3, image: "/image/animal-eating-sweet-delicious-cake.jpg", episodes: 30, views: 5800 },
  { title: "Sweet Tooth Safari", description: "Jungle pals travel across the savanna hunting for the world's best desserts.", genre: "Adventure", year: 2023, rating: 7.9, image: "/image/animal-eating-sweet-delicious-cake (1).jpg", episodes: 22, views: 4700 },
  { title: "Dragon Doodles", description: "The dragons in a kid's sketchbook come to life every night after bedtime.", genre: "Fantasy", year: 2024, rating: 8.9, image: "", episodes: 16, views: 6900 },
  { title: "Sakura Sky Academy", description: "Students at a floating school in the clouds learn to ride the wind.", genre: "Anime", year: 2023, rating: 8.8, image: "", episodes: 24, views: 7200 },
  { title: "Robo Buddies", description: "Two tiny robots protect their neighborhood from gadget-gobbling villains.", genre: "Action", year: 2021, rating: 8.0, image: "", episodes: 36, views: 5100 },
  { title: "Moonlight Detectives", description: "A sleepy owl and a quick-witted fox solve nighttime mysteries in the forest.", genre: "Mystery", year: 2020, rating: 8.4, image: "", episodes: 28, views: 4600 },
  { title: "Galaxy Pups", description: "A crew of space puppies explores planets made of candy, ice, and music.", genre: "Adventure", year: 2022, rating: 8.2, image: "", episodes: 30, views: 5600 },
  { title: "The Lantern Keepers", description: "Young guardians protect the glowing lanterns that keep a village's dreams safe.", genre: "Fantasy", year: 2024, rating: 9.0, image: "", episodes: 12, views: 6400 },
  { title: "Penguin Patrol", description: "A clumsy team of penguins tries to keep order on a very busy iceberg.", genre: "Comedy", year: 2019, rating: 7.7, image: "", episodes: 40, views: 3900 },
  { title: "Jelly Jungle", description: "Wobbly jelly creatures turn every jungle problem into a bouncy disaster.", genre: "Comedy", year: 2018, rating: 7.4, image: "", episodes: 52, views: 3500 },
  { title: "Turbo Turtles Racing", description: "Speedy turtles take on the wildest race tracks in the world.", genre: "Action", year: 2017, rating: 7.5, image: "", episodes: 44, views: 4100 },
  { title: "Little Ocean Explorers", description: "Three young divers discover the colorful secrets of the coral reef.", genre: "Family", year: 2021, rating: 8.1, image: "", episodes: 26, views: 4900 }
];

try {
  await connectDatabase();
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
