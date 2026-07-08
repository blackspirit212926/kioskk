import { Link } from "@tanstack/react-router";
import logo from "@/assets/kiosk-logo.png";
import logoDark from "@/assets/kiosk-logo-dark.png";

export function KioskLogo({ variant = "light", className = "" }: { variant?: "light" | "dark"; className?: string }) {
  return (
    <Link to="/" aria-label="Accueil Kiosk" className={`inline-flex items-center ${className}`}>
      <img
        src={variant === "dark" ? logoDark : logo}
        alt="Kiosk"
        width={140}
        height={40}
        className="h-9 w-auto md:h-10"
        loading="eager"
      />
    </Link>
  );
}
