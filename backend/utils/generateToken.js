const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for a user
 * @param {string} id - User MongoDB _id
 * @returns {string} Signed JWT Token
 */
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'careerpilot_dev_jwt_secret_key_2026';
  const expiresIn = process.env.JWT_EXPIRE || '30d';

  return jwt.sign({ id }, secret, {
    expiresIn
  });
};

module.exports = generateToken;
