"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "dark") {
      document.documentElement.className = "dark";
      setDark(true);
    }
  }, []);

  const toggle = () => {
    const html = document.documentElement;

    if (html.className === "dark") {
      html.className = "";
      localStorage.setItem("theme", "light");
      setDark(false);
    } else {
      html.className = "dark";
      localStorage.setItem("theme", "dark");
      setDark(true);
    }
  };

  return (
    <button onClick={toggle}>
      {dark ? "☀ Light" : "🌙 Dark"}
    </button>
  );
}