
module.exports = (schema) => {
  return (req, res, next) => {
    if (!schema) return next();

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => d.message);
      return res.status(400).json({ 
        error: 'Falha na validação dos dados', 
        details 
      });
    }

    req.body = value;
    next();
  };
};
