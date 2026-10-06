import mongoose from "mongoose";

const cartoonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    rating: { type: Number, min: 0, max: 10, default: 0 },
    // Empty means the frontend draws a generated poster.
    image: { type: String, trim: true, default: "" },
    episodes: { type: Number, min: 0, default: 0 },
    views: { type: Number, min: 0, default: 0 },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cartoon" }],
    watchHistory: [
      {
        cartoon: { type: mongoose.Schema.Types.ObjectId, ref: "Cartoon", required: true },
        watchedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const Cartoon = mongoose.model("Cartoon", cartoonSchema);
export const User = mongoose.model("User", userSchema);
