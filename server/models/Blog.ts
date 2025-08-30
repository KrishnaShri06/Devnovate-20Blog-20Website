import mongoose, { Schema, Types } from "mongoose";

export type BlogStatus = "pending" | "approved" | "rejected" | "hidden";

export interface IComment {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IBlog {
  _id: Types.ObjectId;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  author: Types.ObjectId;
  status: BlogStatus;
  likes: number;
  likedBy: Types.ObjectId[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, required: true, index: true },
    imageUrl: { type: String },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "hidden"], default: "pending", index: true },
    likes: { type: Number, default: 0, index: true },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [CommentSchema],
  },
  { timestamps: true }
);

export const Blog = mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
