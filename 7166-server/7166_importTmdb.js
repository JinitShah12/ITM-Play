import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Movie from "./7166_models/7166_Movie.js";

const BASE = "https://api.themoviedb.org/3";
const PAGES = 3; // 20 movies per page
const GENRE_FIX = { "Science Fiction": "Sci-Fi" }; // match the Movies page filter

if (!process.env.TMDB_TOKEN) {
  console.error("Add TMDB_TOKEN to your .env file first.");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
  accept: "application/json",
};

async function tmdb(path) {
  const res = await fetch(`${BASE}${path}`, { headers });
  if (!res.ok) throw new Error(`TMDB ${res.status} for ${path}`);
  return res.json();
}

await mongoose.connect(process.env.MONGO_URI);
let imported = 0;

for (let page = 1; page <= PAGES; page++) {
  const { results } = await tmdb(`/movie/popular?language=en-US&page=${page}`);

  for (const item of results) {
    if (!item.poster_path || !item.overview || !item.release_date) continue;

    try {
      const m = await tmdb(
        `/movie/${item.id}?language=en-US&append_to_response=videos`
      );
      const clips = m.videos?.results || [];
      const trailer =
        clips.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
        clips.find((v) => v.site === "YouTube");

      const doc = {
        title: m.title,
        description: m.overview,
        genre: (m.genres || [])
          .map((g) => GENRE_FIX[g.name] || g.name)
          .filter(Boolean),
        releaseYear: Number(m.release_date.slice(0, 4)),
        posterUrl: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
        backdropUrl: m.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}`
          : "",
        videoUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}` : "",
        rating: Math.round((m.vote_average || 0) * 10) / 10,
        featured: imported < 6, // the first 6 popular movies feed the carousel
      };

      if (doc.genre.length === 0) continue;

      await Movie.updateOne(
        { title: doc.title, releaseYear: doc.releaseYear },
        { $set: doc },
        { upsert: true }
      );
      imported++;
      console.log(`✓ ${doc.title} (${doc.releaseYear})`);
    } catch (err) {
      console.warn(`Skipped ${item.title}: ${err.message}`);
    }
  }
}

console.log(`Imported ${imported} movies from TMDB`);
await mongoose.disconnect();