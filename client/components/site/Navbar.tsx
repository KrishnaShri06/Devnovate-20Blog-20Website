import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { CatLogo } from "./CatLogo";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/", label: "Explore" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-900/60 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="Devnovate home">
          <CatLogo />
          <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Devnovate
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={cn(
              "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
              location.pathname === "/" && "text-foreground"
            )}
          >
            Home
          </Link>
          <a href="#trending" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Trending
          </a>
          <Link
            to="/dashboard"
            className={cn(
              "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
              location.pathname === "/dashboard" && "text-foreground"
            )}
          >
            My Articles
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Log in
          </Button>
          <Button
            onClick={() => navigate("/write")}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500"
          >
            Write
          </Button>
          <Button variant="outline" onClick={() => navigate("/signup")}>Sign up</Button>
          <div className="ml-1">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
