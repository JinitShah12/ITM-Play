import { Link } from "react-router-dom";
import SpotlightCard from "../7166_components/SpotlightCard";

export default function MovieCard({ movie }) {
  return (
    <SpotlightCard
      className="movie-card-spot"
      spotlightColor="rgba(193, 39, 45, 0.28)"
    >
      <Link to={`/movies/${movie._id}`} className="movie-card">
        <div className="poster-wrap">
          <img
            src={movie.posterUrl || "/movie-placeholder.png"}
            alt={movie.title}
            loading="lazy"
          />
          <span className="rating-badge">★ {movie.rating ?? 0}</span>
          <span className="poster-play" aria-hidden="true">▶</span>
        </div>

        <div className="movie-info">
          <h3>{movie.title}</h3>
          <p>
            {movie.releaseYear} · {movie.genre?.join(", ")}
          </p>
        </div>
      </Link>
    </SpotlightCard>
  );
}
