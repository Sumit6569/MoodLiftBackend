import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    authorName: String,
    authorAvatar: String,
    authorRole: {
      type: String,
      enum: ["user", "listener", "admin"],
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    title: String,
    mediaUrls: [String], // Images/videos
    tags: [String], // anxiety, depression, recovery, motivation, etc.
    mood: {
      type: String,
      enum: ["very_bad", "bad", "neutral", "good", "very_good"],
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: [
        "story",
        "question",
        "achievement",
        "support",
        "resource",
        "general",
      ],
      default: "general",
    },
    visibility: {
      type: String,
      enum: ["public", "supporters_only", "private"],
      default: "public",
    },
    likes: [
      {
        userId: String,
        timestamp: Date,
      },
    ],
    comments: [
      {
        commentId: String,
        userId: String,
        userName: String,
        userAvatar: String,
        content: String,
        timestamp: Date,
        likes: [
          {
            userId: String,
            timestamp: Date,
          },
        ],
      },
    ],
    shares: [
      {
        userId: String,
        timestamp: Date,
      },
    ],
    reports: [
      {
        userId: String,
        reason: String,
        timestamp: Date,
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "flagged"],
      default: "approved",
    },
    stats: {
      views: { type: Number, default: 0 },
      likeCount: { type: Number, default: 0 },
      commentCount: { type: Number, default: 0 },
      shareCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Indexes for performance
postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ tags: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ "stats.likeCount": -1 });
postSchema.index({ isPinned: 1, createdAt: -1 });

// Get trending posts (most liked in last 7 days)
postSchema.statics.getTrendingPosts = async function (limit = 10) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return this.find({
    createdAt: { $gte: sevenDaysAgo },
    moderationStatus: "approved",
    isArchived: false,
  })
    .sort({ "stats.likeCount": -1, "stats.commentCount": -1 })
    .limit(limit);
};

// Get posts by category
postSchema.statics.getPostsByCategory = async function (
  category,
  limit = 20,
  skip = 0
) {
  return this.find({
    category,
    moderationStatus: "approved",
    isArchived: false,
  })
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Get user's feed (personalized based on tags)
postSchema.statics.getUserFeed = async function (
  userTags = [],
  limit = 20,
  skip = 0
) {
  const query = {
    moderationStatus: "approved",
    isArchived: false,
  };

  if (userTags.length > 0) {
    query.tags = { $in: userTags };
  }

  return this.find(query)
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Search posts
postSchema.statics.searchPosts = async function (
  searchQuery,
  limit = 20,
  skip = 0
) {
  return this.find({
    $or: [
      { title: { $regex: searchQuery, $options: "i" } },
      { content: { $regex: searchQuery, $options: "i" } },
      { tags: { $regex: searchQuery, $options: "i" } },
    ],
    moderationStatus: "approved",
    isArchived: false,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Update stats
postSchema.methods.updateStats = async function () {
  this.stats.likeCount = this.likes.length;
  this.stats.commentCount = this.comments.length;
  this.stats.shareCount = this.shares.length;
  return this.save();
};

const Post = mongoose.model("Post", postSchema);

export default Post;
