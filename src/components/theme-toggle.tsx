import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle({
  className = "",
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "pill";
}) {
  const { theme, toggleTheme } = useTheme();
  const toneClass =
    tone === "pill"
      ? "text-sidebar-foreground/85 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
      : "text-foreground hover:bg-surface";
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
      className={`relative items-center justify-center w-10 h-10 rounded-full transition-colors ${toneClass} ${className || "inline-flex"}`}
    >
      <Sun
        className={`w-4.5 h-4.5 absolute transition-all duration-300 ${
          theme === "dark" ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
        }`}
      />
      <Moon
        className={`w-4.5 h-4.5 absolute transition-all duration-300 ${
          theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"
        }`}
      />
    </button>
  );
}
