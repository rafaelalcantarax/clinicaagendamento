
/**
 * Resolves the clinic/tenant context for the request.
 * Can use a custom header (x-clinic-slug) or extract from the JWT token.
 */
module.exports = (req, res, next) => {
  const clinicSlug = req.headers['x-clinic-slug'] || req.user?.clinicSlug;
  
  if (!clinicSlug) {
    return res.status(400).json({ error: 'Tenant context missing' });
  }

  req.clinicContext = clinicSlug;
  next();
};
