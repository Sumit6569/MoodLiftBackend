export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // For now, we'll extract userId from token payload
    // In production, verify with JWT secret
    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );
      req.user = {
        userId: payload.userId || payload.id,
        role: payload.role,
      };
      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    next(error);
  }
};
