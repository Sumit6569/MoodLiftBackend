import Session from "../models/session.model.js";
import { v4 as uuidv4 } from "uuid";

// Create session
export const createSession = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const {
      listenerId,
      sessionType,
      scheduledTime,
      duration = 60,
      topics,
    } = req.body;

    // Generate meeting link (in production, use Twilio/Agora/Zoom API)
    const meetingLink = `https://meet.moodlift.com/${uuidv4()}`;

    const session = await Session.create({
      sessionId: uuidv4(),
      userId,
      listenerId,
      sessionType,
      scheduledTime: new Date(scheduledTime),
      duration,
      meetingLink,
      topics: topics || [],
      status: "scheduled",
    });

    // TODO: Send calendar invites and notifications

    res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

// Get user sessions
export const getUserSessions = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { status, type } = req.query;

    const query = {
      $or: [{ userId }, { listenerId: userId }],
    };

    if (status) {
      query.status = status;
    }
    if (type) {
      query.sessionType = type;
    }

    const sessions = await Session.find(query)
      .sort({ scheduledTime: -1 })
      .limit(50);

    res.json({
      success: true,
      sessions,
      count: sessions.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get upcoming sessions
export const getUpcomingSessions = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const sessions = await Session.getUpcomingSessions(userId);

    res.json({
      success: true,
      sessions,
      count: sessions.length,
    });
  } catch (error) {
    next(error);
  }
};

// Start session
export const startSession = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { sessionId } = req.params;

    const session = await Session.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Verify user is participant
    if (session.userId !== userId && session.listenerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this session",
      });
    }

    session.status = "in_progress";
    session.startTime = new Date();
    await session.save();

    res.json({
      success: true,
      session,
      meetingLink: session.meetingLink,
    });
  } catch (error) {
    next(error);
  }
};

// End session
export const endSession = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { sessionId } = req.params;
    const { notes, moodAfter, aiSummary } = req.body;

    const session = await Session.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Calculate actual duration
    const endTime = new Date();
    const actualDuration = Math.round(
      (endTime - session.startTime) / (1000 * 60)
    );

    session.status = "completed";
    session.endTime = endTime;
    session.actualDuration = actualDuration;

    // Add notes based on role
    if (userId === session.userId) {
      session.notes.userNotes = notes;
      session.mood.after = moodAfter;
    } else if (userId === session.listenerId) {
      session.notes.listenerNotes = notes;
    }

    if (aiSummary) {
      session.notes.aiSummary = aiSummary;
    }

    await session.save();

    // TODO: Trigger payment processing
    // TODO: Send session completion notification

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel session
export const cancelSession = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { sessionId } = req.params;
    const { reason } = req.body;

    const session = await Session.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check if user is participant
    if (session.userId !== userId && session.listenerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this session",
      });
    }

    // Check cancellation policy (24 hours before)
    const hoursUntilSession =
      (session.scheduledTime - new Date()) / (1000 * 60 * 60);
    const refundEligible = hoursUntilSession >= 24;

    session.status = "cancelled";
    session.cancellation = {
      cancelledBy: userId,
      cancelledAt: new Date(),
      reason,
      refundIssued: refundEligible,
    };

    await session.save();

    // TODO: Process refund if eligible

    res.json({
      success: true,
      message: "Session cancelled successfully",
      refundIssued: refundEligible,
      session,
    });
  } catch (error) {
    next(error);
  }
};

// Get session analytics
export const getSessionAnalytics = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { role = "user" } = req.query;

    const query = role === "user" ? { userId } : { listenerId: userId };

    const [totalSessions, completedSessions, upcomingSessions] =
      await Promise.all([
        Session.countDocuments(query),
        Session.countDocuments({ ...query, status: "completed" }),
        Session.countDocuments({
          ...query,
          status: "scheduled",
          scheduledTime: { $gte: new Date() },
        }),
      ]);

    // Get session stats
    const stats = await Session.aggregate([
      { $match: { ...query, status: "completed" } },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: "$actualDuration" },
          avgDuration: { $avg: "$actualDuration" },
        },
      },
    ]);

    // Mood improvement (for users only)
    let moodImprovement = null;
    if (role === "user") {
      const moodData = await Session.aggregate([
        {
          $match: {
            userId,
            status: "completed",
            "mood.before": { $exists: true },
            "mood.after": { $exists: true },
          },
        },
        {
          $project: {
            beforeScore: {
              $switch: {
                branches: [
                  { case: { $eq: ["$mood.before", "very_bad"] }, then: 1 },
                  { case: { $eq: ["$mood.before", "bad"] }, then: 2 },
                  { case: { $eq: ["$mood.before", "neutral"] }, then: 3 },
                  { case: { $eq: ["$mood.before", "good"] }, then: 4 },
                  { case: { $eq: ["$mood.before", "very_good"] }, then: 5 },
                ],
                default: 3,
              },
            },
            afterScore: {
              $switch: {
                branches: [
                  { case: { $eq: ["$mood.after", "very_bad"] }, then: 1 },
                  { case: { $eq: ["$mood.after", "bad"] }, then: 2 },
                  { case: { $eq: ["$mood.after", "neutral"] }, then: 3 },
                  { case: { $eq: ["$mood.after", "good"] }, then: 4 },
                  { case: { $eq: ["$mood.after", "very_good"] }, then: 5 },
                ],
                default: 3,
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            avgBefore: { $avg: "$beforeScore" },
            avgAfter: { $avg: "$afterScore" },
          },
        },
      ]);

      if (moodData.length > 0) {
        moodImprovement = {
          before: moodData[0].avgBefore.toFixed(2),
          after: moodData[0].avgAfter.toFixed(2),
          improvement:
            ((moodData[0].avgAfter - moodData[0].avgBefore) * 20).toFixed(1) +
            "%",
        };
      }
    }

    res.json({
      success: true,
      analytics: {
        totalSessions,
        completedSessions,
        upcomingSessions,
        totalMinutes: stats[0]?.totalMinutes || 0,
        avgDuration: stats[0]?.avgDuration || 0,
        moodImprovement,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get session recording
export const getSessionRecording = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { sessionId } = req.params;

    const session = await Session.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Verify user is participant
    if (session.userId !== userId && session.listenerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this recording",
      });
    }

    if (!session.recordingUrl) {
      return res.status(404).json({
        success: false,
        message: "Recording not available",
      });
    }

    res.json({
      success: true,
      recording: {
        url: session.recordingUrl,
        sessionId: session.sessionId,
        duration: session.actualDuration,
        date: session.scheduledTime,
      },
    });
  } catch (error) {
    next(error);
  }
};
