import { Link } from "@tanstack/react-router";
import logo from "@/assets/kiosk-logo.png";
import logoDark from "@/assets/kiosk-logo-dark.png";
import { useTheme } from "@/hooks/use-theme";

export function KioskLogo({
  variant,
  className = "",
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const { theme } = useTheme();
  const resolved = variant ?? theme;
  return (
    <Link to="/" aria-label="Accueil Kiosk" className={`inline-flex items-center ${className}`}>
      <img
        src={resolved === "dark" ? logoDark : logo}
        alt="Kiosk"
        width={140}
        height={40}
        className="h-9 w-auto md:h-10"
        loading="eager"
      />
    </Link>
  );
}