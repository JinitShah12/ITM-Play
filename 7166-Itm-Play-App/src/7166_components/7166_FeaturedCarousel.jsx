import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ShinyText from "./ShinyText";

export default function FeaturedCarousel({ movies, interval = 5000 }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = movies.length;
  const current = count ? index % count : 0;

  const go = useCallback(
    (next) => setIndex((next + count) % count),
    [count]
  );

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearInterval(timer);
  }, [paused, count, interval]);

  if (count === 0) return null;

  return (
    <section
      className="carousel"
      aria-roledescription="carousel"
      aria-label="Featured movies"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {movies.map((movie) => {
          const image = movie.backdropUrl || movie.posterUrl;
          return (
            <article
              className="carousel-slide"
              key={movie._id}
              style={{
                backgroundImage: image
                  ? `linear-gradient(90deg, #101014 10%, #101014cc 50%, #10101433), url("${image}")`
                  : "linear-gradient(90deg, #101014, #252530)",
              }}
            >
              <div className="carousel-content">
                <p className="eyebrow"><ShinyText text="NOW SPOTLIGHTING" speed={3} /></p>
                <h2>{movie.title}</h2>
                <div className="carousel-meta">
                  <span>{movie.releaseYear}</span>
                  <span>★ {movie.rating ?? 0}/10</span>
                  {movie.genre?.slice(0, 3).map((g) => (
                    <span className="genre-chip" key={g}>{g}</span>
                  ))}
                </div>
                <p className="carousel-description">{movie.description}</p>
                <div className="hero-actions">
                  <Link to={`/watch/${movie._id}`} className="primary-button">▶ Watch Now</Link>
                  <Link to={`/movies/${movie._id}`} className="secondary-button">Details</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button type="button" className="carousel-arrow carousel-prev" aria-label="Previous movie" onClick={() => go(current - 1)}>‹</button>
          <button type="button" className="carousel-arrow carousel-next" aria-label="Next movie" onClick={() => go(current + 1)}>›</button>
          <div className="carousel-dots">
            {movies.map((movie, i) => (
              <button
                type="button"
                key={movie._id}
                aria-label={`Show ${movie.title}`}
                className={i === current ? "is-active" : ""}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
