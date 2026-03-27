
// Mock rate limiter for demo purposes
module.exports = (req, res, next) => {
  // In a real app, use express-rate-limit or redis
  next();
};
