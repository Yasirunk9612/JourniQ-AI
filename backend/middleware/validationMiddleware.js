const validateRequest = (schema) => (req, res, next) => {
  const { error, value } = schema(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }
  req.body = value;
  return next();
};

module.exports = { validateRequest };
