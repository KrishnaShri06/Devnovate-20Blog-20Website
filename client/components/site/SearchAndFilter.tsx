import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  "All",
  "Technology",
  "Product",
  "Design",
  "Business",
  "AI",
  "Engineering",
];

export function SearchAndFilter({
  onChange,
}: {
  onChange: (q: string, category: string) => void;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  return (
    <div className="container flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
      <div className="flex w-full max-w-xl items-center gap-2">
        <Input
          placeholder="Search articles..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onChange(q, cat)}
        />
        <Button onClick={() => onChange(q, cat)}>Search</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCat(c);
              onChange(q, c);
            }}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              cat === c
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
