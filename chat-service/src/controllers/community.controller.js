import Post from "../models/post.model.js";
import { v4 as uuidv4 } from "uuid";

// Create a new post
export const createPost = async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const {
      content,
      title,
      mediaUrls = [],
      tags = [],
      mood,
      isAnonymous = false,
      category = "general",
      visibility = "public",
    } = req.body;

    // Auto-moderate content (simple keyword check)
    const moderationStatus = moderateContent(content);

    const post = await Post.create({
      postId: uuidv4(),
      authorId: userId,
      authorName: isAnonymous ? "Anonymous" : req.body.authorName,
      authorAvatar: isAnonymous ? null : req.body.authorAvatar,
      authorRole: role,
      content,
      title,
      mediaUrls,
      tags,
      mood,
      isAnonymous,
      category,
      visibility,
      moderationStatus,
      stats: {
        views: 0,
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
      },
    });

    res.status(201).json({
      success: true,
      post,
      message: "Post created successfully!",
    });
  } catch (error) {
    next(error);
  }
};

// Get community feed
export const getCommunityFeed = async (req, res, next) => {
  try {
    const { category, tags, sort = "recent", page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    let posts;

    if (sort === "trending") {
      posts = await Post.getTrendingPosts(parseInt(limit));
    } else if (category) {
      posts = await Post.getPostsByCategory(category, parseInt(limit), skip);
    } else if (tags) {
      const tagArray = tags.split(",");
      posts = await Post.getUserFeed(tagArray, parseInt(limit), skip);
    } else {
      // Default: recent posts
      posts = await Post.find({
        moderationStatus: "approved",
        isArchived: false,
      })
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    const totalPosts = await Post.countDocuments({
      moderationStatus: "approved",
      isArchived: false,
    });

    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single post with comments
export const getPost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findOne({ postId });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Increment view count
    post.stats.views += 1;
    await post.save();

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

// Like/Unlike a post
export const toggleLike = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;

    const post = await Post.findOne({ postId });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user already liked
    const likeIndex = post.likes.findIndex((like) => like.userId === userId);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push({
        userId,
        timestamp: new Date(),
      });
    }

    await post.updateStats();

    res.json({
      success: true,
      liked: likeIndex === -1,
      likeCount: post.stats.likeCount,
    });
  } catch (error) {
    next(error);
  }
};

// Add comment to post
export const addComment = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;
    const { content, userName, userAvatar } = req.body;

    const post = await Post.findOne({ postId });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = {
      commentId: uuidv4(),
      userId,
      userName,
      userAvatar,
      content,
      timestamp: new Date(),
      likes: [],
    };

    post.comments.push(comment);
    await post.updateStats();

    res.status(201).json({
      success: true,
      comment,
      commentCount: post.stats.commentCount,
    });
  } catch (error) {
    next(error);
  }
};

// Delete comment
export const deleteComment = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { postId, commentId } = req.params;

    const post = await Post.findOne({ postId });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const commentIndex = post.comments.findIndex(
      (c) => c.commentId === commentId && c.userId === userId
    );

    if (commentIndex === -1) {
      return res.status(403).json({
        success: false,
        message: "Comment not found or unauthorized",
      });
    }

    post.comments.splice(commentIndex, 1);
    await post.updateStats();

    res.json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error) {
    next(error);
  }
};

// Share post
export const sharePost = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;

    const post = await Post.findOne({ postId });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.shares.push({
      userId,
      timestamp: new Date(),
    });

    await post.updateStats();

    res.json({
      success: true,
      message: "Post shared successfully",
      shareCount: post.stats.shareCount,
    });
  } catch (error) {
    next(error);
  }
};

// Report post
export const reportPost = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;
    const { reason } = req.body;

    const post = await Post.findOne({ postId });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.reports.push({
      userId,
      reason,
      timestamp: new Date(),
    });

    // Auto-flag if multiple reports
    if (post.reports.length >= 3) {
      post.moderationStatus = "flagged";
    }

    await post.save();

    res.json({
      success: true,
      message: "Post reported. Thank you for helping keep our community safe.",
    });
  } catch (error) {
    next(error);
  }
};

// Get user's posts
export const getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const posts = await Post.find({
      authorId: userId,
      isArchived: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPosts = await Post.countDocuments({
      authorId: userId,
      isArchived: false,
    });

    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete post
export const deletePost = async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const { postId } = req.params;

    const post = await Post.findOne({ postId });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Only author or admin can delete
    if (post.authorId !== userId && role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this post",
      });
    }

    post.isArchived = true;
    await post.save();

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Search posts
export const searchPosts = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query required",
      });
    }

    const skip = (page - 1) * limit;
    const posts = await Post.searchPosts(q, parseInt(limit), skip);

    res.json({
      success: true,
      posts,
      query: q,
    });
  } catch (error) {
    next(error);
  }
};

// Simple content moderation
function moderateContent(content) {
  const bannedWords = [
    "spam",
    "scam",
    "buy now",
    "click here",
    // Add more as needed
  ];

  const lowerContent = content.toLowerCase();

  for (const word of bannedWords) {
    if (lowerContent.includes(word)) {
      return "pending"; // Needs manual review
    }
  }

  return "approved"; // Auto-approve
}
