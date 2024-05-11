import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App v-1";
import StarRating from "./StarRating";
import { useState } from "react";
function Test() {
  const [movies, setMovies] = useState(0);
  return (
    <div>
      <StarRating
        size={24}
        color="red"
        maxRating={5}
        message={["Terrible", "Bad", "Ok", "Good", "Great"]}
        onSetRating={setMovies}
      />
      <p>your rating is {movies}</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />

    {/* <Test /> */}
  </React.StrictMode>
);
