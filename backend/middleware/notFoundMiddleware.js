/**
 * Middleware to handle 404 Not Found routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: error.message,
    statusCode: 404
  });
};

module.exports = { notFound };
