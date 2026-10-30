import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function Watch() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMovie() {
      setLoading(true);
      setError("");
      setMovie(null);
      setVideoError(false);

      try {
        const response = await fetch(
          `http://localhost:5000/api/7166/movies/${id}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load movie.");
        }

        const result = data.movie || data.data?.movie || data;

        if (!result?._id && !result?.id) {
          throw new Error("Movie not found.");
        }

        setMovie(result);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to connect to server.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadMovie();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <main className="watch-shell">
        <p className="watch-message">Loading your movie...</p>
      </main>
    );
  }

  if (error || !movie) {
    return (
      <main className="watch-shell">
        <div className="watch-error">
          <h1>Movie unavailable</h1>
          <p>{error || "Movie not found."}</p>
          <Link to="/movies" className="watch-button">
            Browse movies
          </Link>
        </div>
      </main>
    );
  }

  // YouTube trailers (from TMDB) must be shown in an iframe, not a <video> tag
  const isEmbed = /youtube(-nocookie)?\.com\/embed/.test(movie.videoUrl || "");

  return (
    <main className="watch-shell">
      <Link
        to={`/movies/${movie._id || movie.id}`}
        className="watch-back"
      >
        <span aria-hidden="true">←</span> Back to movie details
      </Link>

      <header className="watch-heading">
        <p className="watch-eyebrow">NOW PLAYING</p>
        <h1>{movie.title}</h1>

        <div className="watch-meta">
          {movie.releaseYear && <span>{movie.releaseYear}</span>}
          {movie.rating > 0 && (
            <span className="watch-rating">★ {movie.rating}/10</span>
          )}
          {Array.isArray(movie.genre) &&
            movie.genre.map((genre) => (
              <span className="watch-genre" key={genre}>
                {genre}
              </span>
            ))}
        </div>
      </header>

      <section className="watch-player">
        {movie.videoUrl && isEmbed ? (
          <iframe
            className="watch-video"
            src={movie.videoUrl}
            title={`${movie.title} trailer`}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : movie.videoUrl && !videoError ? (
          <video
            key={movie.videoUrl}
            className="watch-video"
            controls
            playsInline
            preload="metadata"
            poster={movie.backdropUrl || movie.posterUrl || undefined}
            onError={() => setVideoError(true)}
          >
            <source src={movie.videoUrl} type="video/mp4" />
            Your browser does not support video playback.
          </video>
        ) : (
          <div className="watch-unavailable">
            <div className="watch-play-icon">▶</div>
            <h2>
              {videoError ? "Video unavailable" : "Preview coming soon"}
            </h2>
            <p>
              {videoError
                ? "This video could not be played. Please check its URL."
                : "A sample video has not been added for this movie yet."}
            </p>
          </div>
        )}
      </section>

      <section className="watch-description">
        <div>
          <p className="watch-eyebrow">THE STORY</p>
          <h2>About this movie</h2>
          <p className="watch-summary">{movie.description}</p>
        </div>

        <Link to="/movies" className="watch-button">
          Explore more movies <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
