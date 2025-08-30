import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/site/Layout";
import { Blog, BlogCard } from "@/components/site/BlogCard";
import { SearchAndFilter } from "@/components/site/SearchAndFilter";

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

const sorts = [
  { id: "latest", label: "Latest" },
  { id: "likes", label: "Most Liked" },
];

export default function Explore() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("latest");

  const qParams = useMemo(() => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (category && category !== "All") p.set("category", category);
    return p.toString();
  }, [query, category]);

  const { data } = useQuery<{ blogs: Blog[] }>({
    queryKey: ["explore", qParams],
    queryFn: () => fetcher(`/api/blogs?${qParams}`),
  });

  const blogs = useMemo(() => {
    const list = data?.blogs ?? [];
    if (sort === "likes") return [...list].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    return list; // latest is API default
  }, [data, sort]);

  return (
    <Layout>
      <section className="container py-10 md:py-14">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
            <p className="mt-1 text-muted-foreground">Search and filter approved articles by category and popularity.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Sort by</label>
            <select
              className="rounded-md border bg-transparent px-3 py-2 text-sm"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {sorts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6">
          <SearchAndFilter onChange={(q, c) => { setQuery(q); setCategory(c); }} />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogs?.length ? (
            blogs.map((b) => <BlogCard key={b._id} blog={b} />)
          ) : (
            <div className="col-span-full rounded-xl border bg-card p-8 text-center text-muted-foreground">
              No articles match your criteria.
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
