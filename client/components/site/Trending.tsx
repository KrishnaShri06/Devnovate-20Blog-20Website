import { Blog, BlogCard } from "./BlogCard";

export function Trending({ blogs }: { blogs: Blog[] }) {
  return (
    <section id="trending" className="container py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Trending</h2>
        <span className="text-sm text-muted-foreground">Last 7 days</span>
      </div>
      {blogs && blogs.length > 0 ? (
        <div className="grid grid-flow-col auto-cols-[minmax(260px,1fr)] gap-4 overflow-x-auto pb-2">
          {blogs.map((b) => (
            <BlogCard key={b._id} blog={b} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
          No trending articles yet.
        </div>
      )}
    </section>
  );
}
