import { useState, useEffect } from "react";
export function useLocalStorage(initialValue, key) {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return JSON.parse(storedValue) ?? initialValue;
  });
  useEffect(() => {
    localStorage.setItem("watched", JSON.stringify(value));
  }, [value, key]);
  return [value, setValue];
}
