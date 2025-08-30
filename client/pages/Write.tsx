import { Layout } from "@/components/site/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const categories = [
  "Technology",
  "Product",
  "Design",
  "Business",
  "AI",
  "Engineering",
];

export default function Write() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("content", content);
      fd.append("category", category);
      if (image) fd.append("image", image);
      const res = await fetch("/api/blogs", {
        method: "POST",
        body: fd,
        headers: {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit");
      setMessage("Submitted for review. An admin will approve it soon.");
      setTitle("");
      setContent("");
      setImage(null);
    } catch (err: any) {
      setMessage(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <section className="container py-12">
        <div className="mx-auto max-w-3xl rounded-xl border bg-card p-6">
          <h1 className="text-2xl font-bold">Write a Blog</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Share your insights with the Devnovate community.
          </p>
          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Your compelling title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                className="mt-1 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Cover image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your story..."
                className="mt-1 h-56 w-full resize-y rounded-md border bg-transparent p-3 text-sm leading-relaxed"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500"
              >
                {submitting ? "Submitting..." : "Submit for Review"}
              </Button>
              {message && (
                <span className="text-sm text-muted-foreground">{message}</span>
              )}
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
}
