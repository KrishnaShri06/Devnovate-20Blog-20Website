import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/site/Layout";
import { Trending } from "@/components/site/Trending";
import { Blog, BlogCard } from "@/components/site/BlogCard";
import { SearchAndFilter } from "@/components/site/SearchAndFilter";

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export default function Index() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const qParams = useMemo(() => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (category && category !== "All") p.set("category", category);
    return p.toString();
  }, [query, category]);

  const { data: latest, refetch } = useQuery<{ blogs: Blog[] }>({
    queryKey: ["blogs", qParams],
    queryFn: () => fetcher(`/api/blogs?${qParams}`),
  });

  const { data: tr } = useQuery<{ blogs: Blog[] }>({
    queryKey: ["trending"],
    queryFn: () => fetcher(`/api/blogs/trending?days=7`),
  });

  useEffect(() => {
    refetch();
  }, [qParams, refetch]);

  return (
    <Layout>
      <section className="relative">
        <div className="container py-10 md:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700 ring-1 ring-inset ring-indigo-100">
              Devnovate
            </span>
            <h1 className="mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl">
              Innovate. Write. Inspire.
            </h1>
            <p className="mt-3 text-muted-foreground">
              A modern platform to publish ideas, explore insights, and join the conversation.
            </p>
          </div>
          <SearchAndFilter onChange={(q, c) => { setQuery(q); setCategory(c); }} />
        </div>
      </section>

      <Trending blogs={tr?.blogs ?? []} />

      <section className="container py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Latest Articles</h2>
          <span className="text-sm text-muted-foreground">{latest?.blogs?.length ?? 0} results</span>
        </div>
        {latest?.blogs?.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.blogs.map((b) => (
              <BlogCard key={b._id} blog={b} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            No articles yet. Be the first to share your insights!
          </div>
        )}
      </section>

      <section className="container py-10">
        <div className="rounded-2xl border bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-bold">Have an idea worth sharing?</h3>
              <p className="mt-1 text-white/80">Write your first blog and inspire the community.</p>
            </div>
            <a
              href="/write"
              className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow hover:bg-white/90"
            >
              Start Writing
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
