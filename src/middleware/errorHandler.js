const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'Origin not allowed by CORS policy',
      code: 'CORS_ERROR',
    });
  }

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