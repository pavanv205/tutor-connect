const errorHandler = (err, req, res, next) => {
  const isAuthError = err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.status === 401 || err.status === 403;
  const isDatabaseError = err.name === 'ValidationError' || err.code === 11000 || err.name.includes('Mongo') || err.message.includes('Mongoose') || err.message.includes('Mongo');

  if (isAuthError) {
    console.error(`[AUTH ERROR] ${req.method} ${req.originalUrl} - Status: ${err.status || 401} - Message: ${err.message}`);
  } else if (isDatabaseError) {
    console.error(`[DATABASE ERROR] ${req.method} ${req.originalUrl} - Message: ${err.message}`);
  } else {
    console.error(`[API SYSTEM ERROR] ${req.method} ${req.originalUrl} - Status: ${err.status || 500} - Message: ${err.message}`);
  }
  console.error('Stack:', err.stack);

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', ')
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
};

module.exports = errorHandler;
