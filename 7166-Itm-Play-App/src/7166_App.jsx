import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "./7166_components/7166_Navbar.jsx";
import Home from "./7166_pages/7166_Home.jsx";
import Movies from "./7166_pages/7166_Movies.jsx";
import MovieDetails from "./7166_pages/7166_MovieDetails.jsx";
import Login from "./7166_pages/7166_Login.jsx";
import Register from "./7166_pages/7166_Register.jsx";
import Library from "./7166_pages/7166_Library.jsx";
import Watch from "./7166_pages/7166_Watch.jsx";
import Admin from "./7166_pages/7166_Admin";

function AdminRoute({ user, authLoading }) {
  if (authLoading) {
    return <p>Checking permissions...</p>;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Admin />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  async function refreshUser() {
    try {
      const response = await fetch("http://localhost:5000/api/7166/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();

      // Supports common API response formats.
      const currentUser =
        data.user || data.data?.user || (data._id || data.id ? data : null);

      setUser(currentUser);
    } catch (error) {
      console.error("Unable to check login status:", error);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <BrowserRouter>
      <Navbar
        user={user}
        authLoading={authLoading}
        onLogout={() => setUser(null)}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />

        <Route path="/login" element={<Login onLoginSuccess={refreshUser} />} />

        <Route
          path="/register"
          element={<Register onRegisterSuccess={refreshUser} />}
        />

        <Route path="/watch/:id" element={<Watch />} />

        <Route path="/library" element={<Library />} />

        <Route
          path="/admin"
          element={<AdminRoute user={user} authLoading={authLoading} />}
        />
      </Routes>

      <footer className="footer">
        ItmPlay · A Movie Streaming Platform All Rights Reserved.
        <br />
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </footer>
    </BrowserRouter>
  );
}
