import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export interface Blog {
  _id: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  likes: number;
  comments?: { _id: string }[];
  author?: { name?: string };
  createdAt?: string;
}

export function BlogCard({ blog }: { blog: Blog }) {
  const snippet =
    blog.content.length > 160 ? blog.content.slice(0, 160) + "…" : blog.content;
  const [likes, setLikes] = useState(blog.likes || 0);
  const [liked, setLiked] = useState(false);
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();

  async function onLike() {
    if (!user) return navigate("/signup");
    try {
      const res = await authFetch(`/api/blogs/like/${blog._id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setLikes(data.likes);
      setLiked(data.liked);
    } catch {
      // ignore
    }
  }

  return (
    <article className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition hover:shadow-md">
      {blog.imageUrl ? (
        <img
          src={blog.imageUrl}
          alt={blog.title}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="h-48 w-full bg-gradient-to-br from-indigo-50 to-violet-50" />
      )}
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-100">
            {blog.category}
          </span>
          {blog.author?.name && (
            <span className="text-xs text-muted-foreground">
              by {blog.author.name}
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 text-lg font-semibold tracking-tight group-hover:underline">
          <Link to="#">{blog.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {snippet}
        </p>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <time>
            {blog.createdAt
              ? new Date(blog.createdAt).toLocaleDateString()
              : ""}
          </time>
          <div className="flex items-center gap-4">
            <button
              onClick={onLike}
              className={`inline-flex items-center gap-1 transition ${liked ? "text-rose-600" : "hover:text-foreground"}`}
              aria-pressed={liked}
              aria-label="Like"
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-rose-600" : ""}`} />{" "}
              {likes}
            </button>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-4 w-4" /> {blog.comments?.length ?? 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
