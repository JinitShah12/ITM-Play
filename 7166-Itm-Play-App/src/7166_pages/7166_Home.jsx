import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import MovieCard from "../7166_components/7166_MovieCard.jsx";
import BlurText from "../7166_components/BlurText.jsx";
import ShinyText from "../7166_components/ShinyText.jsx";
import CountUp from "../7166_components/CountUp.jsx";
import FadeContent from "../7166_components/FadeContent.jsx";
import FeaturedCarousel from "../7166_components/7166_FeaturedCarousel.jsx";

const heroImages = [
  "https://image.tmdb.org/t/p/w1280/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  "https://image.tmdb.org/t/p/w1280/8Y43POKjjKDGI9MH89NW0NAzzp8.jpg",
  "https://image.tmdb.org/t/p/w1280/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg",
  "https://image.tmdb.org/t/p/w1280/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg",
];

function Rail({ eyebrow, title, movies }) {
  const railRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [movies, updateEdges]);

  function scrollRail(direction) {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  }

  if (movies.length === 0) return null;

  return (
    <FadeContent blur duration={700}>
      <section className="movie-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <Link to="/movies" className="subtle-link">View all →</Link>
        </div>

        <div className="rail-wrap">
          <button
            type="button"
            className="rail-arrow rail-prev"
            aria-label={`Scroll ${title} left`}
            onClick={() => scrollRail(-1)}
            disabled={atStart}
          >
            ‹
          </button>

          <div className="rail" ref={railRef} onScroll={updateEdges}>
            {movies.map((movie) => (
              <div className="rail-item" key={movie._id}>
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>

          <button
            type="button"
            className="rail-arrow rail-next"
            aria-label={`Scroll ${title} right`}
            onClick={() => scrollRail(1)}
            disabled={atEnd}
          >
            ›
          </button>
        </div>
      </section>
    </FadeContent>
  );
}

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setHeroIndex((i) => (i + 1) % heroImages.length),
      4000
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMovies() {
      try {
        const response = await fetch("http://localhost:5000/api/7166/movies", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Could not load movies.");
        const data = await response.json();
        setMovies(data.movies || []);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchMovies();
    return () => controller.abort();
  }, []);

  const featured = useMemo(() => movies.filter((m) => m.featured), [movies]);
  const latest = useMemo(() => movies.slice(0, 12), [movies]); // API sorts newest first
  const topRated = useMemo(
    () => [...movies].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 12),
    [movies]
  );
  const spotlight = useMemo(
    () => (featured.length ? featured : topRated).slice(0, 6),
    [featured, topRated]
  );
  const genreCount = useMemo(
    () => new Set(movies.flatMap((m) => m.genre || [])).size,
    [movies]
  );

  return (
    <main>
      <section
        className="hero"
        style={{
          backgroundImage: `
            linear-gradient(90deg, #101014 8%, #101014e8 48%, #10101433),
            linear-gradient(0deg, #101014, transparent 50%),
            url("${heroImages[heroIndex]}")
          `,
          backgroundPosition: "center, center, center 35%",
          backgroundSize: "cover, cover, cover",
          transition: "background-image 0.5s ease-in-out",
        }}
      >
        <div className="hero-content">
          <p className="eyebrow">
            <ShinyText text="YOUR NEXT MOVIE NIGHT" speed={3} />
          </p>

          <div role="heading" aria-level="1">
            <BlurText
              text="Stories worth staying up for."
              delay={120}
              animateBy="words"
              direction="top"
              className="hero-title"
            />
          </div>

          <p className="hero-description">
            Discover unforgettable movies, explore new worlds,
            and find your next favourite film.
          </p>

          <div className="hero-actions">
            <Link to="/movies" className="primary-button">Explore Movies →</Link>
            <Link to="/library" className="secondary-button">My Library</Link>
          </div>

          {!loading && !error && (
            <div className="stats-strip">
              <div><strong><CountUp to={movies.length} duration={1.5} /></strong><span>Movies</span></div>
              <div><strong><CountUp to={genreCount} duration={1.5} /></strong><span>Genres</span></div>
              <div><strong><CountUp to={featured.length} duration={1.5} /></strong><span>Featured</span></div>
            </div>
          )}
        </div>
      </section>

      {!loading && !error && <FeaturedCarousel movies={spotlight} />}

      {loading && <p className="status-message">Loading movies...</p>}
      {error && <p className="status-message error-message">Unable to load movies: {error}</p>}

      {!loading && !error && movies.length === 0 && (
        <p className="status-message">
          No movies yet. Add some in the Admin Dashboard.
        </p>
      )}

      {!loading && !error && (
        <>
          <Rail eyebrow="HANDPICKED FOR YOU" title="Featured Movies" movies={featured} />
          <Rail eyebrow="JUST ADDED" title="Latest Additions" movies={latest} />
          <Rail eyebrow="CRITICS' CHOICE" title="Top Rated" movies={topRated} />
        </>
      )}
    </main>
  );
}
