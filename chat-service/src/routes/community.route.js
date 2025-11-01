import { Router } from "express";
import {
  createPost,
  getCommunityFeed,
  getPost,
  toggleLike,
  addComment,
  deleteComment,
  sharePost,
  reportPost,
  getUserPosts,
  deletePost,
  searchPosts,
} from "../controllers/community.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.get("/posts/feed", getCommunityFeed);
router.get("/posts/search", searchPosts);
router.get("/posts/:postId", getPost);
router.get("/users/:userId/posts", getUserPosts);

// Protected routes
router.use(authenticateToken);

router.post("/posts", createPost);
router.post("/posts/:postId/like", toggleLike);
router.post("/posts/:postId/comments", addComment);
router.delete("/posts/:postId/comments/:commentId", deleteComment);
router.post("/posts/:postId/share", sharePost);
router.post("/posts/:postId/report", reportPost);
router.delete("/posts/:postId", deletePost);

export default router;
