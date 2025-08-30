import { Router, RequestHandler } from "express";
import { Blog } from "../models/Blog";
import { requireAdmin, requireAuth } from "../middleware/auth";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

const pending: RequestHandler = async (_req, res) => {
  try {
    const blogs = await Blog.find({ status: "pending" })
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ blogs });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch pending" });
  }
};

const setStatus =
  (status: "approved" | "rejected" | "hidden"): RequestHandler =>
  async (req, res) => {
    try {
      const id = req.params.id;
      const blog = await Blog.findByIdAndUpdate(id, { status }, { new: true });
      if (!blog) return res.status(404).json({ error: "Not found" });
      res.json({ blog });
    } catch (e) {
      res.status(500).json({ error: "Failed to update" });
    }
  };

const remove: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    await Blog.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete" });
  }
};

adminRouter.get("/pending", pending);
adminRouter.post("/blogs/:id/approve", setStatus("approved"));
adminRouter.post("/blogs/:id/reject", setStatus("rejected"));
adminRouter.post("/blogs/:id/hide", setStatus("hidden"));
adminRouter.delete("/blogs/:id", remove);
