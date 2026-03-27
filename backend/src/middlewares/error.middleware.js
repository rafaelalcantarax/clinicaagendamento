
module.exports = (err, req, res, next) => {
  console.error('[API Error]:', err.stack);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString()
  });
};
