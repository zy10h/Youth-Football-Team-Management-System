console.log('validateMiddleware loaded correctly');
const { validationResult } = require('express-validator');

const validateMiddleware = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  next();
};

module.exports = validateMiddleware;