import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useLocalStorage } from "./useLocalStorage";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const key = "1c69b636";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [watched, setWatched] = useLocalStorage([], "watched");

  function handelRemove(id) {
    setWatched(watched.filter((movie) => movie.imdbID !== id));
  }
  function handelSelectMovie(id) {
    setSelectedId(id === selectedId ? null : id);
  }
  function handelCloseMovie() {
    setSelectedId(null);
  }

  function handelAddWatchedMovie(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        setIsLoaded(true);
        setError("");
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${key}&s=${query}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          throw new Error("error fetching data");
        }
        const data = await res.json();
        if (data.Response === "False") {
          throw new Error(data.Error);
        }
        setMovies(data.Search);

        setIsLoaded(true);
        setIsLoaded(false);
        setError("");
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        setIsLoaded(false);
      }
    }
    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }
    handelCloseMovie();
    fetchData();
    return () => {
      controller.abort();
    };
  }, [query]);

  return (
    <>
      <NavBar query={query} setQuery={setQuery}>
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoaded && <Loader />}
          {!isLoaded && !error && (
            <MovieList movies={movies} handelSelectMovie={handelSelectMovie} />
          )}
          {error && <ErrorM error={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              handelCloseMovie={handelCloseMovie}
              handelAddWatchedMovie={handelAddWatchedMovie}
              watched={watched}
            />
          ) : (
            <WatchedList
              setSelectedId={setSelectedId}
              watched={watched}
              handelSelectMovie={handelSelectMovie}
              handelRemove={handelRemove}
            />
          )}
        </Box>
      </Main>
    </>
  );
}
function NavBar({ children, query, setQuery }) {
  const inputEl = useRef(null);
  useKey("Enter", function callBack(e) {
    if (document.activeElement === inputEl.current) {
      return;
    }
    inputEl.current.focus();
    setQuery("");
  });
  return (
    <nav className="nav-bar">
      <div
        className="logo"
        onClick={() => {
          window.location.reload();
        }}
      >
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
      </div>
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputEl}
      />
      <p className="num-results">{children}</p>
    </nav>
  );
}
function ErrorM({ error }) {
  return (
    <div className="error">
      <span>❌</span>
      {error}
    </div>
  );
}
function Loader() {
  return <div className="loader">loading...</div>;
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function MovieList({ movies, handelSelectMovie }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <li key={movie.imdbID} onClick={() => handelSelectMovie(movie.imdbID)}>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>🗓</span>
              <span>{movie.Year}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function MovieDetails({
  selectedId,
  handelCloseMovie,
  handelAddWatchedMovie,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [userRating, setUserRating] = useState("");
  const {
    Title: title,
    Poster: poster,
    Year: year,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRAting = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;
  useKey("Escape", handelCloseMovie);
  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;
    return () => {
      document.title = "usePopcorn";
    };
  }, [title]);
  useEffect(() => {
    async function fetchData() {
      setIsLoaded(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${key}&i=${selectedId}`
      );
      const data = await res.json();
      setMovie(data);

      setIsLoaded(false);
    }
    fetchData();
  }, [selectedId]);
  function handelAdd() {
    const newWatchedMovie = {
      imdbID: movie.imdbID,
      Title: movie.Title,
      Poster: movie.Poster,
      runtime: Number(movie.Runtime.split(" ")[0]),
      imdbRating: Number(movie.imdbRating),
      userRating,
    };

    handelAddWatchedMovie(newWatchedMovie);
    handelCloseMovie();
  }

  return (
    <div className="details">
      {isLoaded ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={handelCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`${title} poster`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDB Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {isWatched ? (
                <>
                  <p>The movie is already Watched! </p>
                  <button className="btn-add" onClick={handelCloseMovie}>
                    Go To Watch List
                  </button>
                </>
              ) : (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                    defaultRating={isWatched ? watchedUserRAting : 0}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handelAdd}>
                      + Add to Watched List
                    </button>
                  )}
                </>
              )}
            </div>
            <p>
              {" "}
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedList({ handelSelectMovie, watched, handelRemove }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <>
      <div className="summary">
        <h2>Movies you watched</h2>
        <div>
          <p>
            <span>#️⃣</span>
            <span>{watched.length} movies</span>
          </p>
          <p>
            <span>⭐️</span>
            <span>{avgImdbRating.toFixed(2)}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{avgUserRating.toFixed(2)}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{avgRuntime} min</span>
          </p>
        </div>
      </div>
      <ul className="list">
        {watched.map((movie) => (
          <li key={movie.imdbID}>
            <img
              src={movie.Poster}
              alt={`${movie.Title} poster`}
              onClick={() => handelSelectMovie(movie.imdbID)}
            />
            <h3 onClick={() => handelSelectMovie(movie.imdbID)}>
              {movie.Title}
            </h3>
            <div>
              <p>
                <span>⭐️</span>
                <span>{movie.imdbRating}</span>
              </p>
              <p>
                <span>🌟</span>
                <span>{movie.userRating}</span>
              </p>
              <p>
                <span>⏳</span>
                <span>{movie.runtime} min</span>
              </p>
              <button
                className="btn-delete"
                onClick={() => handelRemove(movie.imdbID)}
              >
                X
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
