
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token missing' });
  }
  // Mock verification
  req.user = { id: 'u1', role: 'admin', clinicSlug: 'centro-vita' };
  next();
};
