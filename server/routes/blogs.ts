import { Router, RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Blog } from "../models/Blog";
import { requireAuth, requireAdmin } from "../middleware/auth";

export const blogsRouter = Router();

// Multer storage
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage });

// Create blog (pending)
const createBlog: RequestHandler = async (req, res) => {
  try {
    const { title, content, category } = req.body as {
      title: string;
      content: string;
      category: string;
    };
    const imageUrl = (req as any).file
      ? `/uploads/${(req as any).file.filename}`
      : undefined;
    if (!title || !content || !category)
      return res.status(400).json({ error: "Missing fields" });
    const author = req.auth!.sub;
    const blog = await Blog.create({
      title,
      content,
      category,
      imageUrl,
      author,
      status: "pending",
    });
    res.json({ blog });
  } catch (e) {
    res.status(500).json({ error: "Failed to submit blog" });
  }
};

// List blogs (approved by default)
const listBlogs: RequestHandler = async (req, res) => {
  try {
    const { q, category, status, mine } = req.query as any;
    const filter: any = {};
    if (status) filter.status = status;
    else filter.status = "approved";
    if (category) filter.category = category;
    if (q) filter.$text = { $search: q };
    if (mine && req.auth) filter.author = req.auth.sub;

    const blogs = await Blog.find(filter)
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();
    res.json({ blogs });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

// Trending: approved in last 7 days, sort by likes desc, top 5
const trending: RequestHandler = async (req, res) => {
  try {
    const days = Number((req.query.days as string) || 7);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const blogs = await Blog.find({
      status: "approved",
      createdAt: { $gte: since },
    })
      .sort({ likes: -1 })
      .limit(5)
      .lean();
    res.json({ blogs });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch trending" });
  }
};

// Like toggle
const like: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.auth!.sub;
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ error: "Not found" });
    const hasLiked = blog.likedBy.some((u) => u.toString() === userId);
    if (hasLiked) {
      blog.likedBy = blog.likedBy.filter((u) => u.toString() !== userId);
      blog.likes = Math.max(0, blog.likes - 1);
    } else {
      blog.likedBy.push(userId as any);
      blog.likes += 1;
    }
    await blog.save();
    res.json({ likes: blog.likes, liked: !hasLiked });
  } catch (e) {
    res.status(500).json({ error: "Failed to like" });
  }
};

// Comment
const comment: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.auth!.sub;
    const { content } = req.body as { content: string };
    if (!content) return res.status(400).json({ error: "Content required" });
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ error: "Not found" });
    blog.comments.push({
      user: userId as any,
      content,
      createdAt: new Date(),
      _id: new (require("mongoose").Types.ObjectId)(),
    });
    await blog.save();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to comment" });
  }
};

blogsRouter.get("/", listBlogs);
blogsRouter.get("/trending", trending);
blogsRouter.post("/", requireAuth, upload.single("image"), createBlog);
blogsRouter.post("/:id/like", requireAuth, like);
blogsRouter.post("/:id/comment", requireAuth, comment);
// Additional aliases
blogsRouter.post("/like/:id", requireAuth, like);
blogsRouter.post("/comment/:id", requireAuth, comment);

// Aliases to match required spec
blogsRouter.post("/create", requireAuth, upload.single("image"), createBlog);
blogsRouter.get("/my", requireAuth, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.auth!.sub })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ blogs });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch my blogs" });
  }
});
blogsRouter.get("/all", async (_req, res) => {
  try {
    const blogs = await Blog.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ blogs });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});
blogsRouter.post(
  "/approve/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const blog = await Blog.findByIdAndUpdate(
        req.params.id,
        { status: "approved" },
        { new: true },
      );
      if (!blog) return res.status(404).json({ error: "Not found" });
      res.json({ blog });
    } catch (e) {
      res.status(500).json({ error: "Failed to approve" });
    }
  },
);
blogsRouter.post("/reject/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true },
    );
    if (!blog) return res.status(404).json({ error: "Not found" });
    res.json({ blog });
  } catch (e) {
    res.status(500).json({ error: "Failed to reject" });
  }
});
