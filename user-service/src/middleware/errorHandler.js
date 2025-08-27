export const errorHandler = (error, req, res) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  // Log error details
  console.error(`Error ${statusCode}: ${message}`, {
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Don't expose error details in production
  const isDevelopment = process.env["NODE_ENV"] === "development";

  res.status(statusCode).json({
    success: false,
    message: isDevelopment ? message : "Something went wrong",
    error: isDevelopment ? error.stack || "" : "",
  });
};

export const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
