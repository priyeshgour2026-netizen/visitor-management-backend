const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);

  // Multer error
  if (err?.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: 'MULTER_ERROR',
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    code: 'SERVER_ERROR',
  });
};

module.exports = {
  notFound,
  errorHandler,
};