"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        "relative h-9 w-9 rounded-full border border-border",
        "bg-background hover:bg-accent",
        "transition-all duration-200 ease-out",
        "hover:scale-105 hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "flex items-center justify-center"
      )}
      aria-label={theme === "light" ? "עבור למצב כהה" : "עבור למצב בהיר"}
    >
      <div className="relative">
        {theme === "light" ? (
          <Moon className="h-4 w-4 text-foreground transition-transform duration-200" />
        ) : (
          <Sun className="h-4 w-4 text-foreground transition-transform duration-200" />
        )}
      </div>
    </button>
  );
}