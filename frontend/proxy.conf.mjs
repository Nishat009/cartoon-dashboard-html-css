// `ng serve` forwards /api and /image to the backend, so the app itself never
// hardcodes a port. Set API_PORT (or a full API_URL) when the API is not on 3000;
// `npm run dev` at the project root does this automatically.
const target = process.env.API_URL || `http://localhost:${process.env.API_PORT || 3000}`;

export default {
  "/api": { target, changeOrigin: true },
  "/image": { target, changeOrigin: true }
};
