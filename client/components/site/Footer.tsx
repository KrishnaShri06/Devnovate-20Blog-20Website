export function Footer() {
  return (
    <footer className="border-t border-border bg-white/50 dark:bg-zinc-900/50">
      <div className="container py-10 text-sm text-muted-foreground flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Devnovate. All rights reserved.</p>
        <p className="hidden md:block">
          Built with React, Express, and MongoDB.
        </p>
      </div>
    </footer>
  );
}
